import Grog from "groq-sdk";
import { fetchLatestNews } from "./newsApi";
import { translateToIndonesian } from "./translateApi";

// Tipe untuk opsi permintaan ke AI
interface RequestOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  top_p: number;
  seed: number;
}

// Tipe untuk berita terkini
interface News {
  title: string;
  summary: string;
  url: string;
}

// Inisialisasi Grog SDK
const grog = new Grog({
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

// Fungsi untuk mengirim permintaan ke AI
export const requestToAi = async (
  content: string,
  option: RequestOptions
): Promise<string> => {
  try {
    let latestNews: News[] = [];

    // Ambil berita terkini
    try {
      latestNews = await fetchLatestNews(content);
      console.log("📡 Berita terbaru berhasil diambil:", latestNews);
    } catch (newsError) {
      console.warn("⚠️ Gagal mengambil berita, melanjutkan tanpa berita...");
      console.error("Error fetching news:", newsError);
      latestNews = [];
    }

    // Ringkas berita terkini jika tersedia
    const newsSummary = latestNews.length
      ? latestNews
          .slice(0, 5)
          .map(
            (news) =>
              `- ${news.title}: ${news.summary} (Baca selengkapnya: ${news.url})`
          )
          .join("\n")
      : "Saat ini tidak ada berita terbaru yang tersedia.";

    // Kirim permintaan ke AI
    const reply = await grog.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten pribadi NestiaDev. 
          Tugasmu adalah membantu menjawab pertanyaan, memberikan informasi, dan mendukung NestiaDev dalam aktivitasnya. 
          Kamu memiliki keahlian dalam web development, mobile development, dan software engineering. 
          Skill yang kamu kuasai meliputi React.js, Next.js, Tailwind CSS, Flutter, dan Dart. 
          Kamu juga memiliki pengetahuan tentang machine learning. 
          Jawablah semua pertanyaan dengan profesional, ramah, dan selalu dalam bahasa Indonesia.

          Jika anda tidak bisa menjawab atau kurangnya informasi, anda bisa menggunakan berita terkini yang ada di bawah ini sebagai bahan referensi untuk menjawab pertanyaan pengguna:
          ${newsSummary}

          Tugas utamamu adalah membantu pengguna dengan profesionalisme dan keramahan, seolah-olah kamu adalah asisten pribadi eksklusif milik NestiaDev.`,
        },
        {
          role: "user",
          content,
        },
      ],
      model: option.model,
      temperature: option.temperature,
      top_p: option.top_p,
      maxTokens: option.maxTokens,
      seed: option.seed,
    });

    // Validasi respons dari AI
    if (
      !reply ||
      !reply.choices ||
      reply.choices.length === 0 ||
      !reply.choices[0].message
    ) {
      throw new Error("AI tidak memberikan respons yang valid.");
    }

    // Terjemahkan respons ke bahasa Indonesia
    const translatedContent = await translateToIndonesian(
      reply.choices[0].message.content
    );
    reply.choices[0].message.content =
      translatedContent || reply.choices[0].message.content;

    return reply.choices[0].message.content ?? "";
  } catch (error) {
    console.error("Error requesting AI completion:", error);
    throw new Error("Failed to get AI completion");
  }
};
