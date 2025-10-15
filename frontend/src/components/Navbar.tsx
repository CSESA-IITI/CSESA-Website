import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import RollingText from "./RollingText";
import { useAuth } from "../contexts/AuthContext";

const FuturisticNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation(); 

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Team", href: "/team" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  const renderAuthButtons = (isMobile: boolean = false) => {
    const commonButtonClasses = "px-4 py-2 rounded-lg text-white font-medium transition-colors duration-300";
    const mobileFullWidth = isMobile ? "w-full" : "";

    if (isAuthenticated) {
      return (
        <div className={isMobile ? "flex flex-col space-y-3" : "flex items-center space-x-3"}>
          <Link to="/profile" onClick={() => isMobile && setIsMenuOpen(false)}>
            <button className={`${commonButtonClasses} ${mobileFullWidth} bg-gray-700 hover:bg-gray-600`}>
              Profile
            </button>
          </Link>
          <button
            onClick={() => {
              logout();
              if (isMobile) setIsMenuOpen(false);
            }}
            className={`${commonButtonClasses} ${mobileFullWidth} bg-red-600 hover:bg-red-500`}
          >
            Logout
          </button>
        </div>
      );
    }
    return (
      <Link to="/login" onClick={() => isMobile && setIsMenuOpen(false)}>
        <button className={`${commonButtonClasses} ${mobileFullWidth} bg-blue-600 hover:bg-blue-500`}>
          Login
        </button>
      </Link>
    );
  };


  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 "
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto ">
        <div className="relative  py-4">

          <div
            className="absolute inset-0 backdrop-blur-md rounded-2xl shadow-dissolved [mask:linear-gradient(to_bottom,black,black,transparent)]"
          />
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0"
            animate={{ opacity: [0, 0.3, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-center justify-between px-8 py-2">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-xl tracking-wider vamos">
                CSESA
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    className="relative" 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`relative z-10 alegreya-sans-sc-regular px-5 py-2 rounded-xl font-medium transition-colors duration-300 text-sm h-10 flex items-center justify-center ${
                        isActive ? "text-white" : "text-gray-300"
                      }`}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                       <RollingText
                        text={item.name}
                        isHovered={hoveredItem === item.name}
                      />
                    </Link>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl backdrop-blur-sm border border-indigo-400/30"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
              <div className="ml-4">
                {renderAuthButtons()}
              </div>
            </div>

            <motion.button
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1 z-20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span className="w-6 h-0.5 bg-white block" animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }} />
              <motion.span className="w-6 h-0.5 bg-white block" animate={{ opacity: isMenuOpen ? 0 : 1 }} />
              <motion.span className="w-6 h-0.5 bg-white block" animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}/>
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex flex-col space-y-4">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 vamos text-xs ${
                        pathname === item.href
                          ? "text-white bg-indigo-600/50 border border-indigo-400/30"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-white/20">
                    {renderAuthButtons(true)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default FuturisticNavbar;