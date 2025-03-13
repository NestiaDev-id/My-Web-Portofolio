import React from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

import reactLogo from "../assets/react.svg";

function HomePage() {
  return (
    <div className="h-screen bg-primary flex flex-col items-center justify-center px-4">
      {/* Konten Utama */}
      <div className="container flex flex-col-reverse md:flex-row items-center justify-between gap-8 w-full max-w-6xl">
        {/* Teks Kiri */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-primary">Hi 👋</h1>
          <h2 className="mt-2 text-3xl font-semibold text-secondary">
            Unknown User
          </h2>

          {/* Animasi Teks */}
          <TypeAnimation
            sequence={[
              "Data Analysis",
              1000,
              "Data Science",
              1000,
              "Project Management",
              1000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="mt-4 block text-accent text-xl font-semibold"
          />

          {/* Optional CTA Button */}
          <button className="btn-primary mt-6">Contact Me</button>
        </div>

        {/* Ilustrasi Kanan */}
        <div className="relative flex justify-center items-center">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-64 md:w-80 opacity-80 absolute"
          >
            <path
              fill="var(--color-accent-hover)"
              d="M38.9,-64.4C48.4,-61.9,52.8,-47.5,60.3,-34.8C67.7,-22,78.1,-11,77.6,-0.3C77.1,10.4,65.7,20.9,57,31.4C48.3,41.8,42.3,52.3,33.2,50.5C24.2,48.7,12.1,34.7,-0.8,36.1C-13.7,37.5,-27.5,54.5,-41.5,59.1C-55.4,63.7,-69.7,56.1,-69.4,44.2C-69.2,32.3,-54.6,16.1,-51.6,1.7C-48.5,-12.6,-57.1,-25.3,-54.9,-33C-52.7,-40.6,-39.6,-43.3,-28.7,-45C-17.7,-46.8,-8.9,-47.5,2.9,-52.5C14.7,-57.6,29.4,-66.9,38.9,-64.4Z"
              transform="translate(100 100)"
            />
          </svg>

          {/* Logo React */}
          <img
            src={reactLogo}
            alt="React Logo"
            className="w-32 md:w-48 relative"
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
