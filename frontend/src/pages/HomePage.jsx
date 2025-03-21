import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import reactLogo from "../assets/react.svg";
import CertificationCard from "../components/CertificationCarousel";

function HomePage() {
  return (
    <div className="container mx-auto md:mt-16 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="container mt-24 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-8 w-full max-w-6xl px-6">
        {/* Left Side */}
        <div className="text-center md:text-left text-xl md:text-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-primary">Hi 👋</h1>
            <h2 className="mt-2 text-3xl font-semibold text-secondary">
              I'm Yohanes Christian Devano
            </h2>
            <TypeAnimation
              sequence={[
                "Fullstack Development",
                1000,
                "Web Development",
                1000,
                "Mobile Development",
                1000,
                "Software Engineering",
                1000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="mt-4 block text-accent text-xl font-semibold md:text-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
            className="w-full h-0.5 bg-secondary mt-4"
          ></motion.div>

          <p className="mt-4 text-center md:text-left">Contact me:</p>
          <div className="flex gap-4 mt-2 justify-center md:justify-start">
            <ContactIcon
              href="https://github.com/NestiaDev-id"
              icon={<Github className="w-6 h-6" />}
            />
            <ContactIcon
              href="https://www.linkedin.com/in/yohanes-christian-devano/"
              icon={<Linkedin className="w-6 h-6" />}
            />
            <ContactIcon
              href="mailto:yohanesdevano90@gmail.com"
              icon={<Mail className="w-6 h-6" />}
            />
            <ContactIcon
              href="https://api.whatsapp.com/send/?phone=6281325720265"
              icon={<Phone className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="relative flex justify-center items-center mt-12">
          <motion.svg
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-64 md:w-80 opacity-80 absolute"
          >
            <path
              fill="var(--color-accent-hover)"
              d="M38.9,-64.4C48.4,-61.9,52.8,-47.5,60.3,-34.8C67.7,-22,78.1,-11,77.6,-0.3C77.1,10.4,65.7,20.9,57,31.4C48.3,41.8,42.3,52.3,33.2,50.5C24.2,48.7,12.1,34.7,-0.8,36.1C-13.7,37.5,-27.5,54.5,-41.5,59.1C-55.4,63.7,-69.7,56.1,-69.4,44.2C-69.2,32.3,-54.6,16.1,-51.6,1.7C-48.5,-12.6,-57.1,-25.3,-54.9,-33C-52.7,-40.6,-39.6,-43.3,-28.7,-45C-17.7,-46.8,-8.9,-47.5,2.9,-52.5C14.7,-57.6,29.4,-66.9,38.9,-64.4Z"
              transform="translate(100 100)"
            />
          </motion.svg>
          <motion.img
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
            src={reactLogo}
            alt="React Logo"
            className="w-32 md:w-48 relative"
          />
        </div>
      </section>

      {/* Motivation Section */}
      <section className="mt-24 flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <h2 className="text-3xl md:text-2xl font-bold text-primary">
            Motivation
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-start"
        >
          <span className="text-4xl md:text-5xl font-bold text-accent">
            &ldquo;
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-left text-secondary"
        >
          <p className="text-lg font-semibold">
            I am a{" "}
            <span className="text-accent font-bold">
              lorem ipsum dolor sit amet
            </span>{" "}
            and <span className="text-accent font-bold">lorem ipsum</span>{" "}
            enthusiast with a passion for{" "}
            <span className="text-accent font-bold">lorem ipsum</span>.
          </p>
          <p className="text-lg font-semibold mt-6">
            -- <span className="text-accent font-bold">Unknown</span>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-end xl:mt-6 sm:mt-2"
        >
          <span className="text-4xl md:text-5xl font-bold text-accent">
            &rdquo;
          </span>
        </motion.div>
      </section>

      {/* Certification Card Section */}
      {/* <CertificationCard /> */}
    </div>
  );
}

const ContactIcon = ({ href, icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  >
    {icon}
  </motion.a>
);

export default HomePage;
