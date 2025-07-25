import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Instagram } from "lucide-react";
import Magnet from "../components/ui/Magnet";
import { siteConfig } from "../config/site";


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tel: "",
    subject: "",
    message: "",
    agree: false,
  });
  const [status, setStatus] = useState("");

  // FIX 1: Updated the event type to handle multiple element types.
  // This union type accepts events from inputs, textareas, and checkboxes.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // FIX 2: Correctly handle the checkbox state.
    const isChecked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? isChecked : value,
    }));
  };

  // FIX 3: Updated the event type for form submission.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Sending...");
    // Simulate API call
    setTimeout(() => {
      console.log("Form Submitted:", formData);
      setStatus("Message Sent!");
      setFormData({
        name: "",
        email: "",
        tel: "",
        subject: "",
        message: "",
        agree: false,
      });
      setTimeout(() => setStatus(""), 3000);
    }, 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      <motion.div
        className="relative z-10 min-h-screen flex items-center justify-center p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-6xl mx-auto mt-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl shadow-blue-500/10">
          <motion.div
            variants={itemVariants}
            className="relative space-y-6 rounded-2xl h-full px-4 py-8 bg-gradient-to-b from-blue-400 via-blue-300 to-white 
            before:absolute before:inset-0 before:content-[''] before:bg-[url('/noise_texture_3.png')] before:opacity-40 before:z-0"
          >
            <div className="relative z-10 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text alegreya-sans-sc-regular">
                Get in touch
              </h1>
              <p className="text-slate-200 text-lg leading-relaxed alegreya-sans-sc-regular">
                Have a project in mind, a question, or just want to say hi? Fill out the form, and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col space-y-2">
                <p className="alegreya-sans-sc-regular text-xl">Chat to us</p>
                <div className="flex items-center space-x-3 text-slate-200">
                  <Mail className="w-6 h-6 text-white" />
                  <a href={`mailto:${siteConfig.email}`} className="hover:text-blue-100 transition-colors duration-300">
                    {siteConfig.email}
                  </a>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="alegreya-sans-sc-regular text-xl">Social Media</p>
                <div className="flex items-center space-x-4">
                  <a href={siteConfig.linkedin}><Linkedin className="w-6 h-6 text-white" /></a>
                  <a href={siteConfig.instagram}><Instagram className="w-6 h-6 text-white" /></a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <form onSubmit={handleSubmit} className="space-y-5 alegreya-sans-sc-regular">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="">Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-500" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-500" />
              </motion.div>
              <motion.div variants={itemVariants}>
                {/* FIX 4: Corrected htmlFor and id attributes. */}
                <label htmlFor="tel" className="">Phone Number</label>
                <input type="tel" id="tel" name="tel" value={formData.tel} onChange={handleChange} placeholder="Your Phone Number" required
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-500" />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="message" className="">Message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" rows={5} required
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-500 resize-none"></textarea>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center pt-2">
                <input id="agree" name="agree" type="checkbox" checked={formData.agree} onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-900" />
                <label htmlFor="agree" className="ml-3 block text-sm text-slate-400">
                  I agree to the{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-medium text-cyan-400 hover:text-cyan-300 underline">Privacy Policy</a>.
                </label>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col items-center">
                <div className="text-center text-sm text-gray-400 p-2">
                  <Magnet padding={500} disabled={false} magnetStrength={10}>
                    <motion.button type="submit" disabled={!formData.agree || status === "Sending..."}
                      whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(124, 58, 237, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {status === "Sending..." ? "Sending..." : "Send Message"}
                    </motion.button>
                  </Magnet>
                </div>
                {status && status !== "Sending..." && (
                  <p className={`mt-4 text-center text-sm font-medium ${status === "Message Sent!" ? "text-green-400" : "text-red-400"}`}>
                    {status}
                  </p>
                )}
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;