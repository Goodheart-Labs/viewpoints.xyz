import type { PropsWithChildren } from "react";
import React from "react";

import { motion } from "framer-motion";

import "./LoadingText.css";

const textStyles: React.CSSProperties = {
  background: "linear-gradient(270deg, #ff0000, #0000ff)",
  backgroundSize: "200% 200%",
  color: "transparent",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  MozBackgroundClip: "text",
  animation: `3s linear infinite sliding-gradient`,
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

const LoadingText = ({ children }: PropsWithChildren) => (
  <motion.span
    style={textStyles}
    variants={textVariants}
    initial="hidden"
    animate="visible"
  >
    {children}
  </motion.span>
);

export default LoadingText;
