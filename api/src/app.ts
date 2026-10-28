import { Hono } from "hono";
import type { Context } from "hono";

export const app = new Hono();

const statusResponse = (c: Context) =>
  c.json({
    status: "ok",
    message: "Backend API is running",
  });

app.get("/", statusResponse);
app.get("/api", statusResponse);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/api/v1", statusResponse);
app.get("/api/v1/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
