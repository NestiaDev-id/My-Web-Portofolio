import Cors from "cors";

// Inisialisasi CORS
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],

  credentials: true, // Untuk mengirim cookies
});

// Fungsi untuk menjalankan middleware CORS
export function runMiddleware(req: any, res: any) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
