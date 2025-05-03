// import type { NextApiRequest, NextApiResponse } from "next";
// import grog from "@/lib/GrogClient/grogClient";
// import { fetchLatestNews } from "@/lib/newsApi/newsApi";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   const { message } = req.body;

//   if (!message || typeof message !== "string") {
//     return res
//       .status(400)
//       .json({ error: "Invalid or missing 'message' in request body" });
//   }

//   console.log("Request Body:", req.body);

//   const messages = [
//     {
//       role: "system",
//       content: "Kamu adalah asisten pribadi NestiaDev. Jawab dengan bahasa Indonesia yang sopan dan profesional.",
//     },
//     {
//       role: "user",
//       content: message,
//     },
//   ];

//   const tools = [
//     {
//       type: "function",
//       function: {
//         name: "getLatestNews",
//         description: "Mengambil berita teknologi terkini",
//         parameters: {
//           type: "object",
//           properties: {
//             topic: { type: "string", description: "Topik berita" },
//             limit: {
//               type: "integer",
//               description: "Jumlah maksimum berita",
//               default: 5,
//             },
//           },
//           required: ["topic"],
//         },
//       },
//     },
//   ];

//   try {
//     // Langkah 1: Dapatkan respons awal dari Grog
//     const initialResponse = await grog.chat.completions.create({
//       messages,
//       tools,
//       tool_choice: "auto",
//       model: "llama3-8b-8192",
//     });

//     console.log("Initial Response:", initialResponse.choices[0]?.message);

//     const toolCall = initialResponse.choices[0]?.message?.tool_calls?.[0];
//     console.log("Tool Dipanggil:", JSON.stringify(toolCall, null, 2));

//     if (toolCall) {
//       // Langkah 2: Eksekusi tool jika ada tool call
//       let args;
//       try {
//         args = JSON.parse(toolCall.function.arguments);
//       } catch (err) {
//         console.error("Error parsing tool arguments:", err);
//         return res
//           .status(500)
//           .json({ error: "Failed to parse tool arguments" });
//       }

//       const result = await fetchLatestNews(args.topic, args.limit || 5);
//       // console.log("Tool Result:", result);

//       messages.push({ role: "assistant", tool_calls: [toolCall] });
//       messages.push({
//         role: "tool",
//         tool_call_id: toolCall.id,
//         content: JSON.stringify(result),
//       });

//       // Langkah 3: Dapatkan respons akhir dari Grog
//       const finalResponse = await grog.chat.completions.create({
//         model: "llama3-8b-8192",
//         messages,
//       });

//       const final = finalResponse.choices[0]?.message || "Tidak ada jawaban.";

//       return res.status(200).json({ result: final });
//     }

//     // Jika tidak ada tool call, kembalikan respons awal
//     const response =
//       initialResponse.choices[0]?.message?.content || "Tidak ada jawaban.";
//     return res.status(200).json({ result: response });
//   } catch (err) {
//     console.error("🔥 Error Groq API:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }
