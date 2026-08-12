# Agent Arena Bridge Contract

The Voice application calls these routes only from its server. The Arena backend must reject a missing or invalid `Authorization: Bearer <ARENA_VOICE_BRIDGE_TOKEN>` value before evaluating a request. It must independently verify that the supplied Arena user owns every addressed battle; headers are hints for audit correlation, not proof of authorization.

| Voice call | Required Arena route | Required authorization and response |
| --- | --- | --- |
| Current context | `GET /voice/battle-context` | Resolve user and current battle from trusted bridge context; return a capped, sanitized battle projection. |
| History lookup | `GET /voice/battles/{battle_id}` | Verify user ownership of the path battle ID. |
| Create battle | `POST /voice/battles` | Verify user identity and validate `format_id`, models, timeout, visibility, and save preference. |
| Cancel current battle | `POST /voice/battles/{battle_id}/cancel` | Verify user ownership and active/cancellable status. |
| Save state | `PUT /voice/battles/{battle_id}/saved` | Verify user ownership and update only save state. |
| Prepare mutation audit | `POST /voice/actions` | Create a pending Appwrite `voice_actions` document. |
| Claim confirmation | `POST /voice/actions/{action_id}/claim` | Atomically transition only the matching pending action to `executing`. |
| Finalize mutation audit | `POST /voice/actions/{action_id}/finalize` | Record executed/failed status and capped evidence. |
| Store note/report | `POST /voice/assets` | Write file bytes to Appwrite Storage and `voice_assets` metadata only after ownership check. |

The Voice application sends `X-Arena-Voice-User`, `X-Arena-Voice-Battle`, and `X-Arena-Voice-Room` for trace correlation. The Arena backend must compare the authenticated bridge session/user with those headers and discard mismatches. It must not accept a browser-provided identifier or an Appwrite client token forwarded from the Voice agent.

The bridge may later be replaced with one signed handoff JWT verified by both applications, but v1 should use the shared server-to-server bridge secret plus independent ownership checks. The secret must be server-only and rotated before any suspected disclosure.
