import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import Magnet from "../components/ui/Magnet";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    alert("Logged in!");
  };

  // Animation variants for the main container
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren", // Animate parent before children
        staggerChildren: 0.1, // Stagger children animations
      },
    },
  };

  // Animation variants for child elements
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Variants for the error message
  const errorVariants = {
    initial: { opacity: 0, height: 0, y: -10 },
    animate: { opacity: 1, height: "auto", y: 0 },
    exit: { opacity: 0, height: 0, y: -10 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black text-white px-4 ">
      <motion.div
        className="w-full max-w-md bg-gradient-to-b from-blue-400 to-white rounded-2xl shadow-2xl px-8 py-12 
        before:absolute before:inset-0 before:content-[''] before:bg-[url('/noise_texture_3.png')] before:opacity-40 before:z-0"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10">
          <motion.h2
            className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-white vamos tracking-widest"
            variants={itemVariants}
          >
            LOGIN
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6 ">
            <motion.div variants={itemVariants}>
              <label
                className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full text-xs px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 vamos"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </motion.div>

            {/* AnimatePresence allows for exit animations */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-400 text-sm font-medium text-center"
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="text-center text-sm text-gray-400 pt-2"
              variants={itemVariants}
            >
              <Magnet padding={500} disabled={false} magnetStrength={10}>
                <motion.button
                  type="submit"
                  className="alegreya-sans-sc-regular w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Magnet>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
