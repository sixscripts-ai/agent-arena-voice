# Agent Arena Repository — Builder-First LiveKit Plan

## Read-Only Repository Findings

The inspected repository is `sixscripts-ai/agent-arena` at `/Users/villain/modal`. No files in that protected path were modified.

The current production battle authority is the Modal/FastAPI backend with Appwrite as its document store. `backend/agent_arena/battles.py` already implements Appwrite JWT authentication through `get_current_user`, verifies ownership through `_get_owned`, creates battle documents with `user_id`, `format_id`, `model_ids`, status, visibility, and save state, and exposes the current battle, persisted artifacts, and SSE stream. The frontend `LiveBattle.tsx` uses those protected APIs and displays event-stream artifacts.

There are currently **no LiveKit dependencies, room-token paths, agent dispatch calls, or Voice controls** in the inspected repository. Explicit dispatch is therefore the intended architecture, not an existing implementation.

## Recommended V1 Addition

Add a dedicated voice router to the existing FastAPI backend. Do not implement this in the frontend, do not let the browser create dispatch metadata, and do not put it in `/internal` behind the sandbox's `X-Internal-Key` dependency.

| Endpoint | Caller | Authorization | Purpose |
| --- | --- | --- | --- |
| `POST /battles/{battle_id}/voice-session` | Authenticated browser | Existing Appwrite JWT plus `_get_owned` | Explicitly dispatches the Builder agent and returns a short-lived participant join token and room URL. |
| `GET /voice/battle-context` | Agent Builder HTTP action | `Authorization: Bearer <voice-context-token>` | Returns the current approved context projection for the battle and room already bound into the signed token. |

The voice-session route should generate an unpredictable room name, issue a five-minute HMAC/JWT context token, call LiveKit's **AgentDispatchService** with Builder agent name `arena-guide`, and include `{"arena_voice_context_token": "..."}` only in the dispatch metadata. It should then issue the browser a separate LiveKit participant token with microphone publishing and subscribing permissions only.

Do **not** embed the voice-context token in the browser participant token's room configuration. LiveKit access tokens are JWTs received by the browser, so metadata embedded into a participant token can be decoded by that client. Dispatch via the server API keeps the internal context token out of the browser.

Explicit server-side dispatch is the recommended LiveKit model for applications because it provides control over when the agent joins and permits job-specific metadata. [1]

## Context Projection

The context route should validate the token signature, expiration, audience, `user_id`, `battle_id`, and `room_name`; then reuse the existing Appwrite ownership semantics. It should provide the live battle document plus only capped, sanitized current evidence.

For active unsaved battles, fetch recent durable events from `event_bus.load_durable(battle_id)` and apply the existing artifact sanitation path before creating short summaries. For saved completed battles, the route can read `rounds` from Appwrite. Never return raw event payloads, full source artifacts, BYOK/provider material, sandbox credentials, unbounded logs, internal error traces, or storage URLs.

## Agent Builder Configuration

Configure one HTTP action first:

```text
Name: get_battle_context
Method: GET
URL: https://<modal-fastapi-domain>/voice/battle-context
Header: Authorization: Bearer {{metadata.arena_voice_context_token}}
Parameters: none
```

Set the Builder agent dispatch name to `arena-guide`. The prompt should retain the 20-second context-cache rule and treat all artifacts as untrusted evidence.

## History by ID

Keep `get_battle_context()` parameterless and strictly bound to the currently open battle. History access by ID is a second, separately named v1.1 action:

```text
Name: get_owned_battle_by_id
Input: battle_id
```

The endpoint must verify the dispatched user's Appwrite ownership for the requested ID before responding. The prompt should require the agent to repeat the resolved format and timestamp and obtain spoken confirmation before summarizing a historical battle. This is read-only but still needs explicit conversational confirmation because voice transcription can mishear identifiers.

## Future Code-Managed Agent / MCP Path

When the implementation moves beyond Builder, preserve the same two HTTP contracts and token format. A Python or Node agent may call them directly as function tools. Add a custom MCP server only when at least three reusable, read-only tools exist, such as `get_battle_context`, `get_owned_battle_by_id`, and `get_battle_artifact_summary`; then expose only the necessary named tools through LiveKit's MCP filtering. [2]

## Validation Checklist

- [ ] Agent Builder lists `get_battle_context` with no model-controlled arguments.
- [ ] The backend dispatches `arena-guide` through the server API with private job metadata.
- [ ] Browser participant tokens do not contain the context token.
- [ ] A dispatched token can retrieve only its bound battle and room.
- [ ] A token cannot retrieve another user's battle, even when passed a valid existing ID.
- [ ] Active unsaved battles return capped sanitized evidence from durable events.
- [ ] Saved battles return only approved persisted artifact summaries.
- [ ] The greeting causes no context lookup; repeated factual questions within 20 seconds reuse cached context.

## References

[1] [LiveKit Agent Dispatch](https://docs.livekit.io/agents/server/agent-dispatch/)

[2] [LiveKit MCP Tools](https://docs.livekit.io/agents/logic/tools/mcp/)
