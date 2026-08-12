# File Storage Policy

Agent Arena Voice stores file bytes in managed object storage and keeps only user-owned metadata in the `voice_files` database table. A file record contains the unguessable storage key, safe display name, MIME type, byte size, category, owner ID, and creation timestamp. File bytes, credentials, and API keys are never written to the database.

Uploads are authenticated, owned by the signed-in user, limited to 8 MB, and restricted to approved audio, text, Markdown, JSON, and PDF MIME types. The client validates type and size before upload; the server repeats those checks and creates an unpredictable storage key. A user can list and remove only their own metadata rows. Removing a file removes the application reference and future use of the key; the managed storage helper does not expose object deletion.

The live voice agent has no access to this library in the initial release. A file must never be inserted into an agent prompt, transcript, or tool response automatically. Any future sharing feature must require a deliberate user action, a clear purpose, a room-scoped authorization check, file-type-specific redaction, and a size-limited extract rather than the full object.

Users must not upload passwords, API keys, tokens, personal identity documents, payment data, or unredacted sensitive conversation recordings. The UI warns users of this boundary before upload. The application avoids logging file bytes, storage URLs, authorization headers, or raw file names in analytics and error reports.
