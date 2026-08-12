import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { voiceBattleAssets, voiceToolActions } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import {
  ConfirmationClaims,
  VoiceSessionClaims,
  VoiceToolName,
  issueConfirmationToken,
  stablePayloadHash,
  verifyConfirmationToken,
} from "./voiceToolAuth";

export async function prepareVoiceAction(input: {
  claims: VoiceSessionClaims;
  tool: VoiceToolName;
  payload: unknown;
  summary: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const actionId = randomUUID();
  const payloadHash = stablePayloadHash(input.payload);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await db.insert(voiceToolActions).values({
    id: actionId,
    arenaUserId: input.claims.sub,
    battleId: input.claims.battle_id,
    roomName: input.claims.room_name,
    toolName: input.tool,
    status: "pending",
    payloadHash,
    summary: input.summary.slice(0, 500),
    expiresAt,
  });
  return {
    confirmationRequired: true,
    confirmationToken: issueConfirmationToken({
      actionId,
      arenaUserId: input.claims.sub,
      tool: input.tool,
      payloadHash,
    }),
    summary: input.summary,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function consumeVoiceAction(input: {
  claims: VoiceSessionClaims;
  tool: VoiceToolName;
  payload: unknown;
  confirmationToken: string;
}) {
  const confirmation = verifyConfirmationToken(input.confirmationToken);
  const payloadHash = stablePayloadHash(input.payload);
  assertConfirmationMatches(confirmation, input.claims, input.tool, payloadHash);
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const rows = await db
    .select()
    .from(voiceToolActions)
    .where(
      and(
        eq(voiceToolActions.id, confirmation.action_id),
        eq(voiceToolActions.arenaUserId, input.claims.sub),
        eq(voiceToolActions.status, "pending"),
      ),
    )
    .limit(1);
  const action = rows[0];
  if (!action) throw new Error("confirmation_already_used");
  if (action.expiresAt.getTime() <= Date.now()) throw new Error("expired_confirmation");
  if (action.payloadHash !== payloadHash || action.toolName !== input.tool) throw new Error("confirmation_mismatch");
  const [claimed] = await db
    .update(voiceToolActions)
    .set({ status: "executing" })
    .where(and(eq(voiceToolActions.id, action.id), eq(voiceToolActions.status, "pending")));
  if (!claimed || claimed.affectedRows !== 1) throw new Error("confirmation_already_used");
  return action;
}

export async function finalizeVoiceAction(actionId: string, status: "executed" | "failed", evidence: unknown) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  await db
    .update(voiceToolActions)
    .set({
      status,
      executedAt: new Date(),
      evidenceJson: JSON.stringify(evidence).slice(0, 4000),
    })
    .where(and(eq(voiceToolActions.id, actionId), eq(voiceToolActions.status, "executing")));
}

function assertConfirmationMatches(
  confirmation: ConfirmationClaims,
  claims: VoiceSessionClaims,
  tool: VoiceToolName,
  payloadHash: string,
) {
  if (
    confirmation.sub !== claims.sub ||
    confirmation.tool !== tool ||
    confirmation.payload_hash !== payloadHash
  ) {
    throw new Error("confirmation_mismatch");
  }
}

export async function storeBattleTextAsset(input: {
  claims: VoiceSessionClaims;
  kind: "voice-note" | "report";
  title: string;
  text: string;
  mimeType: "text/plain" | "text/markdown";
}) {
  const bytes = Buffer.from(input.text, "utf8");
  if (!bytes.length || bytes.length > 64 * 1024) throw new Error("asset_size_invalid");
  const safeOwner = stablePayloadHash(input.claims.sub).slice(0, 20);
  const fileName = `${Date.now()}-${randomUUID()}.${input.mimeType === "text/markdown" ? "md" : "txt"}`;
  const { key, url } = await storagePut(
    `battle-assets/${safeOwner}/${input.claims.battle_id}/${fileName}`,
    bytes,
    input.mimeType,
  );
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  await db.insert(voiceBattleAssets).values({
    arenaUserId: input.claims.sub,
    battleId: input.claims.battle_id,
    roomName: input.claims.room_name,
    kind: input.kind,
    title: input.title.slice(0, 180),
    storageKey: key,
    storageUrl: url,
    mimeType: input.mimeType,
    sizeBytes: bytes.length,
  });
  return { kind: input.kind, title: input.title, storageUrl: url, sizeBytes: bytes.length };
}
