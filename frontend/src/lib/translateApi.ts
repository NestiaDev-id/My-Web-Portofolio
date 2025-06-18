interface TranslateRequestBody {
  q: string;
  source: string;
  target: string;
  format: string;
}

interface TranslateResponse {
  translatedText: string;
}

export const translateToIndonesian = async (text: string): Promise<string> => {
  try {
    const requestBody: TranslateRequestBody = {
      q: text,
      source: "auto",
      target: "id",
      format: "text",
    };

    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST", // Specify the HTTP method
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TranslateResponse = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return the original text if an error occurs
  }
};
