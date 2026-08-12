import { execFile } from "node:child_process";
import { createHmac } from "node:crypto";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
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

try {
  const { stdout } = await execFileAsync("curl", [
    "--silent",
    "--show-error",
    "--fail-with-body",
    "--connect-timeout", "10",
    "--max-time", "20",
    "-X", "POST",
    "-H", `Authorization: Bearer ${token}`,
    "-H", "Content-Type: application/json",
    "--data", "{}",
    endpoint,
  ], { maxBuffer: 1024 * 64 });
  JSON.parse(stdout || "{}");
  console.log("LiveKit server credential check passed.");
} catch (error) {
  const message = error instanceof Error ? error.message : "LiveKit credential check failed.";
  throw new Error(message.replace(token, "[redacted token]"));
}
