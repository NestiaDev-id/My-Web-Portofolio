import { Hono } from "hono";
import { z } from "zod";
import { bodyLimit } from "hono/body-limit";
import {
  clearHistory,
  getActiveHistory,
  getHistory,
  saveMessage,
} from "../services/chat-history.service.js";
import {
  benchmarkVTuberTTS,
  clearLlmServiceSession,
  generateChatAnswer,
  generateVTuberChatAnswer,
  generateVisionAnswer,
  uploadTaskDocument,
} from "../services/llm.service.js";
import { validateJson } from "../middleware/validator.js";
import { verifyTurnstileToken } from "../services/turnstile.service.js";
import { isTurnstileSessionVerified, markTurnstileSessionVerified } from "../services/redis.service.js";

async function requireTurnstile(
  c: any,
  token: string | undefined,
  sessionId?: string,
  allowVerifiedSession = false,
) {
  if (allowVerifiedSession && sessionId && !token && await isTurnstileSessionVerified(sessionId)) {
    return null;
  }

  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1";
  const result = await verifyTurnstileToken(token, ip);
  if (result.ok) {
    if (sessionId) await markTurnstileSessionVerified(sessionId);
    return null;
  }

  return c.json(
    {
      success: false,
      error: {
        code: "TURNSTILE_VERIFICATION_FAILED",
        message: result.error ?? "Verifikasi keamanan gagal.",
      },
      meta: { timestamp: new Date().toISOString() },
    },
    403,
  );
}

const chatSchema = z.object({
  question: z.string().trim().min(1).max(10_000),
  sessionId: z.string().trim().min(1).max(120),
});

export const chatRoutes = new Hono();

chatRoutes.post("/", validateJson(chatSchema), async (c) => {
  const { question, sessionId } = c.get("validatedBody");
  const turnstileFailure = await requireTurnstile(
    c,
    c.req.header("x-turnstile-token") ?? undefined,
    sessionId,
    true,
  );
  if (turnstileFailure) return turnstileFailure;
  const history = await getActiveHistory(sessionId, 20);
  const generated = await generateChatAnswer(question, sessionId, history);
  const userMessage = await saveMessage(sessionId, "user", question);
  const assistantMessage = await saveMessage(sessionId, "assistant", generated.answer, {
    modelUsed: generated.modelUsed,
    tokensUsed: generated.tokensUsed,
  });

  return c.json({
    success: true,
    data: {
      answer: generated.answer,
      sessionId,
      messageId: assistantMessage.id,
      userMessageId: userMessage.id,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

const vtuberChatSchema = z.object({
  question: z.string().trim().min(1).max(10_000),
  sessionId: z.string().trim().min(1).max(120),
  enableTts: z.boolean().optional().default(true),
  ttsEngine: z.enum(["pocket-tts-id", "edge-tts", "chatterbox-nano"]).optional().default("pocket-tts-id"),
});

const vtuberBenchmarkSchema = z.object({
  text: z.string().trim().min(1).max(2_000),
  engine: z.enum(["pocket-tts-id", "edge-tts", "chatterbox-nano"]),
  lang: z.enum(["id", "ja", "en"]).optional().default("id"),
});

chatRoutes.post("/vtuber/benchmark", validateJson(vtuberBenchmarkSchema), async (c) => {
  const turnstileFailure = await requireTurnstile(
    c,
    c.req.header("x-turnstile-token") ?? undefined,
  );
  if (turnstileFailure) return turnstileFailure;

  const { text, engine, lang } = c.get("validatedBody");
  const benchmark = await benchmarkVTuberTTS(text, engine, lang);
  return c.json({
    success: true,
    data: benchmark,
    meta: { timestamp: new Date().toISOString() },
  });
});

chatRoutes.post("/vtuber", validateJson(vtuberChatSchema), async (c) => {
  const { question, sessionId, enableTts, ttsEngine } = c.get("validatedBody");
  const turnstileFailure = await requireTurnstile(
    c,
    c.req.header("x-turnstile-token") ?? undefined,
    sessionId,
    true,
  );
  if (turnstileFailure) return turnstileFailure;

  const history = await getActiveHistory(sessionId, 20);
  const generated = await generateVTuberChatAnswer(
    question,
    sessionId,
    history,
    enableTts,
    ttsEngine,
  );
  await saveMessage(sessionId, "user", question);
  await saveMessage(sessionId, "assistant", generated.rawAnnotatedText, {
    modelUsed: `vtuber-${ttsEngine}`,
  });

  return c.json({
    success: true,
    data: generated,
    meta: { timestamp: new Date().toISOString() },
  });
});

chatRoutes.post(
  "/vision",
  bodyLimit({ maxSize: 10 * 1024 * 1024 }),
  async (c) => {
    const turnstileFailure = await requireTurnstile(
      c,
      c.req.header("x-turnstile-token") ?? undefined,
    );
    if (turnstileFailure) return turnstileFailure;

    const form = await c.req.formData();
    const file = form.get("image") ?? form.get("file");
    const question = String(form.get("question") ?? "").trim();
    const sessionId = String(form.get("sessionId") ?? form.get("session_id") ?? "").trim();

    if (!(file instanceof File) || !sessionId) {
      return c.json(
        {
          success: false,
          error: { code: "INVALID_REQUEST", message: "Image dan sessionId wajib diisi." },
          meta: { timestamp: new Date().toISOString() },
        },
        400,
      );
    }

    const generated = await generateVisionAnswer(file, question, sessionId);
    await saveMessage(
      sessionId,
      "user",
      question || `[Mengirim gambar: ${file.name}]`,
    );
    const assistantMessage = await saveMessage(sessionId, "assistant", generated.answer, {
      modelUsed: generated.modelUsed,
    });

    return c.json({
      success: true,
      data: { answer: generated.answer, sessionId, messageId: assistantMessage.id, filename: file.name },
      meta: { timestamp: new Date().toISOString() },
    });
  },
);

chatRoutes.post(
  "/upload-task",
  bodyLimit({ maxSize: 10 * 1024 * 1024 }),
  async (c) => {
    const turnstileFailure = await requireTurnstile(
      c,
      c.req.header("x-turnstile-token") ?? undefined,
    );
    if (turnstileFailure) return turnstileFailure;

    const form = await c.req.formData();
    const file = form.get("file");
    const sessionId = String(form.get("sessionId") ?? form.get("session_id") ?? "").trim();

    if (!(file instanceof File) || !sessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "File tugas dan sessionId wajib diisi.",
          },
          meta: { timestamp: new Date().toISOString() },
        },
        400,
      );
    }

    const result = await uploadTaskDocument(file, sessionId);
    return c.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  },
);

chatRoutes.get("/history/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const history = await getHistory(sessionId, 100);
  return c.json({
    success: true,
    data: { sessionId, messages: history },
    meta: { timestamp: new Date().toISOString() },
  });
});

chatRoutes.post("/clear", validateJson(z.object({ sessionId: z.string().min(1).max(120) })), async (c) => {
  const { sessionId } = c.get("validatedBody");
  await Promise.allSettled([
    clearHistory(sessionId),
    clearLlmServiceSession(sessionId),
  ]);
  return c.json({
    success: true,
    data: { sessionId, cleared: true },
    meta: { timestamp: new Date().toISOString() },
  });
});
