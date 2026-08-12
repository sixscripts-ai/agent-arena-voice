import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { voiceFiles } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";

export const MAX_VOICE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil((MAX_VOICE_FILE_BYTES * 4) / 3) + 8;

const allowedMimeTypes = new Set([
  "application/json",
  "application/pdf",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-wav",
  "text/markdown",
  "text/plain",
]);

export const voiceFileInput = z.object({
  fileName: z.string().min(1).max(180),
  mimeType: z.string().min(1).max(128),
  contentBase64: z.string().min(4).max(MAX_BASE64_LENGTH),
  category: z.enum(["reference", "voice-note", "transcript"]),
});

export type VoiceFileInput = z.infer<typeof voiceFileInput>;

export function sanitizeStorageName(fileName: string): string {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return normalized.slice(0, 120) || "voice-file";
}

export function decodeVoiceFile(input: VoiceFileInput): Buffer {
  if (!allowedMimeTypes.has(input.mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This file type is not supported for the voice library.",
    });
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(input.contentBase64)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The upload data is invalid." });
  }

  const bytes = Buffer.from(input.contentBase64, "base64");
  if (!bytes.length || bytes.length > MAX_VOICE_FILE_BYTES) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "Files must be between 1 byte and 8 MB.",
    });
  }
  return bytes;
}

export async function listVoiceFilesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db
    .select()
    .from(voiceFiles)
    .where(eq(voiceFiles.userId, userId))
    .orderBy(desc(voiceFiles.createdAt))
    .limit(100);
}

export async function uploadVoiceFileForUser(userId: number, input: VoiceFileInput) {
  const bytes = decodeVoiceFile(input);
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  const safeName = sanitizeStorageName(input.fileName);
  const storageName = `${randomUUID()}-${safeName}`;
  const { key, url } = await storagePut(
    `voice-files/${userId}/${storageName}`,
    bytes,
    input.mimeType,
  );

  await db.insert(voiceFiles).values({
    userId,
    originalName: input.fileName,
    storageKey: key,
    storageUrl: url,
    mimeType: input.mimeType,
    sizeBytes: bytes.length,
    category: input.category,
  });

  return {
    originalName: input.fileName,
    storageUrl: url,
    mimeType: input.mimeType,
    sizeBytes: bytes.length,
    category: input.category,
  };
}

export async function removeVoiceFileForUser(userId: number, fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  const existing = await db
    .select({ id: voiceFiles.id })
    .from(voiceFiles)
    .where(and(eq(voiceFiles.id, fileId), eq(voiceFiles.userId, userId)))
    .limit(1);

  if (!existing.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "File not found." });
  }

  await db.delete(voiceFiles).where(and(eq(voiceFiles.id, fileId), eq(voiceFiles.userId, userId)));
  return { success: true } as const;
}
