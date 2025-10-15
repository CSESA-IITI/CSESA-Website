import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
}

const RevealText: React.FC<RevealTextProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
   
    offset: ["start end", "end start"],
  });


  const y = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`} 
    >
      <motion.div
        style={{ y }} 
      >
        {children}
      </motion.div>
    </div>
  );
};

export default RevealText;