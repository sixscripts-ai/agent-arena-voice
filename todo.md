# Agent Arena Voice — Upgrade Checklist

- [x] Confirm the file-storage scope and sensitive-data boundaries for voice-session artifacts and user uploads.
- [x] Upgrade the Agent Arena Voice project to the full-stack template.
- [x] Review the upgraded project structure and file-storage APIs.
- [x] Implement authenticated file upload, listing, and deletion workflows with appropriate client-side guardrails.
- [x] Document retention, redaction, and safe handling rules for voice-related files.
- [ ] Apply and validate the pending `voice_files` database migration when the database endpoint is reachable.
- [ ] Validate the file workflow and application build.
- [ ] Retry creation of the separate private GitHub repository and publish the initialized project state.
- [ ] Attach the local Agent Arena Voice project to `sixscripts-ai/agent-arena-voice` and synchronize the initialized codebase.
- [ ] Verify public Git transport to `sixscripts-ai/agent-arena-voice` and complete the initial source synchronization.
- [ ] Configure the supplied LiveKit project credentials as server-only secrets and verify they never reach the browser bundle.
- [x] Add conservative LiveKit session guardrails: explicit user-start, short-lived room tokens, no recordings, no idle worker session, and read-only tool scope.
