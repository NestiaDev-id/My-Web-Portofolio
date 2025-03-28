import axios from "axios";

export const translateToIndonesian = async (text) => {
  try {
    const response = await axios.post("https://libretranslate.com/translate", {
      q: text,
      source: "auto",
      target: "id",
      format: "text",
    });

    return response.data.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Kembalikan teks asli jika terjadi kesalahan
  }
};
