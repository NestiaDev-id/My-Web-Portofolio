import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
// import {
//   Brain,
//   Code2,
//   ServerCog,
//   Users,
//   Lightbulb,
//   BarChart4,
// } from "lucide-react";
import {
  FaPython,
  FaFigma,
  FaGitAlt,
  FaReact,
  FaNodeJs,
  FaDocker,
  FaLinux,
  FaJava,
} from "react-icons/fa";
import {
  SiFastapi,
  SiPytorch,
  SiTypescript,
  SiNextdotjs,
  SiPostgresql,
  SiTensorflow,
  SiHuggingface,
  SiJavascript,
  SiPhp,
  SiDart,
  SiFlutter,
  SiGo,
  SiTailwindcss,
  SiBootstrap,
  SiExpress,
  SiLaravel,
  SiMongodb,
  SiMysql,
  SiFirebase,
  SiSupabase,
  SiPostman,
  SiPowers,
  SiGooglecloud,
} from "react-icons/si";

import { Badge } from "@/components/ui/badge";
import Marquee from "react-fast-marquee";

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
// interface TechStack {
//   name: string;
//   icon: React.ReactNode;
//   color: string;
// }

const techStack = [
  // Bahasa Pemrograman
  { name: "JavaScript", icon: <SiJavascript />, color: "text-yellow-400" },
  { name: "TypeScript", icon: <SiTypescript />, color: "text-blue-400" },
  { name: "Python", icon: <FaPython />, color: "text-yellow-400" },
  { name: "Go", icon: <SiGo />, color: "text-teal-400" },
  { name: "PHP", icon: <SiPhp />, color: "text-indigo-400" },
  { name: "Dart", icon: <SiDart />, color: "text-blue-500" },
  { name: "Java", icon: <FaJava />, color: "text-red-500" },

  // Pengembangan Frontend
  { name: "React", icon: <FaReact />, color: "text-blue-400" },
  { name: "Next.js", icon: <SiNextdotjs />, color: "text-gray-300" },
  { name: "Flutter", icon: <SiFlutter />, color: "text-blue-400" },
  { name: "Tailwind CSS", icon: <SiTailwindcss />, color: "text-teal-400" },
  { name: "Bootstrap", icon: <SiBootstrap />, color: "text-purple-400" },
  { name: "Figma", icon: <FaFigma />, color: "text-purple-400" },

  // Pengembangan Backend
  { name: "Node.js", icon: <FaNodeJs />, color: "text-green-500" },
  { name: "Express.js", icon: <SiExpress />, color: "text-gray-300" },
  { name: "FastAPI", icon: <SiFastapi />, color: "text-teal-400" },
  { name: "Laravel", icon: <SiLaravel />, color: "text-red-500" },

  // Basis Data
  { name: "MongoDB", icon: <SiMongodb />, color: "text-green-500" },
  { name: "PostgreSQL", icon: <SiPostgresql />, color: "text-blue-500" },
  { name: "MySQL", icon: <SiMysql />, color: "text-blue-400" },
  { name: "Firebase", icon: <SiFirebase />, color: "text-yellow-400" },
  { name: "Supabase", icon: <SiSupabase />, color: "text-green-400" },

  // Alat dan DevOps
  { name: "Git", icon: <FaGitAlt />, color: "text-orange-500" },
  { name: "Docker", icon: <FaDocker />, color: "text-blue-400" },
  { name: "Postman", icon: <SiPostman />, color: "text-orange-400" },
  { name: "Linux", icon: <FaLinux />, color: "text-gray-500" },
  { name: "PowerShell", icon: <SiPowers />, color: "text-blue-500" },
  { name: "Google Cloud", icon: <SiGooglecloud />, color: "text-blue-400" },

  // Pembelajaran Mesin dan Analisis Data
  { name: "TensorFlow", icon: <SiTensorflow />, color: "text-orange-400" },
  { name: "PyTorch", icon: <SiPytorch />, color: "text-red-500" },
  { name: "Hugging Face", icon: <SiHuggingface />, color: "text-yellow-500" },
];

const experiences: ExperienceData[] = [
  {
    img: "https://www.usd.ac.id/logo/usd.png",
    role: "Computer Science Undergraduate",
    company: "Sanata Dharma University",
    date: "Aug 2021 – Dec 2024",
    desc: "Pursuing a Bachelor's degree in Computer Science with a focus on software engineering and data-driven technologies. Actively involved in academic projects and research, including web application development, machine learning experiments, and system design. Engaged in collaborative team work and presentations to solve real-world problems with code.",
    skills: [
      "JavaScript",
      "Java",
      "Python",
      "SQL",
      "Git",
      "Kotlin",
      "Team Work",
      "Critical Thinking",
      "Problem Solving",
      "Leadership",
      "Communication",
      "Time Management",
      "Project Management",
      "Collaboration",
      "Agile Development",
      "Scrum Methodology",
      "Kanban Methodology",
      "Agile Methodology",
    ],
  },
  {
    img: "https://www.logo.wine/a/logo/Microsoft_Store/Microsoft_Store-Logo.wine.svg",
    role: "Artificial Intelligence Scholarship Student",
    company: "Elevate Program by Dicoding",
    date: "Jan 2025 – Present",
    desc: "Awarded the Artificial Intelligence Scholarship through the Elevate Program by Dicoding, a comprehensive initiative by Microsoft that equips participants with the skills to design and deploy AI solutions using Azure AI services. This program covers everything from natural language processing and computer vision to building generative AI applications, empowering students to tackle real-world challenges with cutting-edge AI technologies.",
    skills: [
      "Natural Language Processing (NLP)",
      "Azure OpenAI",
      "Microsoft Azure",
      "GitHub",
      "Computer Vision",
      "OpenCV",
      "Git",
      "Document Processing with Form Recognizer",
      "Azure AI Vision Solutions",
      "Semantic Kernel",
      "Azure DevOps",
      "AI Security",
      "Cloud-Native App Development with Azure",
      "AI and Data Science Solutions",
      "Azure Container Apps",
      "Generative AI Applications",
    ],
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
        <div className="flex flex-col leading-tight space-y-0.5">
          <span className="text-lg font-semibold text-gray-300 sm:text-base">
            {experience.role}
          </span>
          <span className="text-sm font-medium text-gray-400 sm:text-sm">
            {experience.company}
          </span>
          <span className="text-xs text-gray-500 sm:text-[11px]">
            {experience.date}
          </span>
        </div>
      </div>

      <p className="text-gray-300 text-sm mt-2 sm:text-xs">{experience.desc}</p>
      {experience.skills && experience.skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm text-gray-400 font-semibold mb-1">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-600 transition"
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
  const [, setUserData] = useState<UserData | null>(null);

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
      <section className="container flex flex-col text-black xl:flex-row items-center xl:items-start gap-6 text-center xl:text-left">
        {/* Profile Image & Details */}
        <section className="flex flex-col items-center text-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg transition-all">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ rotateY: 360 }}
            transition={{ duration: 0.8 }}
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 dark:border-gray-300"
            style={{ perspective: 1000 }}
          >
            <motion.img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              alt="Profile Picture"
              className="w-full h-full object-cover"
              style={{ backfaceVisibility: "hidden" }}
            />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Yohanes Christian Devano
          </h1>
          <p className="text-gray-400 dark:text-gray-300">
            Mahasiswa Sanata Dharma
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="mt-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 dark:border-gray-500 rounded-lg text-gray-300 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-600"
            onClick={() => navigate("/chat-me")}
          >
            Chat with My AI Assistant
          </motion.button>
        </section>

        {/* About Me Section */}
        <section className="mt-8 xl:mt-0 xl:ml-12 text-center text-black xl:text-left container">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            About Me
          </h3>
          <section className="mt-2 mb-4 relative">
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : "100px" }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden relative"
            >
              <p className="text-justify text-gray-900 dark:text-gray-200">
                Hi, I’m Christian, a passionate software engineer with a strong
                background in full-stack development, artificial intelligence,
                and data analytics. I specialize in building intelligent,
                scalable, and high-performance applications. I’ve worked with
                various technologies including Python, JavaScript, TypeScript,
                Golang, Next.js, FastAPI, and Flutter. My backend expertise
                spans RESTful APIs, microservices, and database optimization. I
                also have experience in modern frontend development using React,
                Tailwind CSS, and Figma for prototyping. Throughout my academic
                and professional journey, I’ve consistently pursued innovation.
                My interest in AI began during university, where I worked on
                time series forecasting using Holt-Winters optimized by Genetic
                Algorithms. Later, I explored YOLO, CNNs, and LSTM models,
                combining them into intelligent pipelines for real-time
                detection and prediction tasks. These experiences taught me how
                to turn raw data into actionable insights. I’m also proficient
                in data visualization tools like Tableau and adept at
                communicating technical insights in a simple and effective
                manner. My goal is to solve complex problems with clean,
                efficient code while ensuring a seamless user experience. I
                enjoy collaborating with diverse teams and thrive in
                environments that encourage learning and experimentation. I
                believe that teamwork, empathy, and communication are just as
                important as technical skills. Curiosity drives me. I’m always
                eager to learn new frameworks, study emerging technologies, and
                contribute to open-source projects. Currently, I’m focused on
                integrating AI with software products to create intelligent,
                automated solutions for real-world problems. I believe that
                technology should serve people not the other way around. I’m
                available for collaboration, freelance projects, or full-time
                opportunities where I can bring value through my unique blend of
                AI, software engineering, and strategic thinking.
              </p>
            </motion.div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-blue-400 hover:underline focus:outline-none dark:text-blue-300 dark:hover:text-blue-500"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>
          </section>

          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            My Skills
          </h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-2 flex-wrap justify-center xl:justify-start"
          >
            {[
              "Artificial Intelligence",
              "Machine Learning",
              "Computer Vision",
              "Forecasting",
              "Data Analysis",
              "Data Visualization",
              "Problem Solving",
              "Team Work & Collaboration",
              "Personal Growth",
              "Curious & Passionate",
            ].map((skill) => (
              <motion.div key={skill} whileHover={{ scale: 1.1 }}>
                <Badge
                  variant="outline"
                  className="text-sm dark:bg-gray-800 dark:text-white border-gray-400 dark:border-gray-600"
                >
                  {skill}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto mt-8 px-4">
        <h2 className="text-3xl font-bold text-white mb-6">Tech Stack</h2>

        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((rowIndex) => (
            <Marquee
              key={rowIndex}
              pauseOnHover
              speed={50 + rowIndex * 10} // Baris bawah lebih cepat
              gradient={false}
              direction={rowIndex % 2 === 0 ? "left" : "right"} // Pola arah: kiri, kanan, kiri
            >
              <div className="flex gap-6">
                {techStack.map((tech, index) => (
                  <div
                    key={`${rowIndex}-${index}`}
                    className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 min-w-[120px]"
                  >
                    <div className={`text-4xl ${tech.color}`}>{tech.icon}</div>
                    <p className="text-gray-300 mt-2 text-sm text-center">
                      {tech.name}
                    </p>
                  </div>
                ))}
              </div>
            </Marquee>
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
