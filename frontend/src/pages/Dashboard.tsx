import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome to Your Dashboard</h1>
        
        {user && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Name:</p>
                <p className="text-xl">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Email:</p>
                <p className="text-xl">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Role:</p>
                <p className="text-xl capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add dashboard cards or components here */}
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Events</h3>
            <p className="text-gray-400">Manage and view upcoming events</p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Projects</h3>
            <p className="text-gray-400">Track ongoing projects and tasks</p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-2">Team</h3>
            <p className="text-gray-400">View and manage team members</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
