import { env } from "../config/env.js";
import { getRedisClient } from "./redis.service.js";
import {
  saveIpCooldownToMongo,
  getIpCooldownFromMongo,
} from "./mongo.service.js";

const COOLDOWN_CACHE_PREFIX = "api:cache:cooldown";
const COOLDOWN_CACHE_TTL_SECONDS = 900; // 15 menit ephemeral hot-cache

export interface CooldownStatus {
  inCooldown: boolean;
  remainingSeconds?: number;
  reason?: string;
}

/**
 * Checks if an IP is currently under a temporary cooldown period.
 * 1. Checks Redis hot-cache first (< 2ms).
 * 2. If not found in Redis, checks MongoDB Atlas.
 * 3. Populates Redis hot-cache if found in MongoDB.
 */
export async function isIpInCooldown(ip: string): Promise<CooldownStatus> {
  const cacheKey = `${COOLDOWN_CACHE_PREFIX}:${ip}`;

  // Step 1: Redis Hot-Cache Check
  if (env.REDIS_URL) {
    try {
      const redis = await getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { reason: string; expiresAt: string };
        const remaining = Math.max(
          1,
          Math.ceil((new Date(parsed.expiresAt).getTime() - Date.now()) / 1000)
        );
        return {
          inCooldown: true,
          remainingSeconds: remaining,
          reason: parsed.reason,
        };
      }
    } catch (err) {
      console.warn("[CooldownService] Redis cache lookup failed:", err);
    }
  }

  // Step 2: MongoDB Atlas Persistent Store Check
  const mongoCheck = await getIpCooldownFromMongo(ip);
  if (mongoCheck.inCooldown && mongoCheck.remainingSeconds && mongoCheck.remainingSeconds > 0) {
    // Populate Redis hot-cache for quick subsequent checks
    if (env.REDIS_URL) {
      try {
        const redis = await getRedisClient();
        const ttl = Math.min(COOLDOWN_CACHE_TTL_SECONDS, mongoCheck.remainingSeconds);
        const expiresAt = new Date(Date.now() + mongoCheck.remainingSeconds * 1000).toISOString();
        await redis.set(
          cacheKey,
          JSON.stringify({ reason: mongoCheck.reason ?? "COOLDOWN", expiresAt }),
          { EX: ttl }
        );
      } catch (err) {
        console.warn("[CooldownService] Failed to populate Redis hot-cache:", err);
      }
    }
    return mongoCheck;
  }

  return { inCooldown: false };
}

/**
 * Activates a cooldown period for an IP address.
 * Sets the 24-hour expiration in MongoDB and 15-minute hot-cache in Redis.
 */
export async function setIpCooldown(
  ip: string,
  reason: string,
  durationSeconds = 24 * 3600
): Promise<void> {
  const cacheKey = `${COOLDOWN_CACHE_PREFIX}:${ip}`;
  const expiresAt = new Date(Date.now() + durationSeconds * 1000);

  // 1. Hot-cache in Redis (15 mins)
  if (env.REDIS_URL) {
    try {
      const redis = await getRedisClient();
      const ttl = Math.min(COOLDOWN_CACHE_TTL_SECONDS, durationSeconds);
      await redis.set(
        cacheKey,
        JSON.stringify({ reason, expiresAt: expiresAt.toISOString() }),
        { EX: ttl }
      );
    } catch (err) {
      console.warn("[CooldownService] Failed to set Redis cooldown cache:", err);
    }
  }

  // 2. Persist in MongoDB with TTL index
  await saveIpCooldownToMongo(ip, reason, durationSeconds);
}

/**
 * Checks email-specific rate limit (e.g. max 3 requests per 45 minutes).
 */
export async function checkEmailRateLimit(
  email: string,
  limit = 3,
  windowSeconds = 2700
): Promise<{ allowed: boolean; remaining: number }> {
  if (!env.REDIS_URL) return { allowed: true, remaining: limit };

  const key = `api:rate-limit:contact:email:${email.toLowerCase().trim()}`;
  try {
    const redis = await getRedisClient();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
    };
  } catch (err) {
    console.warn("[CooldownService] Email rate limit check failed:", err);
    return { allowed: true, remaining: limit };
  }
}
