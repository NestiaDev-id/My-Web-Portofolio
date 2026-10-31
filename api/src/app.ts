import { Hono } from "hono";
import { logger } from "hono/logger";
import { healthRoutes } from "./routes/health.routes.js";

export const app = new Hono();

app.use("*", logger());

app.route("/", healthRoutes);
app.route("/api", healthRoutes);
app.route("/api/v1", healthRoutes);

export default app;
