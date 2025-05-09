import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition ${
        showScroll ? "block" : "hidden"
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: showScroll ? 1 : 0, scale: showScroll ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <ArrowUp size={24} />
    </motion.button>
  );
};

export default ScrollToTop;
