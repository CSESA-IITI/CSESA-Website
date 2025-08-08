// src/pages/Login.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import Magnet from "../components/ui/Magnet";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/"); // Redirect to home page on successful login
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black text-white px-4">
      <motion.div
        className="w-full max-w-md bg-gradient-to-b from-blue-400 to-white rounded-2xl shadow-2xl px-8 py-12"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10">
          <motion.h2 className="text-3xl font-extrabold text-center mb-6 text-white" variants={itemVariants}>
            LOGIN
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="w-full text-xs px-4 py-3 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-400 text-sm font-medium text-center bg-red-500/10 p-2 rounded-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <Magnet padding={500} disabled={false} magnetStrength={10}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
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