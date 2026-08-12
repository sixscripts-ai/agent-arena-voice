export const BATTLE_TERMINAL_COUNT = 2;
export const BATTLE_TERMINAL_HEIGHT = "h-[34rem] md:h-[36rem]";

export const battleParticipants = [
  {
    side: "Builder",
    model: "Harbor-7",
    accent: "#44d7b6",
    status: "Executing",
    command: "synthesize --validate policy-boundary",
    artifact: "policy_guard.ts",
  },
  {
    side: "Challenger",
    model: "Archer-2",
    accent: "#f5a85a",
    status: "Standby",
    command: "probe --locate context escape",
    artifact: "exploit_report.md",
  },
] as const;

export type BattleParticipant = (typeof battleParticipants)[number];
