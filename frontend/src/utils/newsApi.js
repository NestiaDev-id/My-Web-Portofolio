import axios from "axios";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Pastikan Anda sudah mendefinisikan ini di .env
const NEWS_URL =
  "https://newsapi.org/v2/top-headlines?country=id&category=general";

export const fetchLatestNews = async () => {
  try {
    const response = await axios.get(`${NEWS_URL}&apiKey=${API_KEY}`);
    return response.data.articles.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
