export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  status: "Completed" | "Ongoing" | "Development" | "Production";
  github: string;
  demo?: string;
}

export const projects: Project[] = [
  // Web Dev
  {
    slug: "auth-system",
    title: "Authentication System",
    category: "Web Dev",
    description:
      "A robust authentication system providing security features such as CSRF, token-based authentication, refresh tokens, rate limiting, sliding sessions, IP blocking, and Argon2 encryption.",
    image: "/gambar1.jpeg",
    status: "Completed",
    github: "https://github.com/NestiaDev-id/Auth-Defense-System",
    demo: "#",
  },
   {
    slug: "bible",
    title: "Bible / Kitabku",
    category: "Web Dev",
    description:
      "A comprehensive online platform providing the complete Bible in various formats, allowing users to access scriptures easily and engage with spiritual content.",
    image:
      "https://i.kickstarter.com/assets/041/147/393/ad16ab165b1a1271e076e21c81a864ca_original.png?anim=false&fit=cover&gravity=auto&height=873&origin=ugc&q=92&v=1685578998&width=1552&sig=HtnQQ%2FeE7AC%2FLhhK2TF76vSQ1er8QvhWqppb6Nw6Z7s%3D",
    status: "Ongoing",
    github: "https://github.com/NestiaDev-id/Kitabku-Api",
    demo: "https://kitabku-api.vercel.app/",
  },
   {
    slug: "kasir-pos",
    title: "Kasir System (Point-of-Sale)",
    category: "Web Dev",
    description:
      "A point-of-sale (POS) system designed for retail businesses with two user roles: customers and cashiers. It allows seamless transaction handling and product management.",
    image:
      "https://i0.wp.com/isellerdotblog.wpcomstaging.com/wp-content/uploads/2023/10/aben08381.jpg?resize=750%2C666&ssl=1",
    status: "Production",
    github: "https://github.com/NestiaDev-id/Scapa-POS",
    demo: "#",
  },

  // Machine Learning
  {
    slug: "forecasting-holt-winter",
    title: "Optimization Holt-Winter Using Genetic Algorithm",
    category: "Machine Learning",
    description:
      "A forecasting model that utilizes the Holt-Winter method, optimized using Genetic Algorithms, to predict time series data with improved accuracy.",
    image: "/gambar2.png",
    status: "Completed",
    github:
      "https://github.com/NestiaDev-id/Optimization-Holt-winter-using-Genetic-algorithm",
    demo: "https://passager-ga-hw.vercel.app/",
  },
  {
    slug: "small-language-models-mobile",
    title: "Architectural Design of Small Language Models for Mobile Devices",
    category: "Machine Learning",
    description:
      "Research and architectural design of lightweight Small Language Models (SLMs) optimized for efficient on-device inference, reduced memory footprint, and low latency on mobile hardware.",
    image: "https://dgsthal.in/blogs/wp-content/uploads/2025/10/SLMs-on-Devices-1024x683.jpg", 
    status: "Ongoing",
    github:
      "https://github.com/NestiaDev-id/Architectural-Design-Small-Language-Models-for-Mobile-Devices",
    demo: "#",
  },
  {
    slug: "plant-growth-optimization",
    title: "Plant Growth Acceleration Analysis & Optimization",
    category: "Machine Learning",
    description:
      "A machine learning-driven analytical model designed to evaluate environmental variables and optimize growth acceleration parameters for improved agricultural yield.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9WB5Q7mtsn8o-aUF9J-g5TkPc_4BeMc83DjbIbmeDDdeab6rLZZqbGO_r&s=10", 
    status: "Ongoing",
    github:
      "https://github.com/NestiaDev-id/Analysis-and-Optimization-of-Plant-Growth-Acceleration",
    demo: "#",
  },
  {
    slug: "alpr-low-light-yolov8",
    title: "Low-Light Automatic License Plate Recognition with YOLOv8",
    category: "Machine Learning",
    description:
      "An optimized computer vision pipeline built on YOLOv8 to accurately detect and recognize vehicle license plates under challenging low-light and headlight glare conditions.",
    image: "https://mobisoftinfotech.com/resources/wp-content/uploads/2022/02/Number-Plate-Detection.png", 
    status: "Ongoing",
    github:
      "https://github.com/NestiaDev-id/Optimization-ALPR-Low-Light-YOLOv8",
    demo: "#",
  },
  {
    slug: "music-and-movie-recommendation",
    title: "Music and Movie Recommendation System",
    category: "Machine Learning",
    description:
      "A machine learning-based Music and Movie recommendation system utilizing collaborative filtering. Integrated with a ViteJS frontend, this system provides personalized recommendations to users.",
    image:
      "https://storage.googleapis.com/kaggle-datasets-images/3375918/5872805/e6c438e764799de9a90ae10bd32c51cc/dataset-cover.jpg?t=2023-06-08-06-58-37",
    status: "Ongoing",
    github: "#",
    demo: "#",
  },
  {
    slug: "chatbot-ai",
    title: "Chatbot AI",
    category: "Machine Learning",
    description:
      "A natural language processing (NLP)-based chatbot designed to engage in meaningful conversations with users, providing intelligent responses and improving interaction.",
    image:
      "https://www.guevariando.com/wp-content/uploads/2024/05/Mengenal-Chatbot-AI-dan-Cara-Membuatnya.png",
    status: "Development",
    github: "#",
    demo: "#",
  },
  {
    slug: "smart-cctv",
    title: "Smart CCTV (Vehicle and Human Detection)",
    category: "Machine Learning",
    description:
      "A smart CCTV system for vehicle and human detection using YOLO",
    image:
      "https://www.researchgate.net/publication/326312085/figure/fig1/AS:963443049898007@1606714131967/Object-detection-with-a-pretrained-YOLO-model.jpg",
    status: "Ongoing",
    github: "https://github.com/NestiaDev-id/Smart-CCTV",
    demo: "#",
  },
 
  {
    slug: "weather-forecasting",
    title: "Weather Forecasting & Rain Prediction in Indonesia",
    category: "Machine Learning",
    description:
      "A machine learning model designed to forecast weather conditions and predict rainfall in Indonesia. The system will be integrated into a website for easy access by users.",
    image:
      "https://imgsrv2.voi.id/8rfakvmSRjzZGmEvTmJU-lYcFMH84vw30I4GBOGYwIU/auto/1200/675/sm/1/bG9jYWw6Ly8vcHVibGlzaGVycy8yNDAzMjkvMjAyMjEyMzAxMDQ1LW1haW4uY3JvcHBlZF8xNjcyMzk0MzE3LmpwZw.jpg",
    status: "Ongoing",
    github: "https://github.com/NestiaDev-id/Map-Weathers",
    demo: "#",
  },

 // Apps & Games
  {
    slug: "wakul",
    title: "Wakul - Food & Ride Sharing App",
    category: "Apps & Games",
    description:
      "A Dart/Flutter-based mobile app combining food ordering and ride-sharing features. Users can order food/drinks and schedule delivery while using Google Maps for location tracking.",
    image:
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/035d20191314459.65c9cd731f289.jpg",
    status: "Completed",
    github: "https://github.com/NestiaDev-id/Wakul",
    demo: "#",
  },
  {
    slug: "vtuber-app",
    title: "VTuber AI Desktop Companion",
    category: "Apps & Games",
    description:
      "A lightweight cross-platform desktop VTuber application built with Rust and Tauri. Combines real-time avatar rendering, voice synthesis, and conversational AI capabilities with minimal system overhead.",
    image: "/images/projects/vtuber-app.png", 
    status: "Development", 
    github: "https://github.com/NestiaDev-id/vtuber-app", 
    demo: "#",
  },
  {
    slug: "pixel-art-game",
    title: "Pixel Art Game",
    category: "Apps & Games",
    description:
      "A 2D pixel-art desktop game developed using the Godot Engine. Features custom sprite animations, responsive character physics, and interactive level mechanics.",
    image: "/images/projects/pixel-art-game.png",
    status: "Development", 
    github: "https://github.com/NestiaDev-id/Pixel-Art-Game", 
    demo: "#",
  },
];
