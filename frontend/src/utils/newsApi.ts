import axios from "axios";

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
// const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
// const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
// const CURRENT_API_KEY = import.meta.env.VITE_CURRENT_API_KEY;
// const NYTIMES_API_KEY = import.meta.env.VITE_NYTIMES_API_KEY;

// 🔹 Tipe untuk berita
interface News {
  title: string;
  description: string;
  url: string;
  summary: string;
}

// 🔹 Tipe untuk konfigurasi API berita
interface NewsApiConfig {
  name: string;
  url: (query: string) => string;
  extract: (data: any) => News[];
}

// 🔹 Daftar API berita yang digunakan
const newsApis: NewsApiConfig[] = [
  // Berita Api Internasional
  {
    name: "NewsAPI",
    url: (query) =>
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`, // ✅ URL benar
    extract: (data) =>
      data.articles.map((article: any) => ({
        title: article.title,
        description: article.description || "Tidak ada deskripsi.",
        url: article.url,
        summary: "",
      })),
  },
  // Berita Api Indonesia
  {
    name: "Berita Indonesia API",
    url: () => "https://api-berita-indonesia.vercel.app/cnn/terbaru", // ✅ URL benar
    extract: (data) =>
      data.data.posts.map((post: any) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
        summary: "",
      })),
  },
  {
    name: "Berita Indo API",
    url: () => "https://berita-indo-api.vercel.app/v1/cnn-news", // ✅ URL benar
    extract: (data) =>
      data.data.map((post: any) => ({
        title: post.title,
        description: post.contentSnippet || "Tidak ada deskripsi.",
        url: post.link,
        summary: "",
      })),
  },
];

// 🔹 Fungsi untuk meringkas berita menjadi kalimat pendek
const summarizeText = (text: string, maxLength = 150): string => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// 🔹 Fungsi untuk mengambil berita dari semua API berdasarkan query
export const fetchLatestNews = async (query: string): Promise<News[]> => {
  console.log("🔍 Mencari berita dengan query:", query); // 🔹 Log query yang digunakan
  const allNews: News[] = [];

  await Promise.all(
    newsApis.map(async ({ name, url, extract }) => {
      try {
        console.log(`📡 Fetching data from: ${name}`); // 🔹 Log API yang sedang diambil
        const response = await axios.get(url(query));
        console.log(`✅ Success fetching from: ${name}`, response.data); // 🔹 Log response data

        if (response.data) {
          let extractedNews = extract(response.data);
          extractedNews = extractedNews.map((news) => ({
            ...news,
            summary: summarizeText(news.description),
          }));

          console.log(
            `📰 Extracted ${extractedNews.length} articles from ${name}`
          ); // 🔹 Log jumlah berita yang diekstrak
          allNews.push(...extractedNews);
        }
      } catch (error: any) {
        console.warn(`⚠️ Gagal mengambil berita dari ${name}:`, error.message);
      }
    })
  );

  console.log("🔍 Total news before filtering:", allNews.length);

  // 🔹 Filter berita berdasarkan judul untuk menghindari duplikasi
  const uniqueNews = allNews.filter(
    (news, index, self) =>
      index === self.findIndex((n) => n.title === news.title)
  );

  console.log("✅ Total unique news after filtering:", uniqueNews.length);

  // 🔹 Acak urutan berita agar lebih variatif
  const shuffledNews = uniqueNews.sort(() => Math.random() - 0.5);
  console.log("🎲 Shuffled news order");

  // 🔹 Log total berita setelah semua proses selesai
  console.log(`📊 Total berita akhir yang tersedia: ${shuffledNews.length}`);

  // 🔹 Log isi berita dalam bentuk array objek
  console.log("📜 Daftar berita akhir:", shuffledNews);

  return shuffledNews;
};
