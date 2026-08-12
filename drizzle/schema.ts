import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const voiceFiles = mysqlTable(
  "voice_files",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    originalName: varchar("originalName", { length: 180 }).notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    storageUrl: varchar("storageUrl", { length: 768 }).notNull(),
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    sizeBytes: int("sizeBytes").notNull(),
    category: mysqlEnum("category", ["reference", "voice-note", "transcript"])
      .default("reference")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("voice_files_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type VoiceFile = typeof voiceFiles.$inferSelect;

export const voiceToolActions = mysqlTable(
  "voice_tool_actions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    arenaUserId: varchar("arenaUserId", { length: 64 }).notNull(),
    battleId: varchar("battleId", { length: 64 }),
    roomName: varchar("roomName", { length: 160 }).notNull(),
    toolName: mysqlEnum("toolName", [
      "get_battle_context",
      "get_owned_battle_by_id",
      "create_battle",
      "cancel_battle",
      "set_battle_saved",
      "add_voice_note",
      "generate_battle_report",
    ]).notNull(),
    status: mysqlEnum("status", ["pending", "executing", "executed", "failed"]).default("pending").notNull(),
    payloadHash: varchar("payloadHash", { length: 64 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    evidenceJson: text("evidenceJson"),
    expiresAt: timestamp("expiresAt").notNull(),
    executedAt: timestamp("executedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("voice_tool_actions_owner_created_idx").on(table.arenaUserId, table.createdAt),
    index("voice_tool_actions_battle_created_idx").on(table.battleId, table.createdAt),
  ],
);

export const voiceBattleAssets = mysqlTable(
  "voice_battle_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    arenaUserId: varchar("arenaUserId", { length: 64 }).notNull(),
    battleId: varchar("battleId", { length: 64 }).notNull(),
    roomName: varchar("roomName", { length: 160 }).notNull(),
    kind: mysqlEnum("kind", ["voice-note", "report"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    storageUrl: varchar("storageUrl", { length: 768 }).notNull(),
    mimeType: varchar("mimeType", { length: 64 }).notNull(),
    sizeBytes: int("sizeBytes").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("voice_battle_assets_owner_battle_idx").on(table.arenaUserId, table.battleId),
  ],
);
