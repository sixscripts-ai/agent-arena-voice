import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const TOOL_TOKEN_TTL_SECONDS = 10 * 60;
const CONFIRMATION_TTL_SECONDS = 2 * 60;

const toolNameSchema = z.enum([
  "get_battle_context",
  "get_owned_battle_by_id",
  "create_battle",
  "cancel_battle",
  "set_battle_saved",
  "add_voice_note",
  "generate_battle_report",
]);

export type VoiceToolName = z.infer<typeof toolNameSchema>;

const sessionClaimsSchema = z.object({
  aud: z.literal("agent-arena-voice-tools"),
  iss: z.literal("agent-arena-voice"),
  sub: z.string().min(1).max(64),
  battle_id: z.string().min(1).max(64),
  room_name: z.string().min(1).max(160),
  tools: z.array(toolNameSchema).min(1),
  iat: z.number().int(),
  exp: z.number().int(),
  jti: z.string().uuid(),
});

export type VoiceSessionClaims = z.infer<typeof sessionClaimsSchema>;

const confirmationClaimsSchema = z.object({
  aud: z.literal("agent-arena-voice-confirmation"),
  iss: z.literal("agent-arena-voice"),
  sub: z.string().min(1).max(64),
  action_id: z.string().uuid(),
  tool: toolNameSchema,
  payload_hash: z.string().length(64),
  iat: z.number().int(),
  exp: z.number().int(),
  jti: z.string().uuid(),
});

export type ConfirmationClaims = z.infer<typeof confirmationClaimsSchema>;

function signingSecret() {
  const value = process.env.ARENA_VOICE_SIGNING_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ARENA_VOICE_SIGNING_SECRET must contain at least 32 characters");
  }
  return value;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signPayload(payload: Record<string, unknown>) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const unsigned = `${header}.${body}`;
  const signature = createHmac("sha256", signingSecret()).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

function verifySignature(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed_token");
  const [header, body, providedSignature] = parts;
  const unsigned = `${header}.${body}`;
  const expected = createHmac("sha256", signingSecret()).update(unsigned).digest();
  const provided = Buffer.from(providedSignature, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("invalid_signature");
  }
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as unknown;
}

export function issueVoiceToolToken(input: {
  arenaUserId: string;
  battleId: string;
  roomName: string;
  tools?: VoiceToolName[];
  now?: number;
}) {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  return signPayload({
    aud: "agent-arena-voice-tools",
    iss: "agent-arena-voice",
    sub: input.arenaUserId,
    battle_id: input.battleId,
    room_name: input.roomName,
    tools: input.tools ?? toolNameSchema.options,
    iat: now,
    exp: now + TOOL_TOKEN_TTL_SECONDS,
    jti: randomUUID(),
  });
}

export function verifyVoiceToolToken(token: string, now = Math.floor(Date.now() / 1000)) {
  const claims = sessionClaimsSchema.parse(verifySignature(token));
  if (claims.exp <= now) throw new Error("expired_token");
  if (claims.iat > now + 30) throw new Error("invalid_issued_at");
  return claims;
}

export function issueConfirmationToken(input: {
  actionId: string;
  arenaUserId: string;
  tool: VoiceToolName;
  payloadHash: string;
  now?: number;
}) {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  return signPayload({
    aud: "agent-arena-voice-confirmation",
    iss: "agent-arena-voice",
    sub: input.arenaUserId,
    action_id: input.actionId,
    tool: input.tool,
    payload_hash: input.payloadHash,
    iat: now,
    exp: now + CONFIRMATION_TTL_SECONDS,
    jti: randomUUID(),
  });
}

export function verifyConfirmationToken(token: string, now = Math.floor(Date.now() / 1000)) {
  const claims = confirmationClaimsSchema.parse(verifySignature(token));
  if (claims.exp <= now) throw new Error("expired_confirmation");
  if (claims.iat > now + 30) throw new Error("invalid_issued_at");
  return claims;
}

export function assertToolAllowed(claims: VoiceSessionClaims, tool: VoiceToolName) {
  if (!claims.tools.includes(tool)) throw new Error("tool_not_allowed");
}

export function getBearerToken(value: string | undefined) {
  if (!value?.startsWith("Bearer ")) throw new Error("missing_bearer_token");
  const token = value.slice("Bearer ".length).trim();
  if (!token) throw new Error("missing_bearer_token");
  return token;
}

export function stablePayloadHash(value: unknown) {
  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(normalize);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, normalize(item)]),
      );
    }
    return input;
  };
  return createHmac("sha256", signingSecret()).update(JSON.stringify(normalize(value))).digest("hex");
}
