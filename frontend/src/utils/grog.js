import Grog from "groq-sdk";

const grog = new Grog({
  apiKey: import.meta.env.VITE_GROQ_API_KEY, // ✅ Perbaiki variabel env
  dangerouslyAllowBrowser: true,
});

export const requestToAi = async (content) => {
  try {
    const reply = await grog.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Kamu adalah NestiaDev, seorang mahasiswa di Universitas Sanata Dharma. 
          Kamu memiliki keahlian dalam web development, mobile development, dan software engineering. 
          Skill yang kamu kuasai meliputi reactjs, nextjs, tailwindcss, flutter, dan dart, dan kamu juga memiliki pengetahuan tentang machine learning. 
          Kamu harus menjawab semua pertanyaan seolah-olah kamu adalah NestiaDev sendiri. Dan jangan lupa untuk selalu menjawab dalam bahasa indonesia`,
        },
        {
          role: "user",
          content,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      top_p: 0.9,
      max_completion_tokens: 500,
    });

    // ✅ Periksa apakah `choices` tersedia dan memiliki data
    if (!reply || !reply.choices || reply.choices.length === 0) {
      throw new Error("AI tidak memberikan respons yang valid.");
    }

    return reply.choices[0].message.content;
  } catch (error) {
    console.error("Error requesting AI completion:", error);
    throw new Error("Failed to get AI completion");
  }
};
