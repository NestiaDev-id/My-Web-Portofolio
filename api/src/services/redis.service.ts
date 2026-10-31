import { Redis } from "@upstash/redis";
import { env } from "../config/env.js";
import type { ChatMessage } from "./types.js";

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Upstash Redis environment variables are not configured.");
  }

  redisClient ??= new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redisClient;
}

function redisKey(sessionId: string): string {
  return `chat:${sessionId}:messages`;
}

export async function saveMessageToRedis(
  sessionId: string,
  message: ChatMessage,
): Promise<void> {
  const redis = getRedisClient();
  const key = redisKey(sessionId);
  await redis.rpush(key, JSON.stringify(message));
  await redis.ltrim(key, -env.REDIS_MAX_HISTORY, -1);
}

export async function getRecentHistory(
  sessionId: string,
  limit = env.REDIS_MAX_HISTORY,
): Promise<ChatMessage[]> {
  const redis = getRedisClient();
  const rawMessages = await redis.lrange<string[]>(redisKey(sessionId), -limit, -1);

  return rawMessages.map((message) => {
    if (typeof message !== "string") {
      return message as unknown as ChatMessage;
    }
    return JSON.parse(message) as ChatMessage;
  });
}

export async function checkRedisHealth(): Promise<"connected"> {
  const redis = getRedisClient();
  await redis.ping();
  return "connected";
}
