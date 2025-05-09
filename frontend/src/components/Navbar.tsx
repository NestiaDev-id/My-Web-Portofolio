import { User, FolderKanban, BookOpen, Home, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";

const Navbar = () => {
  return (
    <header className="fixed w-full top-0 z-40 border-b backdrop-blur-md transition-colors duration-500 ease-in-out">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary dark:text-white">
          NestiaDev
        </Link>

        {/* Navigasi */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black dark:text-white hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            to="/about"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black dark:text-white hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">About Me</span>
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black dark:text-white hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
          >
            <FolderKanban className="w-4 h-4" />
            <span className="hidden sm:inline">Project</span>
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black dark:text-white hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          {/* Games yang belum aktif */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black dark:text-white opacity-50 cursor-not-allowed text-sm"
            title="Segera hadir"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Games</span>
          </div>

          {/* Tombol Dark Mode */}
          <DarkModeToggle />
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary dark:text-white hover:bg-secondary-light hover:text-primary dark:hover:bg-secondary/30 transition-all text-sm ease-in-out duration-400"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button> */}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
