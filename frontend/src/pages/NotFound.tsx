import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  // Animation variants for staggering the appearance of elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  // Animation for the glitch effect
  const glitchAnimation = {
    x: [0, -2, 2, -3, 3, 0],
    y: [0, 3, -3, 2, -2, 0],
    opacity: [1, 0.8, 0.9, 0.7, 1],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  };

  return (
    <div
      className="
        relative min-h-screen w-full flex items-center justify-center 
        bg-black text-white font-sans text-center p-4 overflow-hidden
        before:absolute before:inset-0 before:content-[''] 
        before:bg-[url('/noise.png')] before:opacity-5
      "
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center"
      >
        {/* The Glitchy "404" Text */}
        <motion.div className="relative text-8xl md:text-9xl font-black vamos" variants={itemVariants}>
          {/* Base Text */}
          <span className="relative z-10">404</span>
          {/* Glitch Layer 1 (Cyan) */}
          <motion.span
            className="absolute top-0 left-0 w-full h-full text-cyan-400 mix-blend-screen"
            animate={glitchAnimation}
          >
            404
          </motion.span>
          {/* Glitch Layer 2 (Magenta) */}
          <motion.span
            className="absolute top-0 left-0 w-full h-full text-pink-500 mix-blend-screen"
            animate={{ ...glitchAnimation, transition: { ...glitchAnimation.transition, delay: 0.05 } }}
          >
            404
          </motion.span>
        </motion.div>

        {/* Descriptive Message */}
        <motion.h1
          className="text-2xl md:text-4xl font-semibold text-white/90 mt-6 alegreya-sans-sc-regular"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className="text-base md:text-lg text-white/60 max-w-md mt-4"
          variants={itemVariants}
        >
          It seems you've ventured into an uncharted directory. The page you're looking for might have been moved, deleted, or is temporarily unavailable.
        </motion.p>

        {/* "Go Home" Button */}
        <motion.div variants={itemVariants} className="mt-10">
          <Link to="/">
            <motion.button
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white transition-all shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(99, 102, 241, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={18} />
              Return to Home
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;