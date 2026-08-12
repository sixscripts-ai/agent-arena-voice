# Local Configuration

Create a local `.env` in the Agent Arena Voice project root and keep it untracked. Copy only the required variable names from `docs/LOCAL_ENV_TEMPLATE.txt`; values should come from the corresponding provider or deployment environment.

```bash
cd ~/Developer/agent-arena-voice
cp docs/LOCAL_ENV_TEMPLATE.txt .env
```

## Server-only values

`JWT_SECRET`, `DATABASE_URL`, `BUILT_IN_FORGE_API_KEY`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are server-only. Never use a `VITE_` prefix for these values, commit them, log them, or add them to browser-accessible configuration.

`LIVEKIT_URL` is the supplied LiveKit Cloud WebSocket URL. The server issues five-minute tokens through `voice.createConnection`; the browser should receive only that temporary token and the URL, not the API key or secret.

## OAuth values

The local authentication flow needs `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and `JWT_SECRET`. The application’s redirect URI is generated from the current browser origin, so the OAuth application must allow:

```text
http://localhost:3000/api/oauth/callback
```

If local OAuth cannot be configured yet, the public sign-in gate still demonstrates the application is running, but protected storage and room-token procedures cannot be used.

## Storage and database values

The managed storage helper requires `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`. The `voice_files` metadata table requires a reachable MySQL/TiDB `DATABASE_URL`.

After setting `DATABASE_URL`, generate a migration from the checked-in schema, review the generated SQL, then apply it:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Optional analytics values

`VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are browser-visible configuration. Leave both blank locally if analytics is not needed; do not put secrets in either value.

## Local checks

After configuring the values, run:

```bash
pnpm test
pnpm check
node scripts/verify-livekit-config-curl.mjs
```

The LiveKit verifier performs a server-side room-list request. It does not create a room, dispatch an agent, record audio, or start a metered voice session.
