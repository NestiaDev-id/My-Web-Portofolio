import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";

const projects = [
  {
    title: "Forecasting with Holt-Winter and Genetic Algorithm",
    category: "Data Science", // Data Science (Machine Learning + Data Analysis)
    description:
      "A forecasting model that utilizes the Holt-Winter method, optimized using Genetic Algorithms, to predict time series data with improved accuracy.",
    image: "/gambar2.png",
    status: "Completed",
    github:
      "https://github.com/NestiaDev-id/Optimization-Holt-winter-using-Genetic-algorithm",
    demo: "https://passager-ga-hw.vercel.app/",
  },
  {
    title: "Wakul - Food & Ride Sharing App",
    category: "Mobile Development", // Mobile App (Flutter)
    description:
      "A Dart/Flutter-based mobile app combining food ordering and ride-sharing features. Users can order food/drinks and schedule delivery while using Google Maps for location tracking.",
    image:
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/035d20191314459.65c9cd731f289.jpg",
    status: "Completed",
    github: "https://github.com/NestiaDev-id/Wakul",
    demo: "#",
  },
  {
    title: "Movie Recommendation System",
    category: "Data Science", // Machine Learning + Data Analysis
    description:
      "A machine learning-based movie recommendation system utilizing collaborative filtering. Integrated with a ViteJS frontend, this system provides personalized recommendations to users.",
    image:
      "https://storage.googleapis.com/kaggle-datasets-images/3375918/5872805/e6c438e764799de9a90ae10bd32c51cc/dataset-cover.jpg?t=2023-06-08-06-58-37",
    status: "Ongoing",
    github: "#",
    demo: "#",
  },
  {
    title: "Chatbot AI",
    category: "Data Science", // AI + Machine Learning
    description:
      "A natural language processing (NLP)-based chatbot designed to engage in meaningful conversations with users, providing intelligent responses and improving interaction.",
    image:
      "https://www.guevariando.com/wp-content/uploads/2024/05/Mengenal-Chatbot-AI-dan-Cara-Membuatnya.png",
    status: "Development",
    github: "#",
    demo: "#",
  },
  {
    title: "Authentication System",
    category: "Web Development", // Web Security
    description:
      "A robust authentication system providing security features such as CSRF, token-based authentication, refresh tokens, rate limiting, sliding sessions, IP blocking, and Argon2 encryption.",
    image: "/gambar1.jpeg",
    status: "Completed",
    github: "https://github.com/NestiaDev-id/Auth-Defense-System",
    demo: "#",
  },
  {
    title: "Smart CCTV for Vehicle Detection",
    category: "Data Science", // AI/Computer Vision + ML
    description:
      "A smart CCTV system for vehicle detection using YOLO, CNN, and LSTM algorithms, optimized with genetic algorithms to improve accuracy in real-time monitoring.",
    image:
      "https://www.researchgate.net/publication/326312085/figure/fig1/AS:963443049898007@1606714131967/Object-detection-with-a-pretrained-YOLO-model.jpg",
    status: "Development",
    github: "https://github.com/NestiaDev-id/Smart-CCTV",
    demo: "#",
  },
  {
    title: "Kasir System (Point-of-Sale)",
    category: "Website Development", // Web Application
    description:
      "A point-of-sale (POS) system designed for retail businesses with two user roles: customers and cashiers. It allows seamless transaction handling and product management.",
    image:
      "https://i0.wp.com/isellerdotblog.wpcomstaging.com/wp-content/uploads/2023/10/aben08381.jpg?resize=750%2C666&ssl=1",
    status: "Production",
    github: "https://scapa.vercel.app/",
    demo: "#",
  },
  {
    title: "Weather Forecasting & Rain Prediction in Indonesia",
    category: "Data Science", // Machine Learning + Data Analysis
    description:
      "A machine learning model designed to forecast weather conditions and predict rainfall in Indonesia. The system will be integrated into a website for easy access by users.",
    image:
      "https://imgsrv2.voi.id/8rfakvmSRjzZGmEvTmJU-lYcFMH84vw30I4GBOGYwIU/auto/1200/675/sm/1/bG9jYWw6Ly8vcHVibGlzaGVycy8yNDAzMjkvMjAyMjEyMzAxMDQ1LW1haW4uY3JvcHBlZF8xNjcyMzk0MzE3LmpwZw.jpg",
    status: "Ongoing",
    github: "https://github.com/NestiaDev-id/Map-Weathers",
    demo: "#",
  },
  {
    title: "ChatMessage MultiUser",
    category: "Website Development", // Web Application
    description:
      "A messaging platform with multi-user support, similar to traditional chat apps, allowing users to communicate in real-time in a secure environment.",
    image:
      "https://cdn5.vectorstock.com/i/1000x1000/91/94/mobile-phone-chat-message-notifications-chatting-vector-22379194.jpg",
    status: "Completed",
    github: "https://github.com/NestiaDev-id/ChatApp",
    demo: "#",
  },
  {
    title: "Bible",
    category: "Website Development", // Web Application
    description:
      "A comprehensive online platform providing the complete Bible in various formats, allowing users to access scriptures easily and engage with spiritual content.",
    image:
      "https://i.kickstarter.com/assets/041/147/393/ad16ab165b1a1271e076e21c81a864ca_original.png?anim=false&fit=cover&gravity=auto&height=873&origin=ugc&q=92&v=1685578998&width=1552&sig=HtnQQ%2FeE7AC%2FLhhK2TF76vSQ1er8QvhWqppb6Nw6Z7s%3D",
    status: "Ongoing",
    github: "https://github.com/NestiaDev-id/Kitabku-Api",
    demo: "https://kitabku-api.vercel.app/",
  },
];

export default function ProjectPage() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="container mx-auto mt-16 p-6 min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors duration-300">
        Proyek
      </h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          "All",
          "Website Development",
          "Data Science",
          "Mobile Development",
        ].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all duration-300 ${
              filter === category
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg"
            onClick={() => navigate("/projects/detail")}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3
              className="text-xl font-bold mb-2 cursor-pointer text-gray-900 dark:text-white hover:text-blue-400"
              onClick={() => navigate("/projects/detail")}
            >
              {project.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description}
            </p>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                project.status === "Production"
                  ? "bg-green-500 text-black"
                  : project.status === "Completed"
                  ? "bg-blue-500 text-black"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {project.status}
            </span>
            <div className="flex gap-4 mt-4">
              <a
                href={project.github}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                <Github size={18} />
                Github
              </a>
              <a
                href={project.demo}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-500 transition"
              >
                <Globe size={18} />
                Demo
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll To Top */}
      <ScrollToTop />
    </div>
  );
}
