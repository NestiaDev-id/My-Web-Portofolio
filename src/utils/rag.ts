const DEFAULT_RAG_BASE_URL = "https://nestiadev-llm-service.hf.space";

const RAG_BASE_URL = (
  import.meta.env.VITE_RAG_API_BASE ?? DEFAULT_RAG_BASE_URL
).replace(/\/$/, "");

type ChatResponse = {
  answer: string;
  context: string[];
};

type UploadResponse = {
  status: string;
  filename: string;
  chunks_added: number;
  collection: string;
};

const parseErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (!text) return response.statusText;
  try {
    const data = JSON.parse(text) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? text;
  } catch {
    return text;
  }
};

export const uploadDocument = async (file: File, sessionId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const response = await fetch(`${RAG_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as UploadResponse;
};

export const chatWithRag = async (
  question: string,
  sessionId: string,
  topK = 3,
) => {
  const response = await fetch(`${RAG_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ChatResponse;
};
