import type { PropsWithChildren } from "react";

import type { Transition } from "framer-motion";
import { motion } from "framer-motion";

const jiggleAnimation: Transition = {
  repeat: Infinity, // loop the animation
  duration: 0.5, // duration of a single cycle
  ease: "easeInOut", // easing function
  repeatDelay: 2, // delay between cycles
};

const JiggleDiv = ({
  children,
  className,
  transition,
}: PropsWithChildren<{
  transition?: Transition;
  className?: string;
}>) => (
  <motion.div
    animate={{ rotate: [0, 5, -5, 5, -5, 0] }} // values for rotation
    transition={{ ...jiggleAnimation, ...transition }} // use defined jiggleAnimation
    className={className}
  >
    {children}
  </motion.div>
);

export default JiggleDiv;
