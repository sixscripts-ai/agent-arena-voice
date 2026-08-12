import { randomUUID } from "node:crypto";
import { arenaBridge } from "./arenaBridge";
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
  const actionId = randomUUID();
  const payloadHash = stablePayloadHash(input.payload);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  await arenaBridge.createVoiceAction(input.claims, {
    action_id: actionId,
    tool_name: input.tool,
    payload_hash: payloadHash,
    summary: input.summary.slice(0, 500),
    expires_at: expiresAt.toISOString(),
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
  await arenaBridge.claimVoiceAction(input.claims, confirmation.action_id, {
    tool_name: input.tool,
    payload_hash: payloadHash,
  });
  return { id: confirmation.action_id };
}

export async function finalizeVoiceAction(
  claims: VoiceSessionClaims,
  actionId: string,
  status: "executed" | "failed",
  evidence: unknown,
) {
  await arenaBridge.finalizeVoiceAction(claims, actionId, {
    status,
    evidence_json: JSON.stringify(evidence).slice(0, 4000),
  });
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
  return arenaBridge.createVoiceAsset(input.claims, {
    kind: input.kind,
    title: input.title.slice(0, 180),
    text: input.text,
    mime_type: input.mimeType,
    size_bytes: bytes.length,
  });
}
