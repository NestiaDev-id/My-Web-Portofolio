import { chatWithRag } from "./rag";

export const requestToAi = async (
  content: string,
  _option?: unknown,
): Promise<string> => {
  const result = await chatWithRag(content, "legacy-session");
  return result.answer;
};
