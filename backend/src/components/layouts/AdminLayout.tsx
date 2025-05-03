import React from "react";
import { Sidebar } from "./Navbar/Sidebar";
import { motion } from "framer-motion";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#FFFBE3]">
      <Sidebar />
      <motion.main
        className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 bg-[url('/grid.svg')]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
