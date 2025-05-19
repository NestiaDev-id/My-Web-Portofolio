import { useState } from "react";
import {
  User,
  FolderKanban,
  BookOpen,
  Home,
  Gamepad2,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const MotionLink = motion(Link);

  const navLinks = (
    <>
      {/* HOME */}
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionLink
            to="/"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
            onClick={() => setIsOpen(false)}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </MotionLink>
        </TooltipTrigger>
        <TooltipContent side="bottom">Halaman utama</TooltipContent>
      </Tooltip>

      {/* ABOUT */}
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionLink
            to="/about"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-4 h-4" />
            <span>About Me</span>
          </MotionLink>
        </TooltipTrigger>
        <TooltipContent side="bottom">Tentang saya</TooltipContent>
      </Tooltip>

      {/* PROJECTS */}
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionLink
            to="/projects"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
            onClick={() => setIsOpen(false)}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projects</span>
          </MotionLink>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Proyek-proyek yang pernah saya buat
        </TooltipContent>
      </Tooltip>

      {/* BLOG */}
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionLink
            to="/blog"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/20 transition-all text-sm"
            onClick={() => setIsOpen(false)}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog</span>
          </MotionLink>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Catatan dan artikel pribadi
        </TooltipContent>
      </Tooltip>

      {/* GAME */}
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionLink
            to="/game"
            whileHover={{ scale: 1.05, rotate: 1 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 transition-all text-sm group relative"
            onClick={() => setIsOpen(false)}
          >
            <Gamepad2 className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
            <span>Game</span>
            <Badge
              variant="outline"
              className="text-xs ml-1 px-1.5 py-0.5 border-primary text-primary"
            >
              Beta
            </Badge>
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-ping opacity-60" />
          </MotionLink>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Fitur eksperimen: mainkan game kecil langsung di aplikasi!
        </TooltipContent>
      </Tooltip>

      {/* DARK MODE TOGGLE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <DarkModeToggle />
      </motion.div>
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
