import { motion } from "motion/react";
import { User } from "../services/authService";

import { ProjectResponse } from "../services/api";

type Project = ProjectResponse;

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

const ProjectCard = ({ project, onClick, index }: ProjectCardProps) => {
  const techArray = project.tech_stack ? project.tech_stack.split(',').map(tech => tech.trim()) : [];
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, rotateY: 5 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-3 text-white group-hover:text-blue-400 transition-colors vamos">
            {project.name}
          </h3>
          <p className="text-gray-300 mb-4 line-clamp-3 alegreya-sans-sc-regular">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {techArray.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
              >
                {tech}
              </span>
            ))}
            {techArray.length > 3 && (
              <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                +{techArray.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {project.team_members_details.length > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {project.team_members_details.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold border-2 border-gray-900"
                        title={getFullName(member)}
                      >
                        {getInitials(member.first_name, member.last_name)}
                      </div>
                    ))}
                    {project.team_members_details.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-gray-900">
                        +{project.team_members_details.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {project.team_members_details.length} contributor{project.team_members_details.length !== 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 text-sm italic">No contributors yet</span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
            >
              View Details
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;