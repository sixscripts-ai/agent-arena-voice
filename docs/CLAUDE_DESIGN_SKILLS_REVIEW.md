# claudedesignskills Repository Review

## Source

Repository: [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)

The repository presents a Claude Code plugin marketplace containing 22 individual skills and five bundles. Its stated focus is 3D/WebGL, animation, interactive web experiences, and modern web development. The marketplace installation instructions target Claude Code, while its individual packages are also documented as uploadable skill ZIPs for Claude-compatible skill interfaces.

## Relevant Skills for Agent Arena

| Skill | Relevance | Recommendation |
| --- | --- | --- |
| `modern-web-design` | Potentially useful for an original product visual system and interaction direction | Review first; likely useful as a complementary reference to Anthropic Design |
| `motion-framer` | Useful for restrained state transition and panel motion in the Execution Workbench | Import only if the prototype needs deliberate motion beyond CSS transitions |
| `rive-interactive` | Useful for a deliberately designed interactive status/agent state element | Not needed for the first workbench pass |
| `gsap-scrolltrigger`, `locomotive-scroll`, `scroll-reveal-libraries` | Optimized for marketing/scroll experiences | Do not import for the artifact-first workbench |
| Three.js, React Three Fiber, Babylon, A-Frame, Vanta, PlayCanvas | 3D/immersive UI tools | Do not import for v1; they risk distracting from code and evidence inspection |
| Animation component libraries, Lottie, Anime.js, React Spring | General animation libraries | Consider only after state and layout are approved |

## Safety and Compatibility

The repository bundles scripts, templates, agents, and slash commands in addition to SKILL.md content. Treat all bundled scripts as untrusted until each is individually reviewed; do not execute setup or generator scripts solely because the repository recommends them. Do not install whole bundles. Avoid imports that overlap with current `frontend-design`, `anthropic-design`, and `web-artifacts-builder` guidance unless their unique purpose is clear.

## Initial Recommendation

For the Execution Workbench, keep the current imported Frontend Design/Web Artifacts Builder stack and review **only `modern-web-design`** next. Defer motion and all 3D/scroll plugins. The prototype needs better information architecture and evidence behavior first, not animation or spatial effects.

## Actual Skill and Script Review

The checked-in `modern-web-design` skill includes useful accessibility, performance, reduced-motion, keyboard-focus, semantic HTML, image-loading, and bundle-splitting guidance. Its `design_audit.py` script is a local static HTML reader: it uses only Python standard-library modules, reads a supplied HTML file, and prints a report or writes a report only to an explicitly supplied output path. It makes no network calls, subprocess calls, or automatic project modifications.

The skill is not a good primary authority for the Execution Workbench visual system because large portions emphasize immersive heroes, scrollytelling, custom cursors, glassmorphism, 3D viewers, and animated data displays. Those patterns conflict with the workbench decision: content-dense, evidence-first, keyboard-friendly, and free from decorative terminal or motion effects.

Use the skill as a **review checklist only**, drawing from its accessibility and performance sections. Do not run its scripts without intentionally selecting an input/output file, and do not follow its hero, scroll, glass, or 3D patterns in the Arena workbench.
