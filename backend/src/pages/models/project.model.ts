import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
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
    required: true,
  },
  tech_stack: [String], // array of technologies
  github_url: {
    type: String,
  },
  live_url: {
    type: String,
  },
  cover_image: {
    type: String, // gambar utama / thumbnail
  },
  gallery: [
    {
      type: String, // gambar tambahan
    },
  ],
  features: [
    {
      type: String, // daftar fitur utama
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;
