import { createHmac } from "node:crypto";
import "dotenv/config";
import { LiveKitAPI } from "livekit-server-sdk";
import { describe, expect, it } from "vitest";

describe("LiveKit server configuration", () => {
  it("authenticates a server-only room-list request", async () => {
    const apiUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    expect(apiUrl).toMatch(/^wss:\/\//);
    expect(apiKey).toBeTruthy();
    expect(apiSecret).toBeTruthy();

    const api = new LiveKitAPI({ host: apiUrl!, apiKey: apiKey!, secret: apiSecret! });
    const rooms = await api.room.listRooms();
    expect(Array.isArray(rooms)).toBe(true);
  }, 15_000);
});
