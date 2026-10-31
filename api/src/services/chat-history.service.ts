import { randomUUID } from "node:crypto";
import { getFullHistory, saveMessageToMongo } from "./mongo.service.js";
import { getRecentHistory, saveMessageToRedis } from "./redis.service.js";
import type { ChatMessage, ChatRole } from "./types.js";

export async function saveMessage(
  sessionId: string,
  role: ChatRole,
  content: string,
  options: Pick<ChatMessage, "modelUsed" | "tokensUsed"> = {},
): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: randomUUID(),
    sessionId,
    role,
    content,
    ...options,
    createdAt: new Date().toISOString(),
  };

  const results = await Promise.allSettled([
    saveMessageToRedis(sessionId, message),
    saveMessageToMongo(message),
  ]);
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length === results.length) {
    throw new Error("Unable to persist message to Redis or MongoDB.");
  }

  for (const failure of failures) {
    console.error("Chat history dual-write failed", failure.reason);
  }

  return message;
}

export async function getHistory(
  sessionId: string,
  limit?: number,
): Promise<ChatMessage[]> {
  try {
    const recentHistory = await getRecentHistory(sessionId, limit);
    if (recentHistory.length > 0) return recentHistory;
  } catch (error) {
    console.error("Redis history read failed; falling back to MongoDB", error);
  }

  return getFullHistory(sessionId, limit);
}
