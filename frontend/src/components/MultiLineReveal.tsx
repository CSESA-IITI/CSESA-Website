import React from 'react';
import { motion, Variants } from 'framer-motion';

// Define the types for the component props
interface MultiLineRevealProps {
  /** An array of strings, where each string is a line to be revealed. */
  lines: string[];
  /** Optional CSS class for the main container. */
  className?: string;
  /** Optional CSS class for each individual line of text. */
  lineClassName?: string;
  /** The delay between each line's animation. Set to 0 for simultaneous reveal. */
  stagger?: number;
}

/**
 * Variants for the parent container.
 * This controls the staggering of the children's animations.
 */
const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number = 0.05) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
};

/**
 * Variants for each line of text.
 * Defines how each line animates in.
 */
const lineVariants: Variants = {
  hidden: { y: '-120%' }, // Start below the visible area
  visible: {
    y: '0%', // Animate to its original position
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * A component to reveal multiple lines of text with a cascading animation
 * as it enters the viewport.
 */
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
      custom={stagger} // Pass the stagger amount to the variants
      viewport={{ once: false, margin: '-50px' }} // Trigger animation when element is 50px into view
      className={className}
    >
      {lines.map((line, index) => (
        // This div hides the overflow, creating the reveal effect
        <div key={index} className="overflow-hidden py-1">
          <motion.div variants={lineVariants} className={lineClassName}>
            {line}
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
};