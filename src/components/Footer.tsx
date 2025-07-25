import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Text3D from "./Text3D";
import RollingText from "./RollingText";
import { siteConfig, socialLinks } from "../config/site";

const Footer: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 1. Hooks for the reveal-on-scroll animation
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 }); // Trigger animation once when 30% is visible
  const mainControls = useAnimation();

  // 2. Start animation when the component is in view
  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  // 3. Animation variants for the container and its children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child will animate 0.2s after the previous one
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };


  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
    { name: "Login", href: "/login" },
  ];



  return (
    <footer ref={ref} className="bg-black text-white font-sans pt-20">
      <div
        className="
          relative max-w-7xl mx-auto rounded-t-3xl bg-indigo-600/90 p-8 md:p-16
          before:absolute before:inset-0 before:content-[''] 
          before:bg-[url('/noise_texture_2.png')] before:opacity-45 before:z-0
          before:rounded-t-3xl
        "
      >
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate={mainControls}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h3 className="text-xl font-bold text-white/90">
                See how we can help you, get in touch today.
              </h3>
              <motion.a
                href={siteConfig.email}
                className="inline-flex items-center gap-2 text-indigo-200"
                whileHover={{ color: '#FFFFFF', x: 5, transition: { duration: 0.2 } }}
              >
                <Mail size={18} />
                <span>{siteConfig.email}</span>
              </motion.a>
            </motion.div>

            <motion.div className="md:mx-auto" variants={itemVariants}>
              <h4 className="font-semibold text-white/70 mb-4 alegreya-sans-sc-regular">{`{ NAVIGATE }`}</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-indigo-200 hover:text-white transition-colors alegreya-sans-sc-regular text-bold"
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <RollingText text={item.name} isHovered={hoveredItem === item.name} />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="md:mx-auto" variants={itemVariants}>
              <h4 className="font-semibold text-white/70 mb-4 alegreya-sans-sc-regular">{`{ CONNECT }`}</h4>
              <ul className="space-y-3">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-indigo-200 hover:text-white transition-colors"
                      onMouseEnter={() => setHoveredItem(social.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {social.icon}
                      <RollingText text={`${social.name}.connect()`} isHovered={hoveredItem === social.name} />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div className="text-center my-16 md:my-24 vamos " variants={itemVariants}>
            <Text3D>
                CSESA IIT Indore
            </Text3D>
          </motion.div>

          <motion.div className="text-center border-t border-white/10 pt-8" variants={itemVariants}>
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} CSESA IIT Indore. All Rights Reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;