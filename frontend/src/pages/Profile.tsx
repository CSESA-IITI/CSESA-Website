import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Edit3, Mail, Shield, User, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Loading profile...</span>
        </motion.div>
      </div>
    );
  }

  const { first_name, last_name, email, role } = user;
  
  const isPresident = (typeof role === 'string' && role.toLowerCase() === 'president') || 
                     (typeof role === 'number' && role === 1);

  const getRoleDisplay = () => {
    if (typeof role === 'string') {
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
    if (typeof role === 'number') {
      switch (role) {
        case 1: return 'President';
        case 2: return 'Domain Head';
        case 3: return 'Coordinator';
        default: return 'Member';
      }
    }
    return 'Member';
  };

  const getRoleIcon = () => {
    const roleDisplay = getRoleDisplay();
    switch (roleDisplay) {
      case 'President': return <Shield className="w-4 h-4" />;
      case 'Domain Head': return <Settings className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getInitials = () => {
    if (first_name && last_name) {
      return `${first_name[0]}${last_name[0]}`.toUpperCase();
    }
    if (first_name) {
      return first_name[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (first_name) {
      return `${first_name} ${last_name || ''}`.trim();
    }
    return email.split('@')[0];
  };

  return (
    <div className="min-h-screen pt-12 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-sm overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-xl ring-4 ring-gray-700/50">
                    <span className="text-white text-4xl font-bold tracking-wider">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-gray-900">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </motion.div>

                {/* User Info */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl lg:text-4xl font-bold text-white mb-2"
                  >
                    {getDisplayName()}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex items-center justify-center lg:justify-start space-x-2 mb-3"
                  >
                    {getRoleIcon()}
                    <span className="text-blue-400 font-semibold text-lg">
                      {getRoleDisplay()}
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center justify-center lg:justify-start space-x-2 text-gray-400"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{email}</span>
                  </motion.div>
                </div>

                {/* President Edit Button */}
                {isPresident && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col space-y-3"
                  >
                    <button className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg border border-blue-500/30 transition-all duration-300 hover:shadow-blue-500/25 hover:shadow-xl">
                      <div className="flex items-center space-x-2 text-white font-medium">
                        <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Edit Content</span>
                      </div>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                    </button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      President privileges
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {/* Status Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-white font-semibold">Status</h3>
              </div>
              <p className="text-green-400 font-medium">Active</p>
              <p className="text-gray-500 text-sm mt-1">Currently online</p>
            </div>

            {/* Role Details Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  {getRoleIcon()}
                </div>
                <h3 className="text-white font-semibold">Role</h3>
              </div>
              <p className="text-blue-400 font-medium">{getRoleDisplay()}</p>
              <p className="text-gray-500 text-sm mt-1">
                {isPresident ? "Full system access" : "Standard access"}
              </p>
            </div>

            {/* Account Info Card */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold">Account</h3>
              </div>
              <p className="text-cyan-400 font-medium">Verified</p>
              <p className="text-gray-500 text-sm mt-1">Account in good standing</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;