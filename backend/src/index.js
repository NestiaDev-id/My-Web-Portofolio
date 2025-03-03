import express from "express";
import dotenv from "dotenv";
import coockieParser from "cookie-parser";
// import cors from "cors";

// import authRoutes from "./routes/authRoute.js";
// import messageRoutes from "./routes/messageRoute.js";
// import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();

// const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(coockieParser());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

// app.listen(PORT, () => {
//   console.log("Server is running on PORT:" + PORT);
//   connectDB();
// });
