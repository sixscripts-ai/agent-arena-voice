# Terminal and Developer-Tool UI Skill Research

## Result

No exact verified skill was found for a ready-made **terminal/code-execution UI**. The relevant verified skills form a complementary set: one establishes an original visual point of view, one accelerates interactive prototype work, and one defines safe real tool interfaces.

| Skill | Use for Agent Arena | Recommendation |
| --- | --- | --- |
| [`frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Establishing a distinctive product direction, typography, hierarchy, and a justified aesthetic risk without generic dashboard patterns | Import and use now |
| [`web-artifacts-builder`](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder) | Building disposable but interactive battle-screen prototypes in React, Tailwind, and shadcn before merging any design into the production frontend | Import for prototype work |
| [`mcp-builder`](https://github.com/anthropics/skills/tree/main/skills/mcp-builder) | Designing clear, limited, tool-using terminal/code-execution controls and tool result contracts when Agent Arena exposes agent actions | Import for the execution/tool layer, not visual design |

## What to Reject

The rejected directions shared three issues: they were too much like generic dashboard skins, they used terminal decoration as a visual motif instead of exposing meaningful work, and they placed too much emphasis on a marketing-style hero rather than the actual object users come to Agent Arena to inspect.

## Revised Direction: Execution Workbench

The recommended replacement is **Execution Workbench**. It is not a dark dashboard and not an esports broadcast. The battle screen should feel like a purpose-built developer environment for reviewing autonomous work.

The primary screen begins with the target and current claim, not a hero headline. The center is an artifact-first workspace with a real diff/file/test reader. A narrow left column holds task input, runtime limits, selected model tools, and the factual battle phase. A narrow right column holds only live run events, tool calls, failing tests, and the judge’s evidence links. The layout uses resizable panes, persistent tabs, command-palette actions, keyboard shortcuts, and a calm neutral palette with one semantic color per status. The terminal exists only where a command stream is actually the right data type.

Use an off-black/stone palette, very restrained blue for selected/focused state, amber only for warnings, red only for failures, green only for passing evidence, and no permanent neon accent. Use a dense grotesk interface face plus a true monospace face for code, commands, artifact hashes, and runtime logs. Avoid large rounded cards, grids used only as decoration, faux terminal scanlines, fake metrics, and generic hero sections.

## Core Battle Screen Structure

1. **Run header:** target, models, elapsed time, status, and explicit controls.
2. **Task and constraints pane:** the objective, sandbox policy, selected skills/tools, and actionable inputs.
3. **Artifact workspace:** files, diffs, test output, submissions, and version history in fixed resizable panes.
4. **Execution trace:** real tool calls, test events, artifact events, and failures grouped by phase.
5. **Evidence-backed judge panel:** verdict, rubric, cited artifacts, uncertainty, and an expandable rationale.
6. **Voice dock:** a minimized controllable companion that never obscures the artifact workspace.

## Source Notes

The `frontend-design` skill explicitly advises grounding design in the subject’s own instruments and artifacts instead of generic templates. The `web-artifacts-builder` skill is appropriate for interactive React/Tailwind prototypes. The `mcp-builder` skill supports clear, typed, narrow tool surfaces for future agent-driven execution controls.

## Import Status

The existing Frontend Design skill was preserved. A distinct validated `anthropic-design` skill package was created from the verified source and is ready to be added to the user's skills under the requested **Anthropic Design** name. The verified Web Artifacts Builder import was confirmed in the signed-in Manus workspace and is processing.
