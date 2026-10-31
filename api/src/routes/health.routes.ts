import { Hono } from "hono";

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
