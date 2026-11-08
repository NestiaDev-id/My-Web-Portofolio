import { Hono } from "hono";
import { z } from "zod";
import { validateJson } from "../middleware/validator.js";
import {
  getActiveUsersCount,
  leavePresence,
  pingPresence,
} from "../services/presence.service.js";
import { getQueueStatus } from "../services/queue.service.js";

const presenceSchema = z.object({
  sessionId: z.string().trim().min(1).max(120),
});

export const presenceRoutes = new Hono();

presenceRoutes.get("/", async (c) => {
  const [activeUsers, queue] = await Promise.all([
    getActiveUsersCount(),
    getQueueStatus(),
  ]);

  return c.json({
    success: true,
    data: {
      activeUsers,
      queue,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

presenceRoutes.post("/ping", validateJson(presenceSchema), async (c) => {
  const { sessionId } = c.get("validatedBody");
  const activeUsers = await pingPresence(sessionId);

  return c.json({
    success: true,
    data: {
      sessionId,
      activeUsers,
      status: "connected",
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

presenceRoutes.post("/leave", async (c) => {
  let sessionId = c.req.query("sessionId")?.trim();

  if (!sessionId) {
    const contentType = c.req.header("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await c.req.json().catch(() => ({}));
      sessionId =
        typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const form = await c.req.formData().catch(() => null);
      sessionId = String(form?.get("sessionId") ?? "").trim();
    } else {
      // Raw text body fallback (often used with navigator.sendBeacon)
      const text = await c.req.text().catch(() => "");
      try {
        const parsed = JSON.parse(text);
        sessionId =
          typeof parsed.sessionId === "string" ? parsed.sessionId.trim() : "";
      } catch {
        sessionId = text.trim();
      }
    }
  }

  if (!sessionId) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "sessionId wajib disertakan.",
        },
        meta: { timestamp: new Date().toISOString() },
      },
      400,
    );
  }

  const remainingUsers = await leavePresence(sessionId);

  return c.json({
    success: true,
    data: {
      sessionId,
      activeUsers: remainingUsers,
      status: "disconnected",
    },
    meta: { timestamp: new Date().toISOString() },
  });
});
