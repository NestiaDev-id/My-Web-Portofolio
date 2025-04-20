import { LRUCache } from "lru-cache"; // Mengimpor LRUCache dari pustaka lru-cache untuk menyimpan cache terbatas

export default function rateLimit(options: { max: number; windowMs: number }) {
  // Membuat cache dengan batas maksimal dan TTL (Time to Live) sesuai parameter yang diberikan
  const tokenCache = new LRUCache({
    max: 500, // Maksimum kapasitas cache
    ttl: options.windowMs, // Waktu hidup cache dalam milidetik (ttl untuk mengatur durasi cache)
  });

  return {
    // Fungsi untuk memeriksa apakah permintaan melebihi batas (rate limit)
    check: (res: any, limit: number, token: string) => {
      const tokenCount = Number(tokenCache.get(token) || 0); // Ambil jumlah percakapan untuk token ini, default 0 jika belum ada

      // Lewati pemeriksaan rate limit saat mode development
      if (process.env.NODE_ENV === "development") return;

      // Jika jumlah permintaan melebihi limit, beri respons 429
      if (tokenCount >= limit) {
        res
          .status(429)
          .json({ message: "Terlalu banyak percobaan, coba lagi nanti." });
        throw new Error("Rate limit exceeded"); // Menghentikan eksekusi lebih lanjut jika limit terlampaui
      }

      // Menambahkan percakapan token ke cache (menghitung jumlah permintaan)
      tokenCache.set(token, tokenCount + 1);
    },
  };
}
