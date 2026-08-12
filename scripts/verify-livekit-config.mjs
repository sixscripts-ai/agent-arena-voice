import { createHmac } from "node:crypto";

const url = process.env.LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!url || !apiKey || !apiSecret) {
  throw new Error("LiveKit environment variables are not available to this verification process.");
}

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
const payload = Buffer.from(JSON.stringify({
  iss: apiKey,
  iat: now,
  nbf: now - 5,
  exp: now + 60,
  video: { roomList: true },
})).toString("base64url");
const signingInput = `${header}.${payload}`;
const signature = createHmac("sha256", apiSecret).update(signingInput).digest("base64url");
const token = `${signingInput}.${signature}`;
const endpoint = `${url.replace(/^wss:/, "https:")}/twirp/livekit.RoomService/ListRooms`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: "{}",
});

if (!response.ok) {
  throw new Error(`LiveKit room-list check failed with HTTP ${response.status}.`);
}

console.log("LiveKit server credential check passed.");
