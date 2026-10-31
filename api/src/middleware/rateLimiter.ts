import type { MiddlewareHandler } from "hono";
import { env } from "../config/env.js";
import { getRedisClient } from "../services/redis.service.js";

type RateLimitOptions = {
  limit: number;
  windowSeconds?: number;
  keyPrefix?: string;
};

const slidingWindowScript = `
  local now = tonumber(ARGV[1])
  local windowStart = now - tonumber(ARGV[2])
  local member = ARGV[3]
  local limit = tonumber(ARGV[4])
  redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, windowStart)
  local current = redis.call("ZCARD", KEYS[1])
  local reset = now + tonumber(ARGV[2])
  if current >= limit then
    local oldest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")
    if oldest[2] then reset = tonumber(oldest[2]) + tonumber(ARGV[2]) end
    return {0, 0, reset}
  end
  redis.call("ZADD", KEYS[1], now, member)
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))
  return {1, limit - current - 1, reset}
`;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function createRateLimiter(options: RateLimitOptions): MiddlewareHandler {
  const windowSeconds = options.windowSeconds ?? env.RATE_LIMIT_WINDOW_SECONDS;
  const prefix = options.keyPrefix ?? "api:rate-limit";

  return async (c, next) => {
    const now = Math.floor(Date.now() / 1000);
    const member = `${now}:${crypto.randomUUID()}`;
    const key = `${prefix}:${clientIp(c.req.raw)}`;
    const redis = await getRedisClient();
    const result = (await redis.eval(slidingWindowScript, {
      keys: [key],
      arguments: [
        String(now),
        String(windowSeconds),
        member,
        String(options.limit),
      ],
    })) as number[];
    const [allowed, remaining, reset] = result;

    c.header("X-RateLimit-Limit", String(options.limit));
    c.header("X-RateLimit-Remaining", String(Math.max(0, remaining)));
    c.header("X-RateLimit-Reset", String(reset));

    if (allowed !== 1) {
      c.header("Retry-After", String(Math.max(1, reset - now)));
      return c.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Terlalu banyak permintaan. Silakan tunggu beberapa saat.",
          },
          meta: { timestamp: new Date().toISOString() },
        },
        429,
      );
    }

    await next();
  };
}

export const generalRateLimiter = createRateLimiter({
  limit: env.RATE_LIMIT_GENERAL_MAX,
  keyPrefix: "api:rate-limit:general",
});
