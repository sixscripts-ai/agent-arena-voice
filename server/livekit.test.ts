import { describe, expect, it } from "vitest";

describe("LiveKit token design", () => {
  it("keeps server secret variables out of client-facing source files", async () => {
    const source = await import("node:fs/promises").then(fs => fs.readFile("server/livekit.ts", "utf8"));
    expect(source).toContain('"LIVEKIT_API_SECRET"');
    expect(source).not.toContain("VITE_LIVEKIT_API_SECRET");
    expect(source).toContain("TOKEN_TTL_SECONDS = 5 * 60");
    expect(source).toContain("agentAutoDispatch: false");
    expect(source).toContain("recordingEnabled: false");
  });
});
