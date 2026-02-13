import { motion } from "framer-motion";

interface ContactIconProps {
  href: string;
  icon: React.ReactNode;
}

const ContactIcon = ({ href, icon }: ContactIconProps) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
  >
    {icon}
  </motion.a>
);

export default ContactIcon;
