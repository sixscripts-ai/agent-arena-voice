import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createServiceToken(apiKey: string, apiSecret: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: apiKey,
    iat: now,
    nbf: now - 5,
    exp: now + 60,
    video: { roomList: true },
  }));
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", apiSecret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

describe("LiveKit server configuration", () => {
  it("authenticates a server-only room-list request", async () => {
    const apiUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    expect(apiUrl).toMatch(/^wss:\/\//);
    expect(apiKey).toBeTruthy();
    expect(apiSecret).toBeTruthy();

    const serviceToken = createServiceToken(apiKey!, apiSecret!);
    const response = await fetch(
      `${apiUrl!.replace(/^wss:/, "https:")}/twirp/livekit.RoomService/ListRooms`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      },
    );

    expect(response.ok, await response.text()).toBe(true);
  }, 15_000);
});
