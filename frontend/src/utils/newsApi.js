import axios from "axios";

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

// 🔹 Daftar API berita yang digunakan
const newsApis = [
  {
    name: "NewsAPI",
    url: `https://newsapi.org/v2/top-headlines?country=id&category=general&apiKey=${NEWS_API_KEY}`,
    extract: (data) =>
      data.articles.map((article) => ({
        title: article.title,
        description: article.description || "Tidak ada deskripsi.",
        url: article.url,
      })),
  },
  {
    name: "Berita Indonesia API",
    url: "https://api-berita-indonesia.vercel.app/cnn/terbaru",
    extract: (data) =>
      data.data.posts.map((post) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  {
    name: "Berita Indo API",
    url: "https://berita-indo-api.vercel.app/v1/cnn-news",
    extract: (data) =>
      data.data.map((post) => ({
        title: post.title,
        description: post.contentSnippet || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  {
    name: "Detik News API",
    url: "https://detiknews-api.vercel.app/",
    extract: (data) =>
      data.data.posts.map((post) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  {
    name: "Jakarta Post API",
    url: "https://jakarta-post-api.vercel.app/",
    extract: (data) =>
      data.data.posts.map((post) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  {
    name: "The Lazy Media API",
    url: "https://the-lazy-media-api.vercel.app/",
    extract: (data) =>
      data.data.posts.map((post) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
];

// 🔹 Fungsi untuk mengambil berita dari semua API
export const fetchLatestNews = async () => {
  let allNews = [];

  await Promise.all(
    newsApis.map(async ({ name, url, extract }) => {
      try {
        const response = await axios.get(url);
        if (response.data) {
          allNews.push(...extract(response.data));
        }
      } catch (error) {
        console.warn(`⚠️ Gagal mengambil berita dari ${name}:`, error.message);
      }
    })
  );

  // 🔹 Hapus duplikat berdasarkan judul berita
  const uniqueNews = allNews.filter(
    (news, index, self) =>
      index === self.findIndex((n) => n.title === news.title)
  );

  // 🔹 Acak urutan berita agar lebih variatif
  return uniqueNews.sort(() => Math.random() - 0.5);
};
