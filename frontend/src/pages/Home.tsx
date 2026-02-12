import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import ContactIcon from "../components/ContactIcon";

// Lazy load the heavy 3D scene
const PhysicsScene = lazy(() => import("../components/PhysicsScene"));

function HomePage() {
  return (
    <div className="container mx-auto md:mt-16 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="relative container mt-24 w-full max-w-6xl px-6 min-h-[500px] md:min-h-[600px] flex items-center">
        {/* The 3D Layer - Absolute Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
          <div className="w-full h-full pointer-events-auto">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                   <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <PhysicsScene />
            </Suspense>
          </div>
        </div>

        {/* Content Layer - Above 3D */}
        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-8 w-full pointer-events-none">
          {/* Left Side (Text) */}
          <div className="text-center md:text-left text-xl md:text-2xl pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-primary">Hi 👋</h1>
              <h2 className="mt-2 text-3xl font-semibold">
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
                className="mt-4 block text-xl font-semibold md:text-2xl dark:text-white text-black"
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
                icon={<Github className="size-6" />}
              />
              <ContactIcon
                href="https://www.linkedin.com/in/yohanes-christian-devano/"
                icon={<Linkedin className="size-6" />}
              />
              <ContactIcon
                href="mailto:yohanesdevano90@gmail.com"
                icon={<Mail className="size-6" />}
              />
              <ContactIcon
                href="https://api.whatsapp.com/send/?phone=6281325720265"
                icon={<Phone className="size-6" />}
              />
            </div>
          </div>

          {/* Right Side Spacer - Keeps layout consistent while letting 3D shine */}
          <div className="w-full md:w-[300px] lg:w-[400px] pointer-events-none" />
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
          <span className="text-4xl md:text-5xl font-bold">&ldquo;</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-left"
        >
          <p className="text-lg font-semibold">
            <span className="dark:text-white  font-bold">
              Jack of all trades, master of none
            </span>
            , but often better than master of one.
          </p>
          <p className="text-lg font-semibold mt-6">
            --{" "}
            <span className="dark:text-white  font-bold">
              William Shakespeare
            </span>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-end xl:mt-6 sm:mt-2"
        >
          <span className="text-4xl md:text-5xl font-bold t">&rdquo;</span>
        </motion.div>
      </section>

      {/* Certification Card Section */}
      {/* <CertificationCard /> */}
    </div>
  );
}

export default HomePage;
