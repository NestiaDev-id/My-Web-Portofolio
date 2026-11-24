const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
  };
};

export type ChatAnswerData = {
  answer: string;
  sessionId: string;
  messageId?: string;
  userMessageId?: string;
  filename?: string;
};

export type VTuberTTSEngine = "pocket-tts-id" | "edge-tts" | "chatterbox-nano";

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
  engine?: VTuberTTSEngine;
  emotion?: string;
  live2d_expression?: string;
  duration_ms: number;
  start_ms: number;
  end_ms: number;
  audio_base64?: string;
};

export type VTuberChatData = {
  sessionId: string;
  rawAnnotatedText: string;
  totalDurationMs: number;
  chunks: VTuberChunk[];
};

export type TTSBenchmarkData = {
  engine: VTuberTTSEngine;
  text: string;
  duration_ms: number;
  synthesis_ms: number;
  sample_rate?: number;
  audio_base64?: string;
  error?: string;
};

export type UploadTaskData = {
  status: string;
  filename: string;
  chunks_added: number;
  collection: string;
};

async function handleApiResponse<T>(response: Response): Promise<T> {
  const json = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !json?.success) {
    const errorMsg =
      json?.error?.message ||
      `Request failed with status ${response.status} (${response.statusText})`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

/**
 * Send text question to API Gateway (/api/v1/chat).
 * Intelligently routes between Groq Fast Chat & HuggingFace RAG, with dual-write history.
 */
export const chatWithRag = async (
  question: string,
  sessionId: string,
  turnstileToken?: string,
): Promise<{ answer: string; sessionId: string }> => {
  const response = await fetch(getApiUrl("/api/v1/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
    },
    body: JSON.stringify({
      question,
      sessionId,
    }),
  });

  return handleApiResponse<ChatAnswerData>(response);
};

/**
 * Send image + optional question to API Gateway (/api/v1/chat/vision).
 * Passes through HuggingFace distributed queue to prevent server sleep/crash.
 */
export const chatVTuber = async (
  question: string,
  sessionId: string,
  turnstileToken: string | undefined,
  options: { enableTts?: boolean; ttsEngine?: VTuberTTSEngine } = {},
): Promise<VTuberChatData> => {
  const response = await fetch(getApiUrl("/api/v1/chat/vtuber"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
    },
    body: JSON.stringify({
      question,
      sessionId,
      enableTts: options.enableTts ?? true,
      ttsEngine: options.ttsEngine ?? "pocket-tts-id",
    }),
  });
  return handleApiResponse<VTuberChatData>(response);
};

export const benchmarkVTuberTTS = async (
  text: string,
  engine: VTuberTTSEngine,
  lang: "id" | "ja" | "en" = "id",
  turnstileToken?: string,
): Promise<TTSBenchmarkData> => {
  const response = await fetch(getApiUrl("/api/v1/chat/vtuber/benchmark"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
    },
    body: JSON.stringify({ text, engine, lang }),
  });
  return handleApiResponse<TTSBenchmarkData>(response);
};

export const chatWithVision = async (
  imageFile: File,
  sessionId: string,
  question: string = "",
  turnstileToken?: string,
): Promise<{ answer: string; filename?: string }> => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("sessionId", sessionId);
  if (question.trim()) {
    formData.append("question", question);
  }

  const response = await fetch(getApiUrl("/api/v1/chat/vision"), {
    method: "POST",
    headers: turnstileToken ? { "X-Turnstile-Token": turnstileToken } : undefined,
    body: formData,
  });

  return handleApiResponse<ChatAnswerData>(response);
};

/**
 * Upload task document to API Gateway (/api/v1/chat/upload-task).
 * Passes through HuggingFace distributed queue for ChromaDB indexing.
 */
export const uploadTask = async (
  file: File,
  sessionId: string,
  turnstileToken?: string,
): Promise<UploadTaskData> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);

  const response = await fetch(getApiUrl("/api/v1/chat/upload-task"), {
    method: "POST",
    headers: turnstileToken ? { "X-Turnstile-Token": turnstileToken } : undefined,
    body: formData,
  });

  return handleApiResponse<UploadTaskData>(response);
};

/**
 * Reset and clear session history on both Redis and MongoDB Atlas.
 */
export const clearChatSession = async (
  sessionId: string,
): Promise<{ sessionId: string; cleared: boolean }> => {
  const response = await fetch(getApiUrl("/api/v1/chat/clear"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });

  return handleApiResponse<{ sessionId: string; cleared: boolean }>(response);
};
