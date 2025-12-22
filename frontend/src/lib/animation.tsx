import { type Variants } from "framer-motion";

export const cardVariants: Variants = {
  // HIDDEN STATE (Start here)
  initial: {
    opacity: 0,
    y: 24,
    scale: 1,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  // VISIBLE/RESTING STATE (End here)
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  // INTERACTION STATE
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};
