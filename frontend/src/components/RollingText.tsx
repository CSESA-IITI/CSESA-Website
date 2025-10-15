import React from 'react';
import { motion } from 'framer-motion';

const letterVariants = {
  initial: { y: 0 },
  spin: (i: number) => ({
    y: "-120%", 
    transition: { duration: 0.3, ease: "easeInOut", delay: i * 0.03 },
  }),
};

const letterVariants2 = {
  initial: { y: "120%" },
  spin: (i: number) => ({
    y: 0, 
    transition: { duration: 0.3, ease: "easeInOut", delay: i * 0.03 },
  }),
};

interface RollingTextProps {
  text: string;
  isHovered: boolean;
}

const RollingText: React.FC<RollingTextProps> = ({ text, isHovered }) => {
  return (
    <div className="relative z-10 h-5 overflow-hidden">
      
      <motion.div
        className="flex"
        initial="initial"
        animate={isHovered ? "spin" : "initial"}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            custom={i}
            variants={letterVariants}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
      
      <motion.div
        className="absolute top-0 left-0 flex text-white"
        initial="initial"
        animate={isHovered ? "spin" : "initial"}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}-2`}
            custom={i}
            variants={letterVariants2}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default RollingText;