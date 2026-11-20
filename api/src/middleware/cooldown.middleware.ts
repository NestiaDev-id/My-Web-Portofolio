import type { MiddlewareHandler } from "hono";
import { isIpInCooldown } from "../services/cooldown.service.js";

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export const ipCooldownMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = clientIp(c.req.raw);
  const status = await isIpInCooldown(ip);

  if (status.inCooldown) {
    const retryAfter = Math.max(60, status.remainingSeconds ?? 3600);
    c.header("Retry-After", String(retryAfter));
    return c.json(
      {
        success: false,
        error: "Aktivitas pengiriman pesan Anda sedang dalam masa jeda keamanan (cooldown time). Silakan beristirahat sejenak sebelum mencoba kembali.",
        meta: {
          code: "COOLDOWN_ACTIVE",
          retryAfter,
        },
      },
      429,
    );
  }

  await next();
};
