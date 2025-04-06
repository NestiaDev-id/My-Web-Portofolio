import mongoose, { Document, Schema } from "mongoose";

export interface INotebook {
  github_raw_url: string;
  rendered_images?: string[];
  viewer_embed_url?: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  cover_image?: string;
  gallery?: string[];
  tags?: string[];
  notebook?: INotebook;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  tech_stack: [String],
  github_url: String,
  cover_image: String,
  gallery: [String],
  tags: [String],
  notebook: {
    github_raw_url: { type: String },
    rendered_images: [String],
    viewer_embed_url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);

export default Project;
