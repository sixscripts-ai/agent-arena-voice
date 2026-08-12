import { beforeEach, describe, expect, it, vi } from "vitest";

const bridge = vi.hoisted(() => ({
  createVoiceAction: vi.fn(),
  claimVoiceAction: vi.fn(),
  finalizeVoiceAction: vi.fn(),
  createVoiceAsset: vi.fn(),
}));

vi.mock("./arenaBridge", () => ({ arenaBridge: bridge }));

import { consumeVoiceAction, prepareVoiceAction, storeBattleTextAsset } from "./voiceToolStore";

const claims = {
  sub: "arena-user-1",
  battle_id: "battle-1",
  room_name: "arena-voice-room-1",
  aud: "agent-arena-voice-context",
  iat: 1,
  exp: 4_000_000_000,
  jti: "session-1",
};

describe("Voice Appwrite bridge persistence", () => {
  beforeEach(() => {
    process.env.ARENA_VOICE_SIGNING_SECRET = "a-test-only-voice-signing-secret-that-is-long-enough";
    Object.values(bridge).forEach(mock => mock.mockReset());
  });

  it("prepares and claims a payload-bound mutation through the Arena bridge", async () => {
    bridge.createVoiceAction.mockResolvedValue({ ok: true });
    bridge.claimVoiceAction.mockResolvedValue({ ok: true });
    const payload = { saved: true };

    const prepared = await prepareVoiceAction({
      claims,
      tool: "set_battle_saved",
      payload,
      summary: "Save battle battle-1.",
    });

    expect(bridge.createVoiceAction).toHaveBeenCalledWith(
      claims,
      expect.objectContaining({ tool_name: "set_battle_saved", summary: "Save battle battle-1." }),
    );

    await consumeVoiceAction({
      claims,
      tool: "set_battle_saved",
      payload,
      confirmationToken: prepared.confirmationToken,
    });

    expect(bridge.claimVoiceAction).toHaveBeenCalledWith(
      claims,
      expect.any(String),
      expect.objectContaining({ tool_name: "set_battle_saved" }),
    );
  });

  it("routes note bytes to the Appwrite asset bridge instead of local storage", async () => {
    bridge.createVoiceAsset.mockResolvedValue({ kind: "voice-note", title: "Observation", file_id: "appwrite-file-1" });

    const result = await storeBattleTextAsset({
      claims,
      kind: "voice-note",
      title: "Observation",
      text: "The defensive model rejected the injected instruction.",
      mimeType: "text/plain",
    });

    expect(bridge.createVoiceAsset).toHaveBeenCalledWith(
      claims,
      expect.objectContaining({ kind: "voice-note", mime_type: "text/plain", size_bytes: expect.any(Number) }),
    );
    expect(result).toMatchObject({ file_id: "appwrite-file-1" });
  });
});
