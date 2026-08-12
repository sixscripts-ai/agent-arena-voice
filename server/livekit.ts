import { createHmac, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";

const TOKEN_TTL_SECONDS = 5 * 60;
const MAX_TOKENS_PER_WINDOW = 3;
const TOKEN_WINDOW_MS = 10 * 60 * 1000;
const tokenRequests = new Map<number, number[]>();

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function envOrThrow(name: "LIVEKIT_URL" | "LIVEKIT_API_KEY" | "LIVEKIT_API_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Voice connection is not configured yet." });
  }
  return value;
}

function checkTokenRate(userId: number) {
  const now = Date.now();
  const active = (tokenRequests.get(userId) ?? []).filter(time => now - time < TOKEN_WINDOW_MS);
  if (active.length >= MAX_TOKENS_PER_WINDOW) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Please wait a few minutes before opening another voice channel.",
    });
  }
  active.push(now);
  tokenRequests.set(userId, active);
}

export function createLiveKitJoinToken({ userId, room }: { userId: number; room: string }) {
  const apiKey = envOrThrow("LIVEKIT_API_KEY");
  const apiSecret = envOrThrow("LIVEKIT_API_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: apiKey,
    sub: `voice-user-${userId}-${randomUUID().slice(0, 8)}`,
    iat: now,
    nbf: now - 5,
    exp: now + TOKEN_TTL_SECONDS,
    video: {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    },
  }));
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", apiSecret).update(signingInput).digest("base64url");
  return { token: `${signingInput}.${signature}`, expiresAt: (now + TOKEN_TTL_SECONDS) * 1000 };
}

export function createConservativeVoiceConnection(userId: number) {
  checkTokenRate(userId);
  const room = `arena-voice-${randomUUID()}`;
  const { token, expiresAt } = createLiveKitJoinToken({ userId, room });
  return {
    url: envOrThrow("LIVEKIT_URL"),
    room,
    token,
    expiresAt,
    usagePolicy: {
      explicitUserStart: true,
      agentAutoDispatch: false,
      recordingEnabled: false,
      tokenTtlSeconds: TOKEN_TTL_SECONDS,
    },
  };
}
