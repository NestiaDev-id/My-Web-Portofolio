import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import ContactIcon from "../components/ContactIcon";
import { useTheme } from "@/providers/ThemeProvider";

// Lazy load the heavy 3D scene
const PhysicsScene = lazy(() => import("../components/PhysicsScene"));

function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="container mx-auto md:mt-16 flex flex-col items-center justify-center px-4 min-h-screen">
      {/* Hero Section */}
      <section className="relative container w-full max-w-6xl px-6 min-h-[500px] md:min-h-[600px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isDark ? (
            /* LIGHT MODE: 3D Scene + Left Text */
            <motion.div
              key="light-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full flex items-center"
            >
              {/* 3D Layer */}
              <div className="absolute inset-0 z-0 overflow-visible pointer-events-none">
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

              {/* Text Layer (Left Aligned) */}
              <div className="relative z-10 flex flex-col items-start w-full pointer-events-none container mx-auto px-6">
                <div className="text-left pointer-events-auto max-w-xl">
                    <h1 className="text-4xl font-bold text-primary">Hi 👋</h1>
                    <h2 className="mt-2 text-3xl font-semibold text-gray-800">
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
                      className="mt-4 block text-xl font-semibold md:text-2xl text-black"
                    />

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-0.5 bg-secondary mt-4"
                    />

                    <p className="mt-4 text-left text-gray-600 font-medium">Contact me:</p>
                    <div className="flex gap-4 mt-2 justify-start">
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
              </div>
            </motion.div>
          ) : (
            /* DARK MODE: Centered Text Only (No 3D) */
            <motion.div
              key="dark-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center w-full"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                Hi 👋
              </h1>
              <h2 className="mt-4 text-4xl md:text-6xl font-bold text-white tracking-tight">
                I'm Yohanes Christian Devano
              </h2>
              
              <div className="mt-8 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
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
                  className="text-2xl md:text-4xl font-mono font-bold text-blue-300"
                />
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 mt-8 rounded-full"
              />

              <div className="flex gap-6 mt-8 justify-center">
                  <ContactIcon
                    href="https://github.com/NestiaDev-id"
                    icon={<Github className="size-8 text-white hover:text-blue-400 transition-colors" />}
                  />
                  <ContactIcon
                    href="https://www.linkedin.com/in/yohanes-christian-devano/"
                    icon={<Linkedin className="size-8 text-white hover:text-blue-600 transition-colors" />}
                  />
                  <ContactIcon
                    href="mailto:yohanesdevano90@gmail.com"
                    icon={<Mail className="size-8 text-white hover:text-red-400 transition-colors" />}
                  />
                  <ContactIcon
                    href="https://api.whatsapp.com/send/?phone=6281325720265"
                    icon={<Phone className="size-8 text-white hover:text-green-400 transition-colors" />}
                  />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
