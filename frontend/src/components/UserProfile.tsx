import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* User Avatar Button */}
      <motion.button
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
        aria-label="User profile"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-colors">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
          <p className="text-xs text-slate-300 truncate max-w-[160px]">{user.email || ''}</p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-50 border border-slate-700/50"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/30">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-slate-300 truncate max-w-[180px]">{user.email || ''}</p>
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <hr className="my-2 border-slate-700" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
