import React from 'react';
import { motion, Variants } from 'framer-motion';

interface MultiLineRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  stagger?: number;
}


const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number = 0.05) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
};


const lineVariants: Variants = {
  hidden: { y: '-120%' }, 
  visible: {
    y: '0%', 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};


export const MultiLineReveal: React.FC<MultiLineRevealProps> = ({
  lines,
  className,
  lineClassName,
  stagger = 0.05,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      custom={stagger} 
      viewport={{ once: false, margin: '-50px' }} 
      className={className}
    >
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden py-1">
          <motion.div variants={lineVariants} className={lineClassName}>
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
};