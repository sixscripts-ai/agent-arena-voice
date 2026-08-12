# Run Agent Arena Voice on macOS

## Recommended location

Keep development repositories together in `~/Developer`. The recommended installation directory is:

```bash
mkdir -p ~/Developer
cd ~/Developer
```

The GitHub repository is public at `https://github.com/sixscripts-ai/agent-arena-voice.git`. It currently needs the local source snapshot while the sandbox’s outbound DNS issue prevents the first push from this workspace.

## Install the current source snapshot

Download `agent-arena-voice-local-snapshot.zip` from this task. Then, in macOS Terminal, run:

```bash
mkdir -p ~/Developer/agent-arena-voice
unzip ~/Downloads/agent-arena-voice-local-snapshot.zip -d ~/Developer/agent-arena-voice
cd ~/Developer/agent-arena-voice
git init
git add .
git commit -m "Initialize Agent Arena Voice local workspace"
git branch -M main
git remote add origin https://github.com/sixscripts-ai/agent-arena-voice.git
git push -u origin main
```

If prompted, authenticate to GitHub through the browser. This first push populates the public repository from the current snapshot.

## Clone after the repository is populated

After the initial push succeeds, future copies use:

```bash
cd ~/Developer
git clone https://github.com/sixscripts-ai/agent-arena-voice.git
cd agent-arena-voice
```

## Prerequisites

Install the current Node.js LTS release, Git, and pnpm. Homebrew is a convenient option:

```bash
brew install node git pnpm
node --version
pnpm --version
```

## First local run

```bash
cd ~/Developer/agent-arena-voice
pnpm install
pnpm dev
```

The application uses server-side secrets for LiveKit and managed storage. Do not put API secrets in any `VITE_*` variable or commit a real `.env` file. Create a local uncommitted `.env` from `docs/LOCAL_ENV_TEMPLATE.txt` and follow `docs/LOCAL_CONFIGURATION.md` before enabling sign-in, storage, or voice connections.

The project’s database migration and package installation could not be validated in the remote workspace because of temporary DNS failures. Run the migration only after the configured database endpoint is reachable and review `drizzle/migrations/0000_voice_files.sql` first.
