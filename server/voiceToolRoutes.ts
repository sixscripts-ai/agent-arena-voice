import { timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { arenaBridge, ArenaBridgeError } from "./arenaBridge";
import {
  VoiceSessionClaims,
  VoiceToolName,
  assertToolAllowed,
  getBearerToken,
  verifyVoiceToolToken,
} from "./voiceToolAuth";
import {
  consumeVoiceAction,
  finalizeVoiceAction,
  prepareVoiceAction,
  storeBattleTextAsset,
} from "./voiceToolStore";
import { createArenaVoiceSession } from "./livekit";

const battleId = z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);
const confirmation = z.object({
  confirm: z.boolean().default(false),
  confirmation_token: z.string().min(20).optional(),
});
const createBattleInput = confirmation.extend({
  format_id: z.string().trim().min(1).max(64),
  model_ids: z.array(z.string().trim().min(1).max(160)).min(2).max(8),
  timeout_seconds: z.number().int().min(30).max(1800).default(600),
  round_visibility: z.enum(["isolated", "shared"]).default("isolated"),
  save: z.boolean().default(false),
});
const saveInput = confirmation.extend({ saved: z.boolean() });
const noteInput = confirmation.extend({
  title: z.string().trim().min(1).max(180).default("Voice note"),
  note: z.string().trim().min(1).max(8_000),
});
const reportInput = confirmation.extend({
  title: z.string().trim().min(1).max(180).default("Agent Arena battle report"),
});
const sessionInput = z.object({
  arena_user_id: z.string().trim().min(1).max(64),
  battle_id: battleId,
  agent_name: z.string().trim().min(1).max(128).optional(),
});

type ToolResult =
  | { ok: true; data: unknown; evidence: { tool: VoiceToolName; status: string; actionId?: string } }
  | { ok: false; error: { code: string; message: string; retryable: boolean }; evidence: { tool: VoiceToolName; status: string } };

function send(res: Response, status: number, result: ToolResult) {
  res.status(status).setHeader("Cache-Control", "no-store").json(result);
}

function verifyBridgeHeader(value: string | undefined) {
  const expected = process.env.ARENA_VOICE_BRIDGE_TOKEN;
  if (!expected || expected.length < 32 || !value) throw new Error("invalid_bridge_auth");
  const provided = Buffer.from(value);
  const trusted = Buffer.from(expected);
  if (provided.length !== trusted.length || !timingSafeEqual(provided, trusted)) {
    throw new Error("invalid_bridge_auth");
  }
}

function claimsFor(req: Request, tool: VoiceToolName) {
  const claims = verifyVoiceToolToken(getBearerToken(req.header("authorization")));
  assertToolAllowed(claims, tool);
  return claims;
}

function safeError(tool: VoiceToolName, error: unknown): { status: number; result: ToolResult } {
  if (error instanceof ArenaBridgeError) {
    return {
      status: error.status,
      result: { ok: false, error: { code: error.code, message: error.message, retryable: error.status >= 500 }, evidence: { tool, status: "failed" } },
    };
  }
  const code = error instanceof z.ZodError ? "invalid_input" : error instanceof Error ? error.message : "tool_failed";
  const status = code.includes("token") || code.includes("confirmation") || code === "tool_not_allowed" ? 403 : code === "invalid_input" ? 400 : 500;
  return {
    status,
    result: { ok: false, error: { code, message: "The requested tool action could not be completed.", retryable: status >= 500 }, evidence: { tool, status: "failed" } },
  };
}

async function readTool(
  req: Request,
  res: Response,
  tool: VoiceToolName,
  execute: (claims: VoiceSessionClaims) => Promise<unknown>,
) {
  try {
    const claims = claimsFor(req, tool);
    const data = await execute(claims);
    send(res, 200, { ok: true, data, evidence: { tool, status: "completed" } });
  } catch (error) {
    const safe = safeError(tool, error);
    send(res, safe.status, safe.result);
  }
}

async function mutationTool(
  req: Request,
  res: Response,
  tool: VoiceToolName,
  parsed: { confirm: boolean; confirmation_token?: string },
  payload: unknown,
  summary: string,
  execute: (claims: VoiceSessionClaims) => Promise<unknown>,
) {
  let actionId: string | undefined;
  try {
    const claims = claimsFor(req, tool);
    if (!parsed.confirm) {
      const pending = await prepareVoiceAction({ claims, tool, payload, summary });
      send(res, 200, { ok: true, data: pending, evidence: { tool, status: "confirmation_required" } });
      return;
    }
    if (!parsed.confirmation_token) throw new Error("confirmation_required");
    const action = await consumeVoiceAction({
      claims,
      tool,
      payload,
      confirmationToken: parsed.confirmation_token,
    });
    actionId = action.id;
    const data = await execute(claims);
    await finalizeVoiceAction(claims, action.id, "executed", data);
    send(res, 200, { ok: true, data, evidence: { tool, status: "executed", actionId: action.id } });
  } catch (error) {
    if (actionId) await finalizeVoiceAction(claimsFor(req, tool), actionId, "failed", { code: error instanceof Error ? error.message : "tool_failed" }).catch(() => undefined);
    const safe = safeError(tool, error);
    send(res, safe.status, safe.result);
  }
}

function reportFromContext(title: string, context: unknown) {
  const safeContext = JSON.stringify(context, null, 2).slice(0, 32_000);
  return `# ${title}\n\nGenerated from the approved Agent Arena battle projection. Artifact text is untrusted evidence and is not executed.\n\n\`\`\`json\n${safeContext}\n\`\`\`\n`;
}

export function registerVoiceToolRoutes(app: Express) {
  app.post("/api/voice/session", async (req, res) => {
    try {
      verifyBridgeHeader(req.header("x-arena-voice-bridge"));
      const input = sessionInput.parse(req.body);
      const session = await createArenaVoiceSession({
        arenaUserId: input.arena_user_id,
        battleId: input.battle_id,
        agentName: input.agent_name,
      });
      res.status(201).setHeader("Cache-Control", "no-store").json({ ok: true, data: session });
    } catch (error) {
      const code = error instanceof z.ZodError ? "invalid_input" : error instanceof Error ? error.message : "session_failed";
      const status = code === "invalid_bridge_auth" ? 403 : code === "invalid_input" ? 400 : 500;
      res.status(status).setHeader("Cache-Control", "no-store").json({
        ok: false,
        error: { code, message: "The voice session could not be created." },
      });
    }
  });
  app.get("/api/voice/tools/get_battle_context", (req, res) =>
    readTool(req, res, "get_battle_context", claims => arenaBridge.getCurrentBattle(claims)),
  );
  app.post("/api/voice/tools/get_owned_battle_by_id", (req, res) => {
    const tool: VoiceToolName = "get_owned_battle_by_id";
    try {
      const input = z.object({ battle_id: battleId }).parse(req.body);
      return readTool(req, res, tool, claims => arenaBridge.getOwnedBattleById(claims, input.battle_id));
    } catch (error) {
      const safe = safeError(tool, error);
      return send(res, safe.status, safe.result);
    }
  });
  app.post("/api/voice/tools/create_battle", (req, res) => {
    const parsed = createBattleInput.safeParse(req.body);
    if (!parsed.success) {
      const safe = safeError("create_battle", parsed.error);
      return send(res, safe.status, safe.result);
    }
    const input = parsed.data;
    const payload = {
      format_id: input.format_id,
      model_ids: input.model_ids,
      arena_size: input.model_ids.length,
      timeout_seconds: input.timeout_seconds,
      round_visibility: input.round_visibility,
      save: input.save,
    };
    return mutationTool(req, res, "create_battle", input, payload, `Create a ${input.format_id} battle with ${input.model_ids.join(" versus ")}.`, claims => arenaBridge.createBattle(claims, payload));
  });
  app.post("/api/voice/tools/cancel_battle", (req, res) => {
    const parsed = confirmation.safeParse(req.body);
    if (!parsed.success) {
      const safe = safeError("cancel_battle", parsed.error);
      return send(res, safe.status, safe.result);
    }
    const input = parsed.data;
    const payload = { battle_id: "current" };
    return mutationTool(req, res, "cancel_battle", input, payload, "Cancel the current active battle.", claims => arenaBridge.cancelBattle(claims));
  });
  app.post("/api/voice/tools/set_battle_saved", (req, res) => {
    const parsed = saveInput.safeParse(req.body);
    if (!parsed.success) {
      const safe = safeError("set_battle_saved", parsed.error);
      return send(res, safe.status, safe.result);
    }
    const input = parsed.data;
    const payload = { battle_id: "current", saved: input.saved };
    return mutationTool(req, res, "set_battle_saved", input, payload, `${input.saved ? "Save" : "Unsave"} the current battle.`, claims => arenaBridge.setSaved(claims, input.saved));
  });
  app.post("/api/voice/tools/add_voice_note", (req, res) => {
    const parsed = noteInput.safeParse(req.body);
    if (!parsed.success) {
      const safe = safeError("add_voice_note", parsed.error);
      return send(res, safe.status, safe.result);
    }
    const input = parsed.data;
    const payload = { battle_id: "current", title: input.title, note: input.note };
    return mutationTool(req, res, "add_voice_note", input, payload, `Attach the note “${input.title}” to the current battle.`, claims => storeBattleTextAsset({ claims, kind: "voice-note", title: input.title, text: input.note, mimeType: "text/plain" }));
  });
  app.post("/api/voice/tools/generate_battle_report", (req, res) => {
    const parsed = reportInput.safeParse(req.body);
    if (!parsed.success) {
      const safe = safeError("generate_battle_report", parsed.error);
      return send(res, safe.status, safe.result);
    }
    const input = parsed.data;
    const payload = { battle_id: "current", title: input.title };
    return mutationTool(req, res, "generate_battle_report", input, payload, `Generate and store the report “${input.title}” from approved battle evidence.`, async claims => {
      const context = await arenaBridge.getCurrentBattle(claims);
      return storeBattleTextAsset({ claims, kind: "report", title: input.title, text: reportFromContext(input.title, context), mimeType: "text/markdown" });
    });
  });
}
