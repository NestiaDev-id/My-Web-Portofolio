import mongoose from "mongoose";

interface ISocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
  facebook?: string;
}

interface ICertification {
  title: string;
  issuer: string;
  date: string;
  credential_url?: string;
}

interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

interface IEducation {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface IUser {
  username: string;
  email: string;
  password: string;

  name: string;
  profile_picture?: string;
  cover_photo?: string;
  aboutme?: string;
  quote?: string[];

  tech_stack?: string[];
  skills?: string[];
  languages?: string[];

  social_links?: ISocialLinks;
  certifications?: ICertification[];
  experience?: IExperience[];
  education?: IEducation[];

  resume_url?: string;
  contact_email?: string;
  phone?: string;
  location?: string;

  role?: "admin" | "user";

  lastLogin?: Date;
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  name: { type: String, required: true },
  profile_picture: String,
  cover_photo: String,
  aboutme: String,
  quote: [String],

  tech_stack: [String],
  skills: [String],
  languages: [String],

  social_links: {
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    website: String,
    youtube: String,
    facebook: String,
  },

  certifications: [
    {
      title: String,
      issuer: String,
      date: String,
      credential_url: String,
    },
  ],

  experience: [
    {
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      isCurrent: Boolean,
      description: String,
    },
  ],

  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      description: String,
    },
  ],

  resume_url: String,
  contact_email: String,
  phone: String,
  location: String,

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
