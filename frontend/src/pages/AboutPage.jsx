import React, { useState } from "react";
import { Briefcase, Award } from "lucide-react";
import { motion } from "framer-motion";

// Data for competitions
const competitions = [
  {
    id: 1,
    content: "lorem ipsum dolor sit amet",
  },
  {
    id: 2,
    content: "lorem ipsum dolor sit amet",
  },
  {
    id: 3,
    content: "lorem ipsum dolor sit amet",
  },
];

const internships = [
  {
    id: 1,
    content: "Magang di PT. Teknologi AI sebagai Frontend Developer.",
  },
  {
    id: 2,
    content: "Magang Data Analyst di Startup XYZ.",
  },
];

// Timeline item component
const TimelineItem = ({ content }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative pl-8 mb-8"
    >
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-green-500 border-4 border-green-400"></div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600">
        <p className="text-white">{content}</p>
      </div>
    </motion.div>
  );
};

// Timeline wrapper component
const Timeline = ({ data }) => (
  <div className="relative border-l-2 border-gray-600 pl-6">
    {data.map((item) => (
      <TimelineItem key={item.id} content={item.content} />
    ))}
  </div>
);

// Main Experience component with Tabs
const Experience = () => {
  const [activeTab, setActiveTab] = useState("competition");

  return (
    <section className="bg-gray-900 p-8 mt-8 rounded-xl">
      <h2 className="text-3xl text-white font-bold mb-6">Pengalaman</h2>
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("competition")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            activeTab === "competition"
              ? "bg-gray-700 text-white"
              : "border-gray-500 text-gray-400"
          }`}
        >
          <Award className="w-5 h-5" />
          Competition
        </button>
        <button
          onClick={() => setActiveTab("internship")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            activeTab === "internship"
              ? "bg-gray-700 text-white"
              : "border-gray-500 text-gray-400"
          }`}
        >
          <Briefcase className="w-5 h-5" />
          Internship
        </button>
      </div>

      <div>
        {activeTab === "competition" && <Timeline data={competitions} />}
        {activeTab === "internship" && <Timeline data={internships} />}
      </div>
    </section>
  );
};

// Main AboutPage component
export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 text-gray-200">
      <h3 className="font-bold text-2xl mb-4">My Skills</h3>
      <div className="flex gap-2 flex-wrap">
        <span className="badge badge-outline">Artificial Intelligence</span>
        <span className="badge badge-outline">Data Analysis</span>
        <span className="badge badge-outline">UI/UX</span>
        <span className="badge badge-outline">Problem Solving</span>
        <span className="badge badge-outline">Management</span>
        <span className="badge badge-outline">Teamwork</span>
        <span className="badge badge-outline">Project Management</span>
      </div>

      <div className="mt-8">
        <h4 className="font-bold text-2xl mb-4">Education</h4>
        <p>
          Sanata Dharma University Yogyakarta <br /> lorem ipsum dolor sit amet
        </p>
      </div>

      {/* Experience section with tabs */}
      <Experience />

      {/* Download buttons */}
      <div className="mt-8 flex gap-4">
        <a href="path/to/your/cv.pdf" className="btn btn-primary" download>
          Download CV
        </a>
        <a
          href="path/to/your/resume.pdf"
          className="btn btn-secondary"
          download
        >
          Resume AI Engineer
        </a>
      </div>
    </div>
  );
}
