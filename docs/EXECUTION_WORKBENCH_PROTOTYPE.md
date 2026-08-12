# Execution Workbench Prototype

## Purpose

The prototype tests an artifact-first battle screen for Agent Arena. It deliberately avoids a marketing hero, dashboard card grid, decorative terminal effects, fabricated metrics, and synthetic live activity.

## Screen Structure

| Pane | Job |
| --- | --- |
| Task and constraints | States the actual objective, ownership policy, bounded action policy, audit requirement, models, and fixed prototype budget. |
| Artifact workspace | Provides source, tests, and diff tabs with a file tree and a readable primary artifact. |
| Execution and evidence | Keeps an ordered prototype trace, a judge-evidence state, and a docked Voice entry point adjacent to the artifact. |

## Interactions

The local fixture begins in `ready`. **Run** changes it to `running`, appends the explicit execution event, and then resolves to `completed` with reviewable judge evidence. **Reset** restores the initial fixture. Artifact tabs and file entries change the active reader. Voice Dock opens a compact guidance panel but does not create a LiveKit room.

## Validation

The prototype was served locally at `http://localhost:3000/workbench`. The initial render showed all three panes, task controls, source workspace, execution trace, judge-evidence empty state, and Voice dock. Activating **Run** changed the local fixture to `running` and added the corresponding execution trace entry. This is explicitly labeled a prototype fixture; it does not create a sandbox, call a model, or fabricate production battle data.

The fixture then transitioned to `completed`, appended its test and judge events, and exposed the cited-artifact action. Opening Voice Dock displayed a compact, closable evidence guidance panel while preserving the artifact workspace. It did not create a LiveKit room or request any external resource.
