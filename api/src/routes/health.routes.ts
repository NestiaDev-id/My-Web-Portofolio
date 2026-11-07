import { Hono } from "hono";
import { checkMongoHealth } from "../services/mongo.service.js";
import { checkRedisHealth } from "../services/redis.service.js";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) =>
  c.json({
    success: true,
    data: { status: "ok" },
    meta: { timestamp: new Date().toISOString() },
  }),
);

healthRoutes.get("/health", (c) =>
  c.json({
    success: true,
    data: { status: "ok" },
    meta: { timestamp: new Date().toISOString() },
  }),
);

healthRoutes.get("/health/db", async (c) => {
  const [redisResult, mongoResult] = await Promise.allSettled([
    checkRedisHealth(),
    checkMongoHealth(),
  ]);
  const redis = redisResult.status === "fulfilled" ? redisResult.value : "disconnected";
  const mongodb =
    mongoResult.status === "fulfilled" ? mongoResult.value : "disconnected";
  const healthy = redisResult.status === "fulfilled" && mongoResult.status === "fulfilled";

  return c.json(
    {
      success: healthy,
      data: { redis, mongodb },
      meta: { timestamp: new Date().toISOString() },
    },
    healthy ? 200 : 503,
  );
});
