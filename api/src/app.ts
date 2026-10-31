import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { healthRoutes } from "./routes/health.routes.js";
import { isAllowedOrigin } from "./config/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";

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
app.use("*", bodyLimit({ maxSize: 100 * 1024 }));
app.use("/api/v1/*", async (c, next) => {
  if (c.req.path.endsWith("/health") || c.req.path.endsWith("/health/db")) {
    return next();
  }
  return generalRateLimiter(c, next);
});

app.route("/", healthRoutes);
app.route("/api", healthRoutes);
app.route("/api/v1", healthRoutes);

app.onError(errorHandler);

export default app;
