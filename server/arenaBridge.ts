import { VoiceSessionClaims } from "./voiceToolAuth";

export class ArenaBridgeError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function baseUrl() {
  const value = process.env.ARENA_API_URL?.replace(/\/+$/, "");
  if (!value) throw new ArenaBridgeError(503, "arena_unavailable", "Agent Arena is not configured.");
  return value;
}

function bridgeToken() {
  const value = process.env.ARENA_VOICE_BRIDGE_TOKEN;
  if (!value || value.length < 32) {
    throw new ArenaBridgeError(503, "arena_unavailable", "Agent Arena bridge authentication is not configured.");
  }
  return value;
}

async function requestArena(
  path: string,
  claims: VoiceSessionClaims,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort, { once: true });
  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Arena-Voice-User": claims.sub,
        "X-Arena-Voice-Battle": claims.battle_id,
        "X-Arena-Voice-Room": claims.room_name,
        Authorization: `Bearer ${bridgeToken()}`,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const safeCode = response.status === 404 ? "not_found" : response.status === 403 ? "forbidden" : "arena_error";
      throw new ArenaBridgeError(response.status, safeCode, `Agent Arena returned ${response.status}.`);
    }
    return payload;
  } catch (error) {
    if (error instanceof ArenaBridgeError) throw error;
    if ((error as Error).name === "AbortError") {
      throw new ArenaBridgeError(504, "arena_timeout", "Agent Arena did not respond in time.");
    }
    throw new ArenaBridgeError(503, "arena_unavailable", "Agent Arena is unavailable.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

export const arenaBridge = {
  getCurrentBattle: (claims: VoiceSessionClaims, signal?: AbortSignal) =>
    requestArena("/voice/battle-context", claims, { signal }),
  getOwnedBattleById: (claims: VoiceSessionClaims, battleId: string, signal?: AbortSignal) =>
    requestArena(`/voice/battles/${encodeURIComponent(battleId)}`, claims, { signal }),
  createBattle: (claims: VoiceSessionClaims, body: unknown, signal?: AbortSignal) =>
    requestArena("/voice/battles", claims, { method: "POST", body, signal }),
  cancelBattle: (claims: VoiceSessionClaims, signal?: AbortSignal) =>
    requestArena(`/voice/battles/${encodeURIComponent(claims.battle_id)}/cancel`, claims, {
      method: "POST",
      body: {},
      signal,
    }),
  setSaved: (claims: VoiceSessionClaims, saved: boolean, signal?: AbortSignal) =>
    requestArena(`/voice/battles/${encodeURIComponent(claims.battle_id)}/saved`, claims, {
      method: "PUT",
      body: { saved },
      signal,
    }),
};
