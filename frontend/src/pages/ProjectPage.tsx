import React, { useState } from "react";
import { motion } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";

const projects = [
  {
    title: "Pancarima",
    category: "Website",
    description:
      "Pancarima adalah sebuah website yang memberikan informasi terkait tempat wisata yang ada di Indonesia. Dibuat pada saat kegiatan lomba Sagasitas Februari 2024.",
    image: "https://picsum.photos/400/300?random=1",
    status: "Production",
    github: "#",
    demo: "#",
  },
  {
    title: "Kasir Festo",
    category: "Website",
    description:
      "Kasir Festo merupakan sebuah platform kasir sederhana yang dibuat karena tugas dari sekolah saya.",
    image: "https://picsum.photos/400/300?random=2",
    status: "Production",
    github: "#",
    demo: "#",
  },
  {
    title: "Zabod",
    category: "Website",
    description:
      "Zabod merupakan sebuah platform toko online keyboard yang memungkinkan pembeli untuk kostumisasi keyboard sesuai keinginan.",
    image: "https://picsum.photos/400/300?random=3",
    status: "Development",
    github: "#",
    demo: "#",
  },
  {
    title: "Analisis Penjualan",
    category: "Data Analysis",
    description:
      "Analisis data penjualan menggunakan Python dan Pandas untuk mendapatkan insight dari data transaksi.",
    image: "https://picsum.photos/400/300?random=4",
    status: "Completed",
    github: "#",
    demo: "#",
  },
  {
    title: "Prediksi Harga Saham",
    category: "Machine Learning",
    description:
      "Model machine learning untuk memprediksi harga saham berdasarkan data historis menggunakan LSTM.",
    image: "https://picsum.photos/400/300?random=5",
    status: "Ongoing",
    github: "#",
    demo: "#",
  },
  {
    title: "Sistem Rekomendasi Film",
    category: "Machine Learning",
    description:
      "Menggunakan algoritma collaborative filtering untuk merekomendasikan film berdasarkan preferensi pengguna.",
    image: "https://picsum.photos/400/300?random=6",
    status: "Completed",
    github: "#",
    demo: "#",
  },
  {
    title: "Chatbot AI",
    category: "Artificial Intelligence",
    description:
      "Chatbot berbasis NLP yang dapat memahami dan merespons percakapan pengguna secara natural.",
    image: "https://picsum.photos/400/300?random=7",
    status: "Development",
    github: "#",
    demo: "#",
  },
  {
    title: "Face Recognition System",
    category: "Computer Vision",
    description:
      "Sistem pengenalan wajah menggunakan OpenCV dan deep learning untuk identifikasi pengguna.",
    image: "https://picsum.photos/400/300?random=8",
    status: "Completed",
    github: "#",
    demo: "#",
  },
];

export default function ProjectPage() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="container mx-auto mt-16 p-6 text-gray-200">
      <h2 className="text-4xl font-bold text-center mb-12">Proyek</h2>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        {["All", "Website", "Data Analysis"].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === category
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-900 p-6 rounded-lg shadow-lg"
            onClick={() => navigate("/projects/detail")}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3
              className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-400"
              onClick={() => navigate("/projects/detail")}
            >
              {project.title}
            </h3>{" "}
            <p className="text-gray-400 mb-4">{project.description}</p>
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
                className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg text-white hover:bg-gray-700 transition"
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
