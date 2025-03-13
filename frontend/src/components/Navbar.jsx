import React, { useEffect, useState } from "react";
import { Moon, Sun, User, FolderKanban, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <header className="fixed w-full top-0 z-40 border-b border-secondary/20 bg-primary/70 dark:bg-[#222831]/70 backdrop-blur-md">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary dark:text-white">
          NestiaDev
        </Link>

        {/* Navigasi */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/about"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary dark:text-white hover:bg-secondary-light hover:text-primary dark:hover:bg-secondary/30 transition-all text-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">About me</span>
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary dark:text-white hover:bg-secondary-light hover:text-primary dark:hover:bg-secondary/30 transition-all text-sm"
          >
            <FolderKanban className="w-4 h-4" />
            <span className="hidden sm:inline">Project</span>
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary dark:text-white hover:bg-secondary-light hover:text-primary dark:hover:bg-secondary/30 transition-all text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>

          {/* Tombol Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary dark:text-white hover:bg-secondary-light hover:text-primary dark:hover:bg-secondary/30 transition-all text-sm"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
