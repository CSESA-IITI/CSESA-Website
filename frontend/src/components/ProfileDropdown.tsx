import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Crown, Shield, UserCheck, Users } from 'lucide-react';

// --- TYPE DEFINITIONS & HELPERS ---

// A map to associate roles with display names and icons
const ROLES = {
  1: { name: 'President', icon: <Crown className="w-4 h-4 text-yellow-400" /> },
  2: { name: 'Domain Head', icon: <Shield className="w-4 h-4 text-blue-400" /> },
  3: { name: 'Coordinator', icon: <UserCheck className="w-4 h-4 text-green-400" /> },
  4: { name: 'Member', icon: <Users className="w-4 h-4 text-gray-400" /> }
};

type RoleNumber = keyof typeof ROLES;

// Helper to get initials from name or email
const getInitials = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return 'U';
};


// --- DROPDOWN MENU ITEM COMPONENT ---

interface MenuItemProps {
  to?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ to, onClick, icon, label, className }) => {
  const content = (
    <div className={`flex w-full items-center space-x-3 px-4 py-2.5 text-sm transition-colors ${className}`}>
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );

  if (to) {
    return <Link to={to} onClick={onClick}>{content}</Link>;
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>;
};


// --- MAIN DROPDOWN COMPONENT ---

const ProfileDropdown: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as HTMLElement).closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const { first_name, last_name, email, role } = user;
  
  // Handle numeric roles
  let roleNumber: RoleNumber = 4;
  if (typeof role === 'number' && role >= 1 && role <= 4) {
    roleNumber = role as RoleNumber;
  } else if (!isNaN(Number(role)) && Number(role) >= 1 && Number(role) <= 4) {
    roleNumber = Number(role) as RoleNumber;
  }
  const userRoleInfo = ROLES[roleNumber];
  const userInitials = getInitials(first_name, last_name, email);
  const displayName = first_name || email?.split('@')[0] || 'User';

  return (
    <div className="relative profile-dropdown">
      <motion.button
        onClick={() => !isLoggingOut && setIsDropdownOpen(!isDropdownOpen)}
        disabled={isLoggingOut}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 p-1.5 rounded-full transition-colors ${
          isDropdownOpen ? 'bg-blue-500/20' : 'hover:bg-slate-800/50'
        } ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
        aria-label="User profile"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
            {userInitials}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">{displayName}</p>
          <div className="flex items-center gap-1.5">
            {userRoleInfo.icon}
            <p className="text-xs text-blue-400 font-medium">{userRoleInfo.name}</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl z-50 border border-blue-400/20"
          >
            <div className="p-4 border-b border-blue-400/10">
              <p className="font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{email || ''}</p>
            </div>

            <div className="py-2 text-gray-200 hover:text-white">
              <MenuItem 
                to="/profile" 
                onClick={() => setIsDropdownOpen(false)}
                icon={<User className="w-4 h-4" />} 
                label="My Profile"
                className="hover:bg-blue-500/10"
              />
              <MenuItem 
                to="/settings" 
                onClick={() => setIsDropdownOpen(false)}
                icon={<Settings className="w-4 h-4" />} 
                label="Settings"
                className="hover:bg-blue-500/10"
              />
            </div>

            <div className="border-t border-blue-400/10 py-2">
              <MenuItem 
                onClick={handleLogout}
                icon={
                  isLoggingOut 
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4" /> 
                    : <LogOut className="w-4 h-4" />
                } 
                label={isLoggingOut ? "Signing out..." : "Sign out"}
                className="text-red-400 hover:bg-red-500/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;