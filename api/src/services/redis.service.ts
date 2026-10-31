import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env.js";
import type { ChatMessage } from "./types.js";

type RedisClient = RedisClientType;

let redisClient: RedisClient | null = null;
let redisConnection: Promise<RedisClient> | null = null;

async function getRedisClient(): Promise<RedisClient> {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured.");
  }

  if (redisClient?.isReady) return redisClient;

  redisConnection ??= (async () => {
    const client = createClient({ url: env.REDIS_URL });
    client.on("error", (error) => console.error("Redis client error", error));
    await client.connect();
    redisClient = client;
    return client;
  })();

  try {
    return await redisConnection;
  } catch (error) {
    redisConnection = null;
    throw error;
  }
}

function redisKey(sessionId: string): string {
  return `chat:${sessionId}:messages`;
}

export async function saveMessageToRedis(
  sessionId: string,
  message: ChatMessage,
): Promise<void> {
  const redis = await getRedisClient();
  const key = redisKey(sessionId);
  await redis.rPush(key, JSON.stringify(message));
  await redis.lTrim(key, -env.REDIS_MAX_HISTORY, -1);
}

export async function getRecentHistory(
  sessionId: string,
  limit = env.REDIS_MAX_HISTORY,
): Promise<ChatMessage[]> {
  const redis = await getRedisClient();
  const rawMessages = await redis.lRange(redisKey(sessionId), -limit, -1);

  return rawMessages.map((message) => JSON.parse(message) as ChatMessage);
}

export async function checkRedisHealth(): Promise<"connected"> {
  const redis = await getRedisClient();
  await redis.ping();
  return "connected";
}
