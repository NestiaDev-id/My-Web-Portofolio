import { requestToAi } from "./groq";
import { chatWithRag, chatWithVision } from "./rag";

export type AiRoute = "groq-fast" | "huggingface-deep" | "huggingface-vision";

export interface AiRequest {
  question: string;
  sessionId: string;
  image?: File | null;
}

const GROQ_OPTIONS = {
  model: import.meta.env.VITE_GROQ_MODEL ?? "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 1024,
  top_p: 1,
  seed: 42,
};

const DEEP_INTENT =
  /\b(analisis|analisa|jelaskan|rangkum|ringkas|evaluasi|bandingkan|riset|teliti|periksa|cek|extract|ekstrak|berdasarkan file|berdasarkan gambar)\b/i;

export function chooseAiRoute(question: string, image?: File | null): AiRoute {
  if (image) return "huggingface-vision";
  if (DEEP_INTENT.test(question)) return "huggingface-deep";
  return "groq-fast";
}

export async function requestAi({
  question,
  sessionId,
  image,
}: AiRequest): Promise<{
  answer: string;
  route: AiRoute;
}> {
  const route = chooseAiRoute(question, image);

  if (route === "huggingface-vision") {
    if (!image) {
      throw new Error("Gambar tidak tersedia untuk analisis vision.");
    }
    const response = await chatWithVision(image, sessionId, question);
    return { answer: response.answer, route };
  }

  if (route === "huggingface-deep") {
    const response = await chatWithRag(question, sessionId);
    return { answer: response.answer, route };
  }

  return { answer: await requestToAi(question, GROQ_OPTIONS), route };
}
