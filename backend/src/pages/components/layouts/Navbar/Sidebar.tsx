import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "../../../../lib/utils/utils";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Link as LinkIcon,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: "About Me",
    href: "/about",
    icon: <User size={20} />,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Blog Posts",
    href: "/blog",
    icon: <FileText size={20} />,
  },
  {
    title: "Social Links",
    href: "/social",
    icon: <LinkIcon size={20} />,
  },
];

export function Sidebar() {
  //   const location = useLocation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      router.push("/auth/login"); // Arahkan user ke halaman login setelah logout
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "64px" },
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="bg-background"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-y-0 left-0 z-40"
          >
            <div className="bg-sidebar h-full w-[240px] p-4 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-6 mt-2">
                <h1 className="text-sidebar-foreground font-semibold text-lg">
                  Portfolio Admin
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileSidebar}
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <X size={18} />
                </Button>
              </div>
              <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-4 text-xs text-muted-foreground text-end">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="expanded"
        animate={collapsed ? "collapsed" : "expanded"}
        className="hidden lg:block h-screen sticky top-0 bg-sidebar shadow-md overflow-x-hidden"
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 mt-2">
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sidebar-foreground font-semibold text-lg"
              >
                Portfolio Admin
              </motion.h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu size={18} />
            </Button>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3"
                  >
                    {item.title}
                  </motion.span>
                )}
              </Link>
            ))}
          </nav>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-sidebar-foreground/50 mt-auto pt-4"
            >
              Portfolio Admin v1.0
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
