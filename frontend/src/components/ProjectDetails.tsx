import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { User } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import EditProjectModal from "./EditProjectModal";

import { ProjectResponse } from "../services/api";

type Project = ProjectResponse;

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated?: (updatedProject: Project) => void;
}

const ProjectDetails = ({ project, onClose, onProjectUpdated }: ProjectDetailsProps) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);
  
  const techArray = currentProject.tech_stack ? currentProject.tech_stack.split(',').map(tech => tech.trim()) : [];
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'from-purple-500 to-pink-500';
      case 'HEAD':
        return 'from-blue-500 to-cyan-500';
      case 'COORDINATOR':
        return 'from-green-500 to-teal-500';
      case 'ASSOCIATE':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const canEditProject = user && (
    user.role === 'PRESIDENT' || 
    user.role === 'HEAD' || 
    user.role === 'COORDINATOR' ||
    (currentProject.name && user.id === currentProject.name.toString())
  );

  const handleProjectUpdate = (updatedProject: Project) => {
    setCurrentProject(updatedProject);
    if (onProjectUpdated) {
      onProjectUpdated(updatedProject);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
        >
          ×
        </button>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-white vamos">{currentProject.name}</h2>
              {canEditProject && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </motion.button>
              )}
            </div>
            <p className="text-gray-300 text-lg alegreya-sans-sc-regular">{currentProject.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Created</h3>
              <p className="text-gray-300">{formatDate(currentProject.created_at)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Last Updated</h3>
              <p className="text-gray-300">{formatDate(currentProject.updated_at)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Technologies Used</h3>
            {techArray.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {techArray.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No technologies specified</p>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">
              Contributors ({currentProject.team_members_details.length})
            </h3>
            {currentProject.team_members_details.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProject.team_members_details.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRoleColor(member.role)} flex items-center justify-center text-sm font-bold text-white`}>
                      {getInitials(member.first_name, member.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {getFullName(member)}
                      </p>
                      <p className="text-gray-400 text-sm capitalize">
                        {member.role.toLowerCase()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No contributors yet</p>
                <p className="text-gray-600 text-sm mt-1">This project is looking for contributors</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-700">
            {currentProject.github_link && (
              <motion.a
                href={currentProject.github_link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>View Code</span>
              </motion.a>
            )}
            {currentProject.deployment_link && (
              <motion.a
                href={currentProject.deployment_link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Live Demo</span>
              </motion.a>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isEditModalOpen && (
            <EditProjectModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onProjectUpdated={handleProjectUpdate}
              project={currentProject}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProjectDetails;