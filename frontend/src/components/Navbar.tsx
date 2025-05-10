import { useState } from "react";
import {
  User,
  FolderKanban,
  BookOpen,
  Home,
  Gamepad2,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        to="/"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
        onClick={() => setIsOpen(false)}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      <Link
        to="/about"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
        onClick={() => setIsOpen(false)}
      >
        <User className="w-4 h-4" />
        <span>About Me</span>
      </Link>
      <Link
        to="/projects"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
        onClick={() => setIsOpen(false)}
      >
        <FolderKanban className="w-4 h-4" />
        <span>Project</span>
      </Link>
      <Link
        to="/blog"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
        onClick={() => setIsOpen(false)}
      >
        <BookOpen className="w-4 h-4" />
        <span>Blog</span>
      </Link>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed text-sm"
        title="Segera hadir"
      >
        <Gamepad2 className="w-4 h-4" />
        <span>Games</span>
      </div>
      <DarkModeToggle />
    </>
  );

  return (
    <header className="fixed w-full top-0 z-40 border-b bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary dark:text-white">
          NestiaDev
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-4 text-black dark:text-white">
          {navLinks}
        </nav>

        {/* Hamburger Button */}
        <button
          className="sm:hidden text-black dark:text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar & Overlay with Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="sm:hidden fixed top-15 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 p-4 flex flex-col gap-2 text-black dark:text-white"
            >
              {navLinks}
            </motion.div>

            {/* Overlay */}
            <motion.div
              className="sm:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
