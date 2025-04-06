import mongoose, { Schema, Document } from "mongoose";

// 1. Interface
export interface IBlog extends Document {
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  content: string;
  images?: string[];
  tags?: string[];
  author: string;
  createdAt: Date;
  updatedAt?: Date;
}

// 2. Schema
const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  cover_image: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  tags: [String],
  author: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// 3. Model
const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
