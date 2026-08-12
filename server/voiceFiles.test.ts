import { describe, expect, it } from "vitest";
import { MAX_VOICE_FILE_BYTES, decodeVoiceFile, sanitizeStorageName } from "./voiceFiles";

describe("voice file validation", () => {
  it("creates safe, portable storage names", () => {
    expect(sanitizeStorageName("Meeting notes (final)!.md")).toBe("Meeting-notes-final-.md");
    expect(sanitizeStorageName("../../")).toBe("voice-file");
  });

  it("accepts an allowed small upload", () => {
    const bytes = decodeVoiceFile({
      fileName: "notes.txt",
      mimeType: "text/plain",
      contentBase64: Buffer.from("voice notes").toString("base64"),
      category: "reference",
    });
    expect(bytes.toString()).toBe("voice notes");
  });

  it("rejects unsupported types and oversized data", () => {
    expect(() => decodeVoiceFile({
      fileName: "script.exe",
      mimeType: "application/octet-stream",
      contentBase64: "YQ==",
      category: "reference",
    })).toThrow("not supported");

    expect(MAX_VOICE_FILE_BYTES).toBe(8 * 1024 * 1024);
  });
});
