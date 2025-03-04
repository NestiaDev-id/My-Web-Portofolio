import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        className="w-16 h-16 flex flex-col items-center justify-center"
        animate={{ y: [0, -20, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Hourglass className="w-16 h-16 text-blue-600" />
      </motion.div>
    </div>
  );
}

export default LoadingPage;
