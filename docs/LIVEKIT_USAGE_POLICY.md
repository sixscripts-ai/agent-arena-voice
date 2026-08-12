# LiveKit Usage Policy

Agent Arena Voice uses the supplied LiveKit Cloud project for browser transport only. A room is never opened automatically, and no background worker is registered or dispatched by this project in the initial release. A user must explicitly select a future **Start voice** control before the server issues a short-lived room token.

The server creates an unpredictable room name and a five-minute participant token. It permits no more than three new room-token requests for the same authenticated user within ten minutes. The browser does not receive LiveKit API credentials; it receives only its temporary join token and the WebSocket URL.

Audio recording, automatic transcript retention, automatic room creation, idle-agent greetings, pre-connection audio buffering, and automatic agent dispatch are disabled by default. The LiveKit worker is not included in this foundation. When a worker is added, it must remain off unless the user explicitly starts a room, must close when the user leaves, and must have a read-only, room-scoped tool surface.

The API secret is stored only as a trusted server-side environment value. It must not appear in frontend code, `VITE_*` variables, committed `.env` files, browser logs, error messages, analytics, or issue reports.
