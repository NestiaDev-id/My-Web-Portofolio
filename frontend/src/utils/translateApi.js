import axios from "axios";

export const translateToIndonesian = async (text) => {
  try {
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST", // Specify the HTTP method
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: "id",
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return the original text if an error occurs
  }
};
