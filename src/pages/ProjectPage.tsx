import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";

import { projects } from "../data/projects";

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
            onClick={() =>
              navigate(`/projects/${project.slug}`, {
                state: { github: project.github, demo: project.demo },
              })
            }
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3
              className="text-xl font-bold mb-2 cursor-pointer text-gray-900 dark:text-white hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${project.slug}`, {
                  state: { github: project.github, demo: project.demo },
                });
              }}
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
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={18} />
                Github
              </a>
              <a
                href={project.demo}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-500 transition"
                onClick={(e) => e.stopPropagation()}
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
