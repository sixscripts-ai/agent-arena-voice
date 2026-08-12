import { describe, expect, it } from "vitest";
import { BATTLE_TERMINAL_COUNT, BATTLE_TERMINAL_HEIGHT, battleParticipants } from "./BattleLayout";

describe("Battle terminal contract", () => {
  it("defines exactly two terminal participants", () => {
    expect(BATTLE_TERMINAL_COUNT).toBe(2);
    expect(battleParticipants).toHaveLength(BATTLE_TERMINAL_COUNT);
    expect(new Set(battleParticipants.map(participant => participant.side))).toEqual(new Set(["Builder", "Challenger"]));
  });

  it("keeps terminal windows at bounded fixed visual heights", () => {
    expect(BATTLE_TERMINAL_HEIGHT).toContain("h-[34rem]");
    expect(BATTLE_TERMINAL_HEIGHT).toContain("md:h-[36rem]");
  });

  it("provides a typed command stream for each terminal", () => {
    battleParticipants.forEach(participant => {
      expect(participant.stream.length).toBeGreaterThan(3);
      expect(participant.stream[0]).toContain(`arena@${participant.side.toLowerCase()}`);
      expect(participant.stream).toContain(`artifact://${participant.artifact}`);
    });
  });
});
