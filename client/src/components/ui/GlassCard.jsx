import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`glass p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
