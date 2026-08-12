import { createHmac, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { AccessToken, LiveKitAPI, TrackSource } from "livekit-server-sdk";
import { issueVoiceToolToken } from "./voiceToolAuth";

const TOKEN_TTL_SECONDS = 5 * 60;
const MAX_TOKENS_PER_WINDOW = 3;
const TOKEN_WINDOW_MS = 10 * 60 * 1000;
const tokenRequests = new Map<string, number[]>();

function envOrThrow(name: "LIVEKIT_URL" | "LIVEKIT_API_KEY" | "LIVEKIT_API_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Voice connection is not configured yet." });
  }
  return value;
}

function checkTokenRate(userId: string) {
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

export async function createLiveKitJoinToken({ userIdentity, room }: { userIdentity: string; room: string }) {
  const apiKey = envOrThrow("LIVEKIT_API_KEY");
  const apiSecret = envOrThrow("LIVEKIT_API_SECRET");
  const issuedAt = Date.now();
  const token = new AccessToken(apiKey, apiSecret, {
    identity: `voice-user-${userIdentity}-${randomUUID().slice(0, 8)}`,
    ttl: TOKEN_TTL_SECONDS,
  });
  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canPublishData: false,
    canPublishSources: [TrackSource.MICROPHONE],
    canSubscribe: true,
  });
  return { token: await token.toJwt(), expiresAt: issuedAt + TOKEN_TTL_SECONDS * 1000 };
}

export async function createArenaVoiceSession(input: {
  arenaUserId: string;
  battleId: string;
  agentName?: string;
}) {
  checkTokenRate(input.arenaUserId);
  const room = `arena-voice-${randomUUID()}`;
  const voiceToolToken = issueVoiceToolToken({
    arenaUserId: input.arenaUserId,
    battleId: input.battleId,
    roomName: room,
  });
  const agentName = input.agentName ?? process.env.LIVEKIT_AGENT_NAME ?? "arena-guide";
  const api = new LiveKitAPI();
  await api.agentDispatch.createDispatch(room, agentName, {
    metadata: JSON.stringify({ arena_voice_context_token: voiceToolToken }),
  });
  const { token, expiresAt } = await createLiveKitJoinToken({
    userIdentity: createHmac("sha256", envOrThrow("LIVEKIT_API_SECRET"))
      .update(input.arenaUserId)
      .digest("hex")
      .slice(0, 20),
    room,
  });
  return {
    url: envOrThrow("LIVEKIT_URL"),
    room,
    token,
    expiresAt,
    usagePolicy: {
      explicitUserStart: true,
      agentAutoDispatch: false,
      explicitAgentDispatch: true,
      recordingEnabled: false,
      tokenTtlSeconds: TOKEN_TTL_SECONDS,
    },
  };
}
