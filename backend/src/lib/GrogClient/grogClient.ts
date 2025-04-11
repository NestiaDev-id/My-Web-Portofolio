import Grog from "groq-sdk";

const grog = new Grog({
  apiKey: process.env.VITE_GROQ_API_KEY!,
});

export default grog;
