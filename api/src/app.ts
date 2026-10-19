import { Hono } from "hono";

export const app = new Hono().basePath("/api/v1");

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Backend API is running",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});
