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
    stream: [
      "arena@builder:~$ synthesize --validate policy-boundary",
      "> scope: battle #AA-291 / round 04",
      "> evidence sources reconciled: 02",
      "artifact://policy_guard.ts",
      "> staging result for judge review",
    ],
  },
  {
    side: "Challenger",
    model: "Archer-2",
    accent: "#f5a85a",
    status: "Standby",
    command: "probe --locate context escape",
    artifact: "exploit_report.md",
    stream: [
      "arena@challenger:~$ probe --locate context escape",
      "> scope: battle #AA-291 / round 04",
      "> evidence sources reconciled: 02",
      "artifact://exploit_report.md",
      "> staging result for judge review",
    ],
  },
] as const;

export type BattleParticipant = (typeof battleParticipants)[number];
