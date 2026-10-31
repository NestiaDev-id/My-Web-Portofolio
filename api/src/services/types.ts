export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
  createdAt: string;
}
