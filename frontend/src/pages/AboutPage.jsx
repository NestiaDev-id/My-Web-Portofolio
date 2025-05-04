import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { splitText } from "motion-plus";

import { Award, Briefcase, Circle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

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
import Cookies from "js-cookie";

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

// const timelineData = [
//   {
//     id: 1,
//     title: "Graduated from University",
//     description:
//       "Completed my Bachelor's degree in Computer Science.Lorem ipsum dolor sit amet consecteturadipisicing elit. Labore cum accusamus, magni eveniet sapiente corrupti sunt, dolorem ipsa eligendi ad, necessitatibus temporacommodi ex natus deserunt! Pariatur, autem incidunt molestias magnamsapiente provident iure illum exercitationem delectus voluptatemullam. Officia enim est unde eaque quidem! ",
//     date: "2020",
//     icon: <GraduationCap className="w-6 h-6 text-blue-500" />,
//   },
//   {
//     id: 2,
//     title: "First Job at TechCorp",
//     description: "Started my career as a Software Engineer.",
//     date: "2021",
//     icon: <Briefcase className="w-6 h-6 text-green-500" />,
//   },
//   {
//     id: 3,
//     title: "Promoted to Senior Engineer",
//     description: "Led a team of developers on major projects.",
//     date: "2023",
//     icon: <Briefcase className="w-6 h-6 text-yellow-500" />,
//   },
// ];

const experiences = [
  {
    img: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    role: "Software Engineer",
    company: "TechCorp",
    date: "Jan 2020 - Present",
    desc: "Developing and maintaining web applications.     Completed my Bachelor's degree in Computer Science.Lorem ipsum dolor sit amet consecteturadipisicing elit. Labore cum accusamus, magni eveniet sapiente corrupti sunt, dolorem ipsa eligendi ad, necessitatibus temporacommodi ex natus deserunt! Pariatur, autem incidunt molestias magnamsapiente provident iure illum exercitationem delectus voluptatemullam. Officia enim est unde eaque quidem! ",
    skills: ["JavaScript", "React", "Node.js"],
  },
  {
    img: "https://seeklogo.com/images/N/netlify-logo-BD8F8A77E2-seeklogo.com.png",
    role: "Frontend Developer",
    company: "Web Solutions",
    date: "Jun 2018 - Dec 2019",
    desc: "Building responsive UI components and optimizing performance.",
    skills: ["HTML", "CSS", "Vue.js"],
  },
];

const Experience = () => {
  return (
    <div id="Experience" className="flex flex-col items-center mt-12 z-10">
      <div className="max-w-5xl w-full flex flex-col items-center gap-4">
        <h2 className="text-4xl font-semibold text-center text-gray-100 sm:text-2xl">
          Experience
        </h2>
        <p className="text-lg text-center text-gray-400 mb-10 sm:text-sm">
          My work experience as a software engineer and working on different
          companies and projects.
        </p>
        <VerticalTimeline>
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              experience={experience}
            />
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

const ExperienceCard = ({ experience }) => {
  return (
    <VerticalTimelineElement
      icon={
        <img
          className="w-full h-full rounded-full object-cover"
          src={experience?.img}
          alt={experience?.company}
        />
      }
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.125)",
      }}
      contentArrowStyle={{ borderRight: "7px solid rgba(255, 255, 255, 0.3)" }}
      date={experience?.date}
    >
      <div className="flex gap-3">
        <img
          src={experience?.img}
          alt={experience?.company}
          className="h-12 w-12 rounded-lg sm:h-10 sm:w-10"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 sm:text-base">
            {experience?.role}
          </h3>
          <p className="text-sm font-medium text-gray-400 sm:text-xs">
            {experience?.company}
          </p>
          <p className="text-xs text-gray-500 sm:text-[10px]">
            {experience?.date}
          </p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mt-2 sm:text-xs">
        {experience?.desc}
      </p>
      {experience?.skills && (
        <div className="mt-2">
          <b className="text-gray-300">Skills:</b>
          <div className="flex flex-wrap gap-2 mt-1">
            {experience?.skills?.map((skill, index) => (
              <span
                key={index}
                className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </VerticalTimelineElement>
  );
};

export default function ProfilePage() {
  // const [activeTab, setActiveTab] = useState("competitions");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState("");

  // const data = {
  //   competitions: [
  //     { id: 1, content: "Winner of AI Hackathon 2023" },
  //     { id: 2, content: "Top 10 Finalist in Data Science Challenge" },
  //   ],
  //   internships: [
  //     { id: 1, content: "Data Scientist Intern at XYZ Company" },
  //     { id: 2, content: "Machine Learning Engineer Intern at ABC Tech" },
  //   ],
  // };

  // get api from localhost:3000/api/about
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL;
    const userId = import.meta.env.VITE_USER_ID;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://backend-unknown-portofolio.vercel.app/api/data/user?type=public&userId=6805ed20adf3bf91069c1a28`
        );
        const result = await response.json();
        setUserData(result);
        console.log(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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

          <h1 className="text-2xl font-bold">{userData.name}</h1>
          <p className="text-gray-400 container">{userData.university}</p>

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
              <p>{userData.aboutme}</p>

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
            {userData.skills?.map((skill) => (
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

      <Experience />

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
