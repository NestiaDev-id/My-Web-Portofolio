import { Hono } from "hono";
import { handle } from "hono/vercel";

// Menggunakan objek app utama
const app = new Hono();

// Rute utama: domain-anda.vercel.app/api/v1
app.get("/api/v1", (c) => {
  return c.json({
    status: "ok",
    message: "Backend API is running seamlessly",
  });
});

// Rute kesehatan: domain-anda.vercel.app/api/v1/health
app.get("/api/v1/health", (c) => {
  return c.json({ status: "ok" });
});

// SAKLAR UTAMA: Vercel Node.js runtime wajib membaca "export default"
export default handle(app);
