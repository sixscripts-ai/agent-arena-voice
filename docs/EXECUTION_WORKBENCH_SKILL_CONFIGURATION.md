# Execution Workbench Skill Configuration

## Operating Model

Add the four attached skill cards to Manus. They are **guidance and review skills**, not application plugins or runtime dependencies. Do not enable all four for every UI request. Assign one primary skill to a change, then use a second skill only for a narrow review pass.

| Skill | Primary owner | Invoke when | Do not invoke when |
| --- | --- | --- | --- |
| Modern Web Design Workbench | Information architecture and responsive behavior | Reworking pane hierarchy, task controls, artifact visibility, mobile layout, accessibility, or visual density | Adding an isolated animation or a single component pattern |
| Motion Framer Workbench | State transition behavior | A drawer, tab, run status, or trace item needs purposeful enter/exit motion | The work is static layout, terminal output, an error state, or keyboard action feedback |
| Rive Interactive Workbench | One truthful visual runtime state machine | A real agent/run lifecycle needs a compact interactive indicator driven by backend events | Building a hero, decorative animation, dashboard background, or prototype timer |
| Animated Component Libraries Workbench | Pattern evaluation | A specific interaction needs comparison against Magic UI, React Bits, AOS, Anime.js, or Lottie patterns | Selecting a whole library, adding dependencies, or replacing existing shadcn components by default |

## Default Change Sequence

1. Start with **Modern Web Design Workbench** to define the evidence-first layout and state hierarchy.
2. Build the static interaction with existing React, Tailwind, and shadcn primitives.
3. Use **Animated Component Libraries Workbench** only if one interaction needs a proven pattern that does not already exist locally.
4. Use **Motion Framer Workbench** after static behavior is accepted, keeping motion to state explanation.
5. Use **Rive Interactive Workbench** only after a real production state source and accessibility fallback are defined.

## Ready-to-Use Manus Prompts

### Layout and Information Architecture

```text
Use Modern Web Design Workbench to review the Execution Workbench’s Read & Write Fixture, execution trace, and judge evidence hierarchy. Preserve the three-pane developer-tool layout. Propose only changes that improve code/evidence inspection, keyboard navigation, responsive pane collapse, or accessibility. Reject marketing-page, hero, glass, scroll, fake terminal, and decorative 3D patterns.
```

### A Specific Transition

```text
Use Motion Framer Workbench to add a reduced-motion-safe transition for the Judge Evidence drawer. Keep keyboard actions instant, animate only opacity and transform, use a 160–220ms transition, and do not add a dependency unless Framer Motion is already approved.
```

### Real Runtime State Visual

```text
Use Rive Interactive Workbench to decide whether a compact run-state machine is justified for Agent Arena. Map only observed states—idle, queued, executing, awaiting confirmation, blocked, completed, failed—to explicit backend events. Return a text/icon fallback and do not implement a Rive asset unless the state contract is approved.
```

### Component Pattern Evaluation

```text
Use Animated Component Libraries Workbench to compare existing shadcn patterns with one candidate interaction pattern for the Voice dock. Prefer a local implementation. Evaluate keyboard behavior, reduced motion, bundle cost, and evidence-workspace fit. Do not install a library without asking.
```

## Non-Negotiable Workbench Constraints

- The Read & Write Fixture is the primary work surface.
- Tool calls, test results, diffs, and judge evidence must stay factual and observable.
- Voice is a docked companion, not a modal obstruction or fake active session.
- No fake metrics, generated reviews, synthetic scores, or simulated production logs.
- No 3D, smooth scrolling, parallax, page-transition, or scroll-reveal additions in the core workbench.
- All added motion must respect `prefers-reduced-motion`.
- No new package, asset, code generator, or external script runs without explicit approval.

## Review Checklist

Before merging a workbench UI change, confirm that the chosen skill had a narrow role, the center artifact is more legible, the action state is clearer, and no visual treatment implies an unobserved backend event.
