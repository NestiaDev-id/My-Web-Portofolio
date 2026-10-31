import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { healthRoutes } from "./routes/health.routes.js";
import { isAllowedOrigin } from "./config/security.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 86400,
  }),
);
app.use("*", secureHeaders());

app.route("/", healthRoutes);
app.route("/api", healthRoutes);
app.route("/api/v1", healthRoutes);

app.onError(errorHandler);

export default app;
