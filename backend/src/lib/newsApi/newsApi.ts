export const fetchLatestNews = async (topic: string, limit = 5) => {
  try {
    const apiKey = process.env.VITE_NEWS_API_KEY;
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${topic}&pageSize=${limit}&apiKey=${apiKey}`
    );
    const data = await res.json();

    if (!data.articles) return [];

    return data.articles.map((article: any) => ({
      title: article.title,
      summary: article.description,
      url: article.url,
    }));
  } catch (error) {
    console.error("❌ Gagal mengambil berita:", error);
    return [];
  }
};
