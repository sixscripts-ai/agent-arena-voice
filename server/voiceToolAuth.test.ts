import { beforeEach, describe, expect, it } from "vitest";
import {
  issueConfirmationToken,
  issueVoiceToolToken,
  stablePayloadHash,
  verifyConfirmationToken,
  verifyVoiceToolToken,
} from "./voiceToolAuth";

describe("voice tool authorization", () => {
  beforeEach(() => {
    process.env.ARENA_VOICE_SIGNING_SECRET = "test-signing-secret-with-more-than-32-characters";
  });

  it("issues a battle and room scoped tool token", () => {
    const token = issueVoiceToolToken({
      arenaUserId: "arena-user-1",
      battleId: "battle-1",
      roomName: "voice-room-1",
      now: 1_000,
    });
    const claims = verifyVoiceToolToken(token, 1_001);
    expect(claims.sub).toBe("arena-user-1");
    expect(claims.battle_id).toBe("battle-1");
    expect(claims.room_name).toBe("voice-room-1");
  });

  it("rejects a tampered tool token", () => {
    const token = issueVoiceToolToken({
      arenaUserId: "arena-user-1",
      battleId: "battle-1",
      roomName: "voice-room-1",
      now: 1_000,
    });
    expect(() => verifyVoiceToolToken(`${token.slice(0, -2)}aa`, 1_001)).toThrow("invalid_signature");
  });

  it("binds confirmation to the exact normalized payload", () => {
    const hashA = stablePayloadHash({ saved: true, battle_id: "current" });
    const hashB = stablePayloadHash({ battle_id: "current", saved: true });
    expect(hashA).toBe(hashB);
    const token = issueConfirmationToken({
      actionId: "4c25498f-1427-4e5e-b5fb-77e23ad86f08",
      arenaUserId: "arena-user-1",
      tool: "set_battle_saved",
      payloadHash: hashA,
      now: 1_000,
    });
    expect(verifyConfirmationToken(token, 1_001).payload_hash).toBe(hashA);
  });
});
