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
): Promise<{ answer: string; sessionId: string }> => {
  const response = await fetch(getApiUrl("/api/v1/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
export const chatWithVision = async (
  imageFile: File,
  sessionId: string,
  question: string = "",
): Promise<{ answer: string; filename?: string }> => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("sessionId", sessionId);
  if (question.trim()) {
    formData.append("question", question);
  }

  const response = await fetch(getApiUrl("/api/v1/chat/vision"), {
    method: "POST",
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
): Promise<UploadTaskData> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);

  const response = await fetch(getApiUrl("/api/v1/chat/upload-task"), {
    method: "POST",
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
