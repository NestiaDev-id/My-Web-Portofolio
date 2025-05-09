import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaPython, FaFigma, FaGitAlt } from "react-icons/fa";
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

// Tipe untuk data pengguna
interface UserData {
  name: string;
  university: string;
  aboutme: string;
  skills: string[];
}

// Tipe untuk pengalaman kerja
interface ExperienceData {
  img: string;
  role: string;
  company: string;
  date: string;
  desc: string;
  skills: string[];
}

// Tipe untuk teknologi
interface TechStack {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const techStack: TechStack[] = [
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

const experiences: ExperienceData[] = [
  {
    img: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    role: "Software Engineer",
    company: "TechCorp",
    date: "Jan 2020 - Present",
    desc: "Developing and maintaining web applications.",
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

const ExperienceCard: React.FC<{ experience: ExperienceData }> = ({
  experience,
}) => {
  return (
    <VerticalTimelineElement
      icon={
        <img
          className="w-full h-full rounded-full object-cover"
          src={experience.img}
          alt={experience.company}
        />
      }
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.125)",
      }}
      contentArrowStyle={{ borderRight: "7px solid rgba(255, 255, 255, 0.3)" }}
      date={experience.date}
    >
      <div className="flex gap-3">
        <img
          src={experience.img}
          alt={experience.company}
          className="h-12 w-12 rounded-lg sm:h-10 sm:w-10"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-300 sm:text-base">
            {experience.role}
          </h3>
          <p className="text-sm font-medium text-gray-400 sm:text-xs">
            {experience.company}
          </p>
          <p className="text-xs text-gray-500 sm:text-[10px]">
            {experience.date}
          </p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mt-2 sm:text-xs">{experience.desc}</p>
      {experience.skills && (
        <div className="mt-2">
          <b className="text-gray-300">Skills:</b>
          <div className="flex flex-wrap gap-2 mt-1">
            {experience.skills.map((skill, index) => (
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

const AboutPage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://backend-unknown-portofolio.vercel.app/api/data/user?type=public&userId=6805ed20adf3bf91069c1a28`
        );
        const result: UserData = await response.json();
        setUserData(result);
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

          <h1 className="text-2xl font-bold">{userData?.name}</h1>
          <p className="text-gray-400 container">{userData?.university}</p>

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
              <p>{userData?.aboutme}</p>
            </motion.div>

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
            {userData?.skills?.map((skill) => (
              <motion.span
                key={skill}
                className="badge badge-outline"
                whileHover={{ scale: 1.1 }}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
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
    </div>
  );
};

export default AboutPage;
