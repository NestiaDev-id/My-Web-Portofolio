import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
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
interface TechStack {
  name: string;
  icon: React.ReactNode;
  color: string;
}

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
