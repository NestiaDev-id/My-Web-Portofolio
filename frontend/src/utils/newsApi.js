import axios from "axios";

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
const CURRENT_API_KEY = import.meta.env.VITE_CURRENT_API_KEY;
const NYTIMES_API_KEY = import.meta.env.VITE_NYTIMES_API_KEY;

// 🔹 Daftar API berita yang digunakan
const newsApis = [
  // Berita Api Internasional
  {
    name: "NewsAPI",
    url: (query) =>
      `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`, // ✅ URL benar
    extract: (data) =>
      data.articles.map((article) => ({
        title: article.title,
        description: article.description || "Tidak ada deskripsi.",
        url: article.url,
      })),
  },
  // {
  //   name: "GNews API",
  //   url: (query) =>
  //     `https://gnews.io/api/v4/search?q=${query}&token=${GNEWS_API_KEY}`, // ✅ Perbaikan URL
  //   extract: (data) =>
  //     data.articles.map((article) => ({
  //       title: article.title,
  //       description: article.description || "Tidak ada deskripsi.",
  //       url: article.url,
  //     })),
  // },
  // {
  //   name: "Guardian News Api",
  //   url: (query) =>
  //     `https://content.guardianapis.com/search?q=${query}&api-key=${GUARDIAN_API_KEY}`,
  //   extract: (data) =>
  //     data.response.results.map((article) => ({
  //       title: article.webTitle,
  //       description: article.webPublicationDate || "Tidak ada deskripsi.", // ✅ Gunakan tanggal sebagai alternatif
  //       url: article.webUrl,
  //     })),
  // },
  // {
  //   name: "Current News Api",
  //   url: (query) =>
  //     `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${CURRENT_API_KEY}`, // ✅ Perbaikan URL
  //   extract: (data) =>
  //     data.news.map((article) => ({
  //       title: article.title,
  //       description: article.description || "Tidak ada deskripsi.",
  //       url: article.url,
  //     })),
  // },
  // {
  //   name: "New York Times Api",
  //   url: (query) =>
  //     `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${NYTIMES_API_KEY}`, // ✅ Perbaikan URL
  //   extract: (data) =>
  //     data.response.docs.map((article) => ({
  //       title: article.headline.main,
  //       description: article.abstract || "Tidak ada deskripsi.",
  //       url: article.web_url,
  //     })),
  // },
  // Berita Api Indonesia
  {
    name: "Berita Indonesia API",
    url: () => "https://api-berita-indonesia.vercel.app/cnn/terbaru", // ✅ URL benar
    extract: (data) =>
      data.data.posts.map((post) => ({
        title: post.title,
        description: post.description || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  {
    name: "Berita Indo API",
    url: () => "https://berita-indo-api.vercel.app/v1/cnn-news", // ✅ URL benar
    extract: (data) =>
      data.data.map((post) => ({
        title: post.title,
        description: post.contentSnippet || "Tidak ada deskripsi.",
        url: post.link,
      })),
  },
  // {
  //   name: "Detik News API",
  //   url: () => "https://detiknews-api.vercel.app/", // ✅ URL benar
  //   extract: (data) =>
  //     data.data.posts.map((post) => ({
  //       title: post.title,
  //       description: post.description || "Tidak ada deskripsi.",
  //       url: post.link,
  //     })),
  // },
  // {
  //   name: "Jakarta Post API",
  //   url: () => "https://jakarta-post-api.vercel.app/", // ✅ URL benar
  //   extract: (data) =>
  //     data.data.posts.map((post) => ({
  //       title: post.title,
  //       description: post.description || "Tidak ada deskripsi.",
  //       url: post.link,
  //     })),
  // },
  // {
  //   name: "The Lazy Media API",
  //   url: () => "https://the-lazy-media-api.vercel.app/", // ✅ URL benar
  //   extract: (data) =>
  //     data.data.posts.map((post) => ({
  //       title: post.title,
  //       description: post.description || "Tidak ada deskripsi.",
  //       url: post.link,
  //     })),
  // },
];
// 🔹 Fungsi untuk meringkas berita menjadi kalimat pendek
const summarizeText = (text, maxLength = 150) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// 🔹 Fungsi untuk mengambil berita dari semua API berdasarkan query
export const fetchLatestNews = async (query) => {
  console.log("🔍 Mencari berita dengan query:", query); // 🔹 Log query yang digunakan
  let allNews = [];

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
            summary: summarizeText(news.description || news.content),
          }));

          console.log(
            `📰 Extracted ${extractedNews.length} articles from ${name}`
          ); // 🔹 Log jumlah berita yang diekstrak
          allNews.push(...extractedNews);
        }
      } catch (error) {
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
