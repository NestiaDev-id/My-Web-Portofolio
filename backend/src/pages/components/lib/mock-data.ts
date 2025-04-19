// Mock data for the admin dashboard

// About Me data
export interface AboutMeData {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
}

export const aboutMeData: AboutMeData = {
  name: "John Doe",
  title: "Full Stack Developer",
  bio: "Passionate full-stack developer with 5 years of experience building web applications. Specializing in React, Next.js, and TypeScript. Dedicated to creating clean, efficient code and intuitive user experiences.",
  avatarUrl:
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3",
  skills: ["React", "TypeScript", "Node.js", "Next.js", "Tailwind CSS"],
};

// Projects data
export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  link: string;
  createdAt: string;
}

export const projectsData: Project[] = [
  {
    id: "1",
    title: "E-commerce Platform",
    description:
      "A full-featured e-commerce platform built with Next.js and Stripe integration",
    imageUrl:
      "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&q=80&w=1364&ixlib=rb-4.0.3",
    tags: ["Next.js", "React", "Stripe", "Tailwind"],
    link: "https://example.com/ecommerce",
    createdAt: "2023-05-15",
  },
  {
    id: "2",
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates",
    imageUrl:
      "https://images.unsplash.com/photo-1611224885990-ab7363d7f2a9?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    tags: ["React", "Firebase", "Tailwind"],
    link: "https://example.com/taskmanager",
    createdAt: "2023-03-22",
  },
  {
    id: "3",
    title: "Portfolio Website",
    description: "A personal portfolio website to showcase projects and skills",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    tags: ["Next.js", "Three.js", "Framer Motion"],
    link: "https://example.com/portfolio",
    createdAt: "2023-01-10",
  },
];

// Blog posts data
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
}

export const blogPostsData: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with React Hooks",
    slug: "getting-started-with-react-hooks",
    excerpt:
      "Learn the basics of React Hooks and how to use them in your projects.",
    content:
      "React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class component. In this post, we'll explore the most commonly used hooks like useState, useEffect, and useContext...",
    coverImage:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    tags: ["React", "Frontend", "Hooks"],
    publishedAt: "2023-06-20",
  },
  {
    id: "2",
    title: "Building a REST API with Node.js and Express",
    slug: "building-rest-api-nodejs-express",
    excerpt:
      "A step-by-step guide to creating a RESTful API using Node.js and Express.",
    content:
      "In this tutorial, we'll walk through the process of building a RESTful API with Node.js and Express. We'll cover everything from setting up your project to deploying your API to production...",
    coverImage:
      "https://images.unsplash.com/photo-1555066932-e78dd8fb77bb?auto=format&fit=crop&q=80&w=1471&ixlib=rb-4.0.3",
    tags: ["Node.js", "Express", "API", "Backend"],
    publishedAt: "2023-07-15",
  },
  {
    id: "3",
    title: "CSS Grid vs Flexbox: When to Use Which",
    slug: "css-grid-vs-flexbox-comparison",
    excerpt:
      "Understanding the differences between CSS Grid and Flexbox and when to use each layout system.",
    content:
      "CSS Grid and Flexbox are two powerful layout systems in CSS. While they share some similarities, they're designed to solve different layout problems. In this post, we'll compare the two and provide guidelines on when to use each...",
    coverImage:
      "https://images.unsplash.com/photo-1621839673705-6617adf9e890?auto=format&fit=crop&q=80&w=1332&ixlib=rb-4.0.3",
    tags: ["CSS", "Web Design", "Frontend"],
    publishedAt: "2023-08-05",
  },
];

// Social links data
export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  active: boolean;
}

export const socialLinksData: SocialLink[] = [
  {
    id: "1",
    name: "GitHub",
    url: "https://github.com/johndoe",
    icon: "github",
    active: true,
  },
  {
    id: "2",
    name: "LinkedIn",
    url: "https://linkedin.com/in/johndoe",
    icon: "linkedin",
    active: true,
  },
  {
    id: "3",
    name: "Twitter",
    url: "https://twitter.com/johndoe",
    icon: "twitter",
    active: true,
  },
  {
    id: "4",
    name: "Instagram",
    url: "https://instagram.com/johndoe",
    icon: "instagram",
    active: false,
  },
];

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number;
  totalPosts: number;
  totalLinks: number;
  recentViews: number;
}

export const dashboardStats: DashboardStats = {
  totalProjects: 3,
  totalPosts: 3,
  totalLinks: 4,
  recentViews: 1204,
};
