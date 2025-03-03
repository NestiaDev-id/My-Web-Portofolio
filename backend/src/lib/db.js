import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectDB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connectDB.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
