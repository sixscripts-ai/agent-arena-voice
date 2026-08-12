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
});
