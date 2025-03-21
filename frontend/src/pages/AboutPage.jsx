import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  FaPython,
  FaReact,
  FaNodeJs,
  FaJava,
  FaFigma,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiFastapi,
  SiDjango,
  SiPytorch,
  SiTypescript,
  SiNextdotjs,
  SiTableau,
  SiPostgresql,
  SiTensorflow,
  SiHuggingface,
} from "react-icons/si";

const techStack = [
  { name: "Figma", icon: <FaFigma />, color: "text-purple-400" },
  { name: "TypeScript", icon: <SiTypescript />, color: "text-blue-400" },
  { name: "Next.js", icon: <SiNextdotjs />, color: "text-gray-300" },
  { name: "Git", icon: <FaGitAlt />, color: "text-orange-500" },
  { name: "Python", icon: <FaPython />, color: "text-yellow-400" },
  { name: "FastAPI", icon: <SiFastapi />, color: "text-teal-400" },
  { name: "Django", icon: <SiDjango />, color: "text-green-500" },
  { name: "Tableau", icon: <SiTableau />, color: "text-indigo-400" },
  { name: "PyTorch", icon: <SiPytorch />, color: "text-red-500" },
  { name: "Hugging Face", icon: <SiHuggingface />, color: "text-yellow-500" },
  { name: "TensorFlow", icon: <SiTensorflow />, color: "text-orange-400" },
  { name: "PostgreSQL", icon: <SiPostgresql />, color: "text-blue-500" },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("competitions");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const data = {
    competitions: [
      { id: 1, content: "Winner of AI Hackathon 2023" },
      { id: 2, content: "Top 10 Finalist in Data Science Challenge" },
    ],
    internships: [
      { id: 1, content: "Data Scientist Intern at XYZ Company" },
      { id: 2, content: "Machine Learning Engineer Intern at ABC Tech" },
    ],
  };

  return (
    <div className="container mx-auto mt-20 p-4 text-gray-200">
      {/* Profile Section */}
      <section className="container flex flex-col xl:flex-row items-center xl:items-start gap-6 text-center xl:text-left">
        {/* Profile Image & Details */}
        <section className="flex flex-col items-center text-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700"
          >
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <h1 className="text-2xl font-bold">Yohanes Christian Devano</h1>
          <p className="text-gray-400 container">Mahasiswa Sanata Dharma</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="mt-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
            onClick={() => navigate("/chat-me")}
          >
            Chat with My AI Assistant
          </motion.button>
        </section>

        {/* About Me Section */}
        <section className="mt-8 xl:mt-0 xl:ml-12 text-center xl:text-left container">
          <h3 className="text-2xl font-bold">About Me</h3>
          <section className="mt-2 mb-4 text-gray-400 relative">
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : "100px" }}
              transition={{ duration: 0.5 }}
              className={`overflow-hidden relative`}
            >
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod,
                nobis optio quaerat distinctio in sunt quam voluptas, commodi,
                minus dicta deleniti! Animi corrupti, exercitationem odio
                adipisci iste natus officiis iure ea error. Ad eum nisi fugit
                deleniti quasi! Voluptate aut dolore quaerat accusantium
                excepturi pariatur eos perspiciatis mollitia, distinctio ducimus
                sequi consequatur id. Sed nemo, saepe possimus voluptate
                repellendus dolorem non nihil assumenda illo tempora? Quis,
                dolores dolorem. Numquam dolorem quasi neque velit quas, autem
                nam ut sit sint laborum modi vero, quaerat architecto ea odio
                quia asperiores omnis dolore necessitatibus porro illum animi
                labore? Commodi harum tempore error, ea illum, laboriosam
                consequatur temporibus qui exercitationem aut ratione
                cupiditate, animi inventore dignissimos facere ab asperiores at!
                Eum quos sapiente neque labore voluptatibus incidunt, cumque
                earum commodi amet ea perspiciatis, qui aperiam id suscipit unde
                quaerat quisquam beatae facere ipsa itaque, dolorem tenetur
                temporibus atque? Magnam ad, accusantium eius eum rem cupiditate
                perferendis explicabo expedita minima! Assumenda, maxime
                corrupti optio saepe perspiciatis vero ad temporibus, delectus
                odio eos, eligendi error harum magnam! Natus reiciendis facere
                impedit molestias consequuntur voluptatem adipisci officia quod
                inventore accusantium sint, nihil vero eius deserunt
                reprehenderit ab labore repellat quasi autem in assumenda illum
                blanditiis. Officia, maxime.
              </p>

              {/* Efek Fade-Out jika belum di-expand */}
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-16 "></div>
              )}
            </motion.div>

            {/* Tombol Show More / Show Less */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-blue-400 hover:underline focus:outline-none"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          </section>

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
          {/* Education Section */}
          <h4 className="text-2xl font-bold mt-4">Education</h4>
          <section className="flex flex-col xl:flex-row gap-12 mt-4">
            <p>
              Sanata Dharma University Yogyakarta <br /> Informatika, 2020 -
              2024
            </p>
            <p>
              SMP <br /> Informatika, 2020 - 2024
            </p>
          </section>
        </section>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto mt-8">
        <h2 className="text-3xl font-bold text-white mb-6">Tech Stack</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className={`text-4xl ${tech.color}`}>{tech.icon}</div>
              <p className="text-gray-300 mt-2">{tech.name}</p>
            </motion.div>
          ))}
        </div>
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
