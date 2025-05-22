import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import reactLogo from "../assets/react.svg";
import ContactIcon from "../components/ContactIcon";
import { useState } from "react";

function HomePage() {
  const [isCoinHovered, setIsCoinHovered] = useState(false);

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

        {/* Right Side */}
        <motion.div
          className="relative group z-10 mt-12 md:mt-0"
          style={{ perspective: "1000px" }} // Tambahkan perspektif untuk efek 3D
          onHoverStart={() => setIsCoinHovered(true)}
          onHoverEnd={() => setIsCoinHovered(false)}
        >
          <motion.div
            className="relative w-64 h-64 md:w-80 md:h-80" // Ukuran kontainer koin
            style={{ transformStyle: "preserve-3d" }} // Penting untuk rotasi 3D anak-anak
            animate={{ rotateY: isCoinHovered ? 180 : 0 }} // Berputar saat di-hover
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* Sisi Depan Koin (Gambar Profil) */}
            <motion.div
              className="absolute w-full h-full rounded-full"
              style={{ backfaceVisibility: "hidden" }} // Sembunyikan saat menghadap ke belakang
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-tilt"></div>
              <img
                src={reactLogo}
                alt="Yohanes Christian Devano - Profile"
                className="relative w-full h-full rounded-full object-cover shadow-xl border-4 border-background"
              />
            </motion.div>

            {/* Sisi Belakang Koin (Contoh: Logo lain atau teks) */}
            <motion.div
              className="absolute w-full h-full rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden", // Sembunyikan saat menghadap ke belakang
                transform: "rotateY(180deg)", // Awalnya menghadap ke belakang
              }}
            >
              {/* Anda bisa meletakkan logo lain, inisial, atau ikon di sini */}
              <span className="text-4xl font-bold text-white"></span>
              {/* <img src="/path/to/logo-belakang.png" alt="Coin Back" className="w-1/2 h-1/2 object-contain" /> */}
            </motion.div>
          </motion.div>
        </motion.div>
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
