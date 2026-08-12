# Agent Arena Voice — Design Direction

## Three Initial Approaches

### Theme Name: Signal Room

**Very Brief Intro:** A precise broadcast-control aesthetic that makes voice status, transcript rhythm, and model activity feel legible and calm. It balances technical authority with a warm human conversational center.

**Probability:** 0.04

### Theme Name: Field Notes Terminal

**Very Brief Intro:** An editorial research notebook with tactile paper texture and sharp technical annotations. Voice interaction feels like speaking with a capable analyst who is taking structured notes beside the live battle.

**Probability:** 0.07

### Theme Name: Arena Frequency

**Very Brief Intro:** A muted, physical communications-console aesthetic built around waveform signals and evidence panels. It makes the user feel connected to a private analysis channel rather than a generic chatbot.

**Probability:** 0.02

## Chosen Approach: Arena Frequency

### Design Movement

Arena Frequency draws from late-modern broadcast operations rooms and contemporary editorial information design. The resulting interface treats live voice as a focused instrument panel: dense where evidence matters, quiet where the user needs to think.

### Core Principles

1. The voice state is the visual anchor: connected, listening, checking, and speaking must be discernible at a glance.
2. Evidence is separate from interpretation: artifacts, transcript, and model context each receive clear structural treatment.
3. Calm contrast beats theatrical glow: confident type, warm surfaces, and a distinctive signal color create clarity without cyberpunk effects.
4. Every interaction must feel deliberate, reversible, and private.

### Color Philosophy

The interface uses an off-black graphite base with parchment-toned content surfaces and a high-chroma **Signal Vermilion** accent. Graphite conveys an analytical workspace; warm neutrals prevent long voice sessions from feeling harsh; vermilion is reserved for live state, recording, and human attention rather than decoration.

### Layout Paradigm

The application uses an asymmetric studio-console composition. A persistent narrow signal rail carries voice state and controls, while an evidence canvas shifts between battle context, artifacts, and the transcript. Mobile collapses the rail into a floating bottom connection panel while retaining the evidence-first order.

### Signature Elements

1. A segmented live waveform that reacts to connection and speech state.
2. A vertical signal rail marked with timestamps, state labels, and a visible connection dot.
3. Evidence cards with clipped editorial corner tags that distinguish source material from the agent’s explanation.

### Interaction Philosophy

Controls should respond with subtle physical feedback: connection changes update the signal rail, microphone state is never ambiguous, and actions visibly explain their consequence. The app asks for microphone permission only after a clear user decision.

### Animation

Use restrained motion: waveform bars shift at low amplitude when idle and move more distinctly while speaking; transcript lines enter upward over 160ms; status transitions crossfade over 140ms. Respect reduced-motion preferences by freezing the waveform in its neutral state and removing movement-based state communication.

### Typography System

Use **Space Grotesk** for headings and navigational labels, **Source Serif 4** for human-readable analysis and transcript emphasis, and **JetBrains Mono** for model IDs, timestamps, and technical evidence. Headlines are compact and left-aligned; body copy uses relaxed leading; technical tokens never compete with main explanations.

### Brand Essence

Agent Arena Voice is a private, evidence-led voice channel for people who need to understand live AI model battles without leaving the moment. Personality: composed, exacting, human.

### Brand Voice

Headlines and CTAs should be decisive, brief, and informative rather than promotional. Example headline: “Talk through the evidence.” Example connection CTA: “Open a private analysis channel.” Generic phrases such as “Welcome to our website” and “Get started today” are prohibited.

### Wordmark & Logo

The logo is an abstract broadcast marker: three offset vertical signal bars intersecting a single horizontal line, suggesting both a waveform and an arena boundary. It appears as a bold emblem without embedded text; the wordmark uses customized Space Grotesk letter spacing when needed.

### Signature Brand Color

**Signal Vermilion — #E94B2E**
