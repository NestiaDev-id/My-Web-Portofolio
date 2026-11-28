import { chatWithRag, chatWithVision } from "./rag";

export type AiRoute = "gateway-chat" | "gateway-vision";

export interface AiRequest {
  question: string;
  sessionId: string;
  image?: File | null;
  turnstileToken?: string;
}

export function chooseAiRoute(_question: string, image?: File | null): AiRoute {
  if (image) return "gateway-vision";
  return "gateway-chat";
}

export async function requestAi({
  question,
  sessionId,
  image,
  turnstileToken,
}: AiRequest): Promise<{
  answer: string;
  route: AiRoute;
}> {
  if (image) {
    const response = await chatWithVision(image, sessionId, question, turnstileToken);
    return { answer: response.answer, route: "gateway-vision" };
  }

  const response = await chatWithRag(question, sessionId, turnstileToken);
  return { answer: response.answer, route: "gateway-chat" };
}
