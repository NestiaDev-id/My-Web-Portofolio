import React, { useState } from "react";
import { Briefcase, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("competitions");

  const data = {
    competitions: [
      { id: 1, content: "Juara 1 Hackathon Nasional 2023." },
      { id: 2, content: "Finalis Data Science Challenge 2022." },
      { id: 3, content: "Juara 3 UI/UX Design Competition." },
    ],
    internships: [
      { id: 1, content: "Frontend Developer di PT. Teknologi AI." },
      { id: 2, content: "Data Analyst di Startup XYZ." },
    ],
  };

  return (
    <div className="container mx-auto mt-16 p-4 text-gray-200">
      {/* Profile Section */}
      <section className="flex flex-col xl:flex-row items-center xl:items-start gap-6 text-center xl:text-left">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 rounded-full overflow-hidden"
        >
          <img
            src="https://avatars.githubusercontent.com/u/43261171?v=4"
            alt="Profile Picture"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Skills Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4">My Skills</h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-2 flex-wrap justify-center xl:justify-start"
          >
            {[
              "Artificial Intelligence",
              "Data Analysis",
              "UI/UX",
              "Problem Solving",
              "Management",
              "Teamwork",
              "Project Management",
            ].map((skill) => (
              <motion.span
                key={skill}
                className="badge badge-outline"
                whileHover={{ scale: 1.1 }}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Education Section */}
      <section className="mt-8">
        <h4 className="text-2xl font-bold mb-4">Education</h4>
        <p>
          Sanata Dharma University Yogyakarta <br /> Informatika, 2020 - 2024
        </p>
      </section>

      {/* Experience Section */}
      <section className="bg-gray-900 p-8 mt-8 rounded-xl">
        <h2 className="text-3xl text-white font-bold mb-6">Pengalaman</h2>
        <div className="flex space-x-4 mb-8">
          {["competitions", "internships"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                activeTab === tab
                  ? "bg-gray-700 text-white"
                  : "border-gray-500 text-gray-400"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {tab === "competitions" ? (
                <Award className="w-5 h-5" />
              ) : (
                <Briefcase className="w-5 h-5" />
              )}
              {tab === "competitions" ? "Competition" : "Internship"}
            </motion.button>
          ))}
        </div>
        <div className="relative border-l-2 border-gray-600 pl-6">
          {data[activeTab].map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative pl-8 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-green-500 border-4 border-green-400"></div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600">
                <p className="text-white">{item.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Download CV & Resume Section */}
      <section className="mt-8 text-center">
        <h4 className="text-xl font-bold mb-4">Download My Documents</h4>
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="path/to/your/cv.pdf"
            className="btn btn-primary"
            download
            whileHover={{ scale: 1.1 }}
          >
            Download CV
          </motion.a>
          <motion.a
            href="path/to/your/resume.pdf"
            className="btn btn-secondary"
            download
            whileHover={{ scale: 1.1 }}
          >
            Resume AI Engineer
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
