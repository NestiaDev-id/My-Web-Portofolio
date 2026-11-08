import { env } from "../config/env.js";
import { getRedisClient } from "./redis.service.js";

const ACTIVE_SET_KEY = "presence:chatme:active_users";

function sessionPresenceKey(sessionId: string): string {
  return `presence:chatme:${sessionId}`;
}

const pingScript = `
  local setKey = KEYS[1]
  local sessionKey = KEYS[2]
  local sessionId = ARGV[1]
  local now = tonumber(ARGV[2])
  local ttl = tonumber(ARGV[3])
  local threshold = now - ttl

  redis.call("SET", sessionKey, "1", "EX", ttl)
  redis.call("ZADD", setKey, now, sessionId)
  redis.call("ZREMRANGEBYSCORE", setKey, 0, threshold)
  redis.call("EXPIRE", setKey, ttl * 2)

  return redis.call("ZCARD", setKey)
`;

const leaveScript = `
  local setKey = KEYS[1]
  local sessionKey = KEYS[2]
  local sessionId = ARGV[1]
  local now = tonumber(ARGV[2])
  local ttl = tonumber(ARGV[3])
  local threshold = now - ttl

  redis.call("DEL", sessionKey)
  redis.call("ZREM", setKey, sessionId)
  redis.call("ZREMRANGEBYSCORE", setKey, 0, threshold)

  return redis.call("ZCARD", setKey)
`;

const countScript = `
  local setKey = KEYS[1]
  local now = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])
  local threshold = now - ttl

  redis.call("ZREMRANGEBYSCORE", setKey, 0, threshold)
  return redis.call("ZCARD", setKey)
`;

export async function pingPresence(sessionId: string): Promise<number> {
  const redis = await getRedisClient();
  const now = Math.floor(Date.now() / 1000);
  const ttl = env.PRESENCE_TTL_SECONDS;

  const count = (await redis.eval(pingScript, {
    keys: [ACTIVE_SET_KEY, sessionPresenceKey(sessionId)],
    arguments: [sessionId, String(now), String(ttl)],
  })) as number;

  return Math.max(1, count);
}

export async function leavePresence(sessionId: string): Promise<number> {
  const redis = await getRedisClient();
  const now = Math.floor(Date.now() / 1000);
  const ttl = env.PRESENCE_TTL_SECONDS;

  const count = (await redis.eval(leaveScript, {
    keys: [ACTIVE_SET_KEY, sessionPresenceKey(sessionId)],
    arguments: [sessionId, String(now), String(ttl)],
  })) as number;

  return Math.max(0, count);
}

export async function getActiveUsersCount(): Promise<number> {
  const redis = await getRedisClient();
  const now = Math.floor(Date.now() / 1000);
  const ttl = env.PRESENCE_TTL_SECONDS;

  const count = (await redis.eval(countScript, {
    keys: [ACTIVE_SET_KEY],
    arguments: [String(now), String(ttl)],
  })) as number;

  return Math.max(0, count);
}
