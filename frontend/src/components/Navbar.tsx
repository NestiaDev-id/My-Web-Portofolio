import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
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
import { DarkModeToggle } from "./DarkModeToggle";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home, description: "Halaman utama" },
  { path: "/about", label: "About Me", icon: User, description: "Tentang saya" },
  { path: "/projects", label: "Projects", icon: FolderKanban, description: "Proyek-proyek yang pernah saya buat" },
  { path: "/blog", label: "Blog", icon: BookOpen, description: "Catatan dan artikel pribadi" },
  { 
    path: "/game", 
    label: "Game", 
    icon: Gamepad2, 
    description: "Fitur eksperimen: mainkan game kecil langsung di aplikasi!",
    isBeta: true 
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive ? "text-primary dark:text-blue-400 font-medium" : "hover:text-primary/80 dark:hover:text-blue-300"
                )}
                onClick={() => setIsOpen(false)}
              >
                {/* MAGIC MOTION ACTIVE BACKGROUND */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary/10 dark:bg-blue-500/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* CONTENT */}
                <span className="relative z-10 flex items-center gap-2">
                   <item.icon className={cn("w-4 h-4", item.path === "/game" && "text-primary group-hover:rotate-12 transition-transform")} />
                   <span>{item.label}</span>
                   
                   {/* BETA BADGE FOR GAME */}
                   {item.isBeta && (
                      <span className="relative flex items-center">
                        <Badge variant="outline" className="text-[10px] ml-1 px-1 py-0 border-primary text-primary h-4">
                          Beta
                        </Badge>
                        <Sparkles className="absolute -top-2 -right-2 h-2.5 w-2.5 text-yellow-500 animate-ping opacity-70" />
                      </span>
                   )}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.description}</TooltipContent>
          </Tooltip>
        );
      })}

      {/* DARK MODE TOGGLE */}
      <div className="ml-2">
        <DarkModeToggle />
      </div>
    </>
  );

  return (
    <header className="fixed w-full top-0 z-40 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors duration-500">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
          NestiaDev
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1 text-black dark:text-white">
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
              className="sm:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-2xl z-50 p-4 pt-20 flex flex-col gap-2 text-black dark:text-white border-r border-gray-200 dark:border-gray-800"
            >
              {navLinks}
            </motion.div>

            {/* Overlay */}
            <motion.div
              className="sm:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
