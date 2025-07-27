import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
}

const RevealText: React.FC<RevealTextProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  // useScroll listens to the scroll progress of the target element (ref)
  const { scrollYProgress } = useScroll({
    target: ref,
    // Animate from when the element's top hits the bottom of the viewport,
    // to when the element's bottom hits the top of the viewport.
    offset: ["start end", "end start"],
  });

  // useTransform maps the scroll progress (from 0 to 1) to a translateY value
  // The text will move from 100% (fully hidden below) to 0% (fully visible)
  const y = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`} // The "mask" container
    >
      <motion.div
        style={{ y }} // Apply the animated translateY
      >
        {children}
      </motion.div>
    </div>
  );
};

export default RevealText;