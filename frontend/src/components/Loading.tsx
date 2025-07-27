import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const LoadingPage: React.FC = () => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, 100, {
      duration: 1.5,
      ease: 'easeInOut',
    });
    return controls.stop;
  }, [count]);

  return (
    <>
      {/* Upper Half - slides up */}
      <motion.div
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        initial={{ y: 0 }}
        exit={{ 
          y: '-100%', 
          transition: { 
            duration: 1.5, 
            ease: [0.76, 0, 0.50, 1] // Custom cubic-bezier for smooth portal effect
          } 
        }}
      >
        {/* Content that appears on both halves */}
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 vamos text-3xl tracking-widest animate-pulse">
          LOADING...
        </p>
        
        <div className="absolute bottom-8 right-8 text-white/70 vamos text-5xl">
          <motion.span>{rounded}</motion.span>%
        </div>
      </motion.div>

      {/* Lower Half - slides down */}
      <motion.div
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
        initial={{ y: 0 }}
        exit={{ 
          y: '100%', 
          transition: { 
            duration: 1.5, 
            ease: [0.76, 0, 0.50, 1] // Same easing for synchronized movement
          } 
        }}
      >
        {/* Same content duplicated for seamless appearance */}
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 vamos text-3xl tracking-widest animate-pulse">
          LOADING...
        </p>
        
        <div className="absolute bottom-8 right-8 text-white/70 vamos text-5xl">
          <motion.span>{rounded}</motion.span>%
        </div>
      </motion.div>
    </>
  );
};

export default LoadingPage;