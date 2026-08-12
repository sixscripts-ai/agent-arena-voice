# Appwrite-First Agent Arena Voice Data Model

## Decision

**Appwrite is the canonical database and file authority for Agent Arena Voice.** It already owns Agent Arena user IDs, battles, saved artifacts, durable events, rounds, and scores. Voice must extend that authority rather than create a second production metadata database.

The separate Voice application remains responsible for the LiveKit transport, Builder HTTP actions, user experience, and short-lived server-to-server calls. It does not receive an Appwrite admin key in browser code and does not make direct browser-to-Appwrite administrative calls.

## Existing Canonical Records

| Appwrite collection | Existing owner | Voice use |
| --- | --- | --- |
| `battles` | Agent Arena backend | Current status, format, model IDs, save state, and ownership (`user_id`). |
| `battle_events` | Event bus / Arena backend | Capped current evidence for active unsaved battles. |
| `rounds` | Arena backend | Approved saved artifacts. |
| `scores` | Arena backend | Completed results and judge data. |

## New Appwrite Collections

The protected Agent Arena backend will create and write these collections when its Voice bridge is approved.

| Collection | Required attributes | Write rule |
| --- | --- | --- |
| `voice_sessions` | `user_id`, `battle_id`, `room_name`, `agent_name`, `dispatch_id`, `status`, `started_at`, `ended_at` | Created only after the backend verifies user ownership and dispatches the Builder agent. |
| `voice_actions` | `user_id`, `battle_id`, `voice_session_id`, `tool_name`, `payload_hash`, `status`, `summary`, `evidence_json`, `expires_at`, `executed_at` | Server writes a pending action, atomically claims it on confirmation, then records execution or safe failure. |
| `voice_assets` | `user_id`, `battle_id`, `voice_session_id`, `kind`, `title`, `file_id`, `mime_type`, `size_bytes`, `created_at` | Server writes metadata after file storage succeeds. |

Add indexes for `(user_id, created_at)`, `(battle_id, created_at)`, and `(voice_session_id, created_at)` to support history, audit, and cleanup queries. The backend must validate the current user owns the addressed battle before every read or write—collection-level IDs alone are never authorization.

## File Storage

Use a dedicated **Appwrite Storage bucket** such as `voice-assets` for note and report bytes. Store only the Appwrite `file_id` in `voice_assets`; do not store file bytes in Appwrite documents or browser local storage. The backend determines a non-guessable file ID and applies user/battle metadata before returning a limited file view URL.

## Handoff Sequence

1. A user presses **Start Voice** while viewing an Arena battle.
2. The Arena backend validates the existing Appwrite user session and calls its existing ownership helper for the selected battle.
3. The backend creates `voice_sessions` with `status=starting`, generates a room name, and calls the Voice server’s private `/api/voice/session` endpoint.
4. The Voice server creates a five-minute LiveKit participant token and explicitly dispatches `arena-guide`. The private Builder metadata carries a different short-lived context token.
5. The Voice server returns the browser participant token to the **Arena backend only**. The backend updates the Appwrite session record with dispatch/room metadata and returns the participant token to its own authenticated frontend.
6. The Arena frontend opens the Voice experience and transfers the participant token in memory using a user-initiated `window.postMessage` to the exact Voice origin, never as a URL query parameter.
7. The Voice browser connects to LiveKit. The Builder agent calls the Voice HTTP actions; every action is backed by the Arena server and Appwrite authority.
8. When the room closes, the backend marks the Appwrite `voice_sessions` record complete. It retains only the approved action audit and user-saved notes/reports.

## What Changes in the Voice Repository

The current Drizzle/MySQL models in this repository are a **development scaffold only**. Do not apply them to a production database if the Appwrite-first design is adopted. The Voice tool path now delegates action preparation, action claims, action finalization, and note/report assets to the Arena bridge so the protected backend can write `voice_sessions`, `voice_actions`, and `voice_assets` through Appwrite.

The voice app retains no long-lived battle copies. It may cache a sanitized current-battle projection in memory for 20 seconds during a connected session only.

## Security Invariants

- The browser gets a LiveKit participant token only; it never receives `arena_voice_context_token`, `ARENA_VOICE_BRIDGE_TOKEN`, an Appwrite API key, or a LiveKit API secret.
- Agent Builder gets the context token only through private dispatch metadata.
- The Voice server treats all Bridge headers and tool inputs as untrusted until a signed context token and Appwrite ownership check succeed.
- Voice write actions use two-step confirmation, a two-minute payload-bound confirmation token, and an Appwrite audit row.
- Notes/reports are not automatically placed into the model prompt. A later explicit sharing feature must redaction-check and scope each use.
