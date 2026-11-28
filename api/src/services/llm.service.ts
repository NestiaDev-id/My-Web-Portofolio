import { env } from "../config/env.js";
import { executeWithQueue } from "./queue.service.js";
import type { ChatMessage } from "./types.js";

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { total_tokens?: number };
};

const DEEP_FOCUS_INTENT =
  /\b(berdasarkan dokumen|dokumen tugas|file tadi|analisis file|analisa file|analisis dokumen|analisa dokumen|rag|evaluasi|ekstrak|extract|ringkas dokumen|screenshot|gambar|task analysis)\b/i;

function serviceUrl(path: string): string {
  return `${env.LLM_SERVICE_URL?.replace(/\/$/, "")}${path}`;
}

function internalHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (env.LLM_SERVICE_SECRET) {
    headers["X-Internal-Secret"] = env.LLM_SERVICE_SECRET;
  }
  return headers;
}

async function parseResponse(response: Response): Promise<Record<string, unknown>> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      typeof payload.detail === "string"
        ? payload.detail
        : `AI service request failed with status ${response.status}.`,
    );
  }
  return payload;
}

export async function generateChatAnswer(
  question: string,
  sessionId: string,
  history: ChatMessage[],
): Promise<{ answer: string; modelUsed: string; tokensUsed?: number }> {
  if (DEEP_FOCUS_INTENT.test(question)) {
    if (!env.LLM_SERVICE_URL) {
      throw new Error("LLM_SERVICE_URL must be configured for deep-focus requests.");
    }

    const historyPayload = history.map(({ role, content }) => ({ role, content }));
    const payload = await executeWithQueue(async () =>
      parseResponse(
        await fetch(serviceUrl("/chat"), {
          method: "POST",
          headers: internalHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            question,
            session_id: sessionId,
            history: historyPayload,
          }),
        }),
      ),
    );
    const answer = String(payload.answer ?? "").trim();
    if (!answer) throw new Error("Deep-focus service returned an empty answer.");
    return {
      answer,
      modelUsed: "huggingface-llm-service",
    };
  }

  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY or LLM_SERVICE_URL must be configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.GROQ_CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Anda adalah Asisten AI pribadi untuk portfolio NestiaDev. Jawab dengan ramah, ringkas, dan akurat.\n" +
            "Aturan Privasi & Kontak Resmi:\n" +
            "- Kontak resmi NestiaDev HANYA: Email support@nestia.my.id, Website https://nestia.my.id, LinkedIn https://www.linkedin.com/in/yohanes-christian-devano/, GitHub https://github.com/NestiaDev-id.\n" +
            "- DILARANG KERAS membagikan nomor telepon pribadi, WhatsApp pribadi, atau alamat tempat tinggal.\n" +
            "- Jika pengguna menanyakan nomor WhatsApp atau ingin menghubungi langsung, sarankan untuk mengirim email ke support@nestia.my.id atau via LinkedIn.",
        },
        ...history.map(({ role, content }) => ({ role, content })),
        { role: "user", content: question },
      ],
      temperature: 0.2,
      max_tokens: 512,
    }),
  });
  const payload = (await parseResponse(response)) as ChatCompletionResponse;
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("AI service returned an empty answer.");

  return {
    answer,
    modelUsed: env.GROQ_CHAT_MODEL,
    tokensUsed: payload.usage?.total_tokens,
  };
}

export async function generateVisionAnswer(
  file: File,
  question: string,
  sessionId: string,
): Promise<{ answer: string; modelUsed: string }> {
  if (!env.LLM_SERVICE_URL) {
    throw new Error("LLM_SERVICE_URL must be configured for vision requests.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("question", question);
  formData.append("session_id", sessionId);
  const payload = await executeWithQueue(async () =>
    parseResponse(
      await fetch(serviceUrl("/chat-vision"), {
        method: "POST",
        headers: internalHeaders(),
        body: formData,
      }),
    ),
  );
  return { answer: String(payload.answer ?? ""), modelUsed: "llm-service-vision" };
}

export async function uploadTaskDocument(
  file: File,
  sessionId: string,
): Promise<Record<string, unknown>> {
  if (!env.LLM_SERVICE_URL) {
    throw new Error("LLM_SERVICE_URL must be configured for document uploads.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("session_id", sessionId);
  return executeWithQueue(async () =>
    parseResponse(
      await fetch(serviceUrl("/upload-task"), {
        method: "POST",
        headers: internalHeaders(),
        body: formData,
      }),
    ),
  );
}

export type VTuberChunk = {
  seq: number;
  type: "speech" | "paralinguistic";
  text?: string;
  normalized_text?: string;
  lang?: "id" | "ja" | "en";
  mood?: string;
  paralinguistic_event?: string;
  tts_token?: string;
  sfx_asset?: string;
  engine?: "pocket-tts-id" | "kokoro-82m-onnx" | "chatterbox-nano" | "edge-tts";
  emotion?: string;
  live2d_expression?: string;
  duration_ms: number;
  start_ms: number;
  end_ms: number;
  audio_base64?: string;
};

export async function generateVTuberChatAnswer(
  question: string,
  sessionId: string,
  history: ChatMessage[],
  enableTts = true,
  ttsEngine: "pocket-tts-id" | "edge-tts" | "chatterbox-nano" = "pocket-tts-id",
): Promise<{ sessionId: string; rawAnnotatedText: string; totalDurationMs: number; chunks: VTuberChunk[] }> {
  if (!env.LLM_SERVICE_URL) {
    throw new Error("LLM_SERVICE_URL must be configured for VTuber requests.");
  }

  const payload = await executeWithQueue(async () =>
    parseResponse(
      await fetch(serviceUrl("/vtuber/chat"), {
        method: "POST",
        headers: internalHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          session_id: sessionId,
          user_message: question,
          history: history.map(({ role, content }) => ({ role, content })),
          persona_mode: "playful_mentor",
          enable_tts: enableTts,
          tts_engine: ttsEngine,
        }),
      }),
    ),
  );

  return {
    sessionId: String(payload.session_id ?? sessionId),
    rawAnnotatedText: String(payload.raw_annotated_text ?? ""),
    totalDurationMs: Number(payload.total_duration_ms ?? 0),
    chunks: (payload.chunks ?? []) as VTuberChunk[],
  };
}

export async function benchmarkVTuberTTS(
  text: string,
  engine: "pocket-tts-id" | "edge-tts" | "chatterbox-nano",
  lang: "id" | "ja" | "en" = "id",
): Promise<Record<string, unknown>> {
  if (!env.LLM_SERVICE_URL) {
    throw new Error("LLM_SERVICE_URL must be configured for TTS benchmark requests.");
  }

  return executeWithQueue(async () =>
    parseResponse(
      await fetch(serviceUrl("/tts/benchmark"), {
        method: "POST",
        headers: internalHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ text, engine, lang }),
      }),
    ),
  );
}

export async function clearLlmServiceSession(sessionId: string): Promise<void> {
  if (!env.LLM_SERVICE_URL) return;
  try {
    await fetch(serviceUrl("/clear"), {
      method: "POST",
      headers: internalHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (error) {
    console.warn(`[LLM Service] Failed to clear session ${sessionId}:`, error);
  }
}
