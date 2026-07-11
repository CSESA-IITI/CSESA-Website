import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const LoadingPage: React.FC = () => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [showLongLoadMsg, setShowLongLoadMsg] = useState(false);

  useEffect(() => {
    // If it's been loading for more than 2 seconds, show the render message
    const timer = setTimeout(() => {
      setShowLongLoadMsg(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controls = animate(count, 99, {
      duration: 1.5,
      ease: 'easeInOut',
    });
    return controls.stop;
  }, [count]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        initial={{ y: 0 }}
        exit={{ 
          y: '-100%', 
          transition: { 
            duration: 1.5, 
            ease: [0.76, 0, 0.50, 1]
          } 
        }}
      >
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 vamos text-3xl tracking-widest animate-pulse">
          LOADING...
        </p>

        {showLongLoadMsg && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-sm md:text-base tracking-widest text-center w-[90%] font-light"
          >
            WAKING UP SERVER...
          </motion.p>
        )}
        
        <div className="absolute bottom-8 right-8 text-white/70 vamos text-5xl">
          <motion.span>{rounded}</motion.span>%
        </div>
      </motion.div>

      <motion.div
        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
        initial={{ y: 0 }}
        exit={{ 
          y: '100%', 
          transition: { 
            duration: 1.5, 
            ease: [0.76, 0, 0.50, 1] 
          } 
        }}
      >
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 vamos text-3xl tracking-widest animate-pulse">
          LOADING...
        </p>

        {showLongLoadMsg && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-sm md:text-base tracking-widest text-center w-[90%] font-light"
          >
            WAKING UP SERVER...
          </motion.p>
        )}
        
        <div className="absolute bottom-8 right-8 text-white/70 vamos text-5xl">
          <motion.span>{rounded}</motion.span>%
        </div>
      </motion.div>
    </>
  );
};

export default LoadingPage;