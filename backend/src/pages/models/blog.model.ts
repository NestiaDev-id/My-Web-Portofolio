import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
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
    type: String, // URL gambar besar di bagian atas
  },
  content: {
    type: String, // Konten utama dalam bentuk Markdown
    required: true,
  },
  images: [
    {
      type: String, // Array image URL (gambar tambahan di bawah konten)
    },
  ],
  tags: [String], // Kategori / label
  author: {
    type: String,
    default: "admin", // bisa juga di-relasikan ke model User nantinya
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
export default Blog;
