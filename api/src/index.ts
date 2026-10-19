import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono().basePath("/api/v1");

app.get("/", (c) => {
  return c.text("Backend API is running");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
