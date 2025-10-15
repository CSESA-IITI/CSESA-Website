import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { getProjects } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import authService, { User } from "../services/authService";
import AddProjectModal from "../components/AddProjectModal";
import ProjectCard from "../components/ProjectCard";
import ProjectDetails from "../components/ProjectDetails";

import { ProjectResponse } from "../services/api";

type Project = ProjectResponse;

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          getProjects(),
          authService.getAllUsers(),
        ]);
        setProjects(projectsResponse.data);
        setAllUsers(usersResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndUsers();
  }, []);

  const filteredProjects = projects;

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-20 overflow-hidden">
      <motion.div
        className="absolute top-32 left-10 w-72 h-72 rounded-full bg-purple-500 opacity-10"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-32 right-10 w-96 h-96 rounded-full bg-cyan-400 opacity-15"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <span className="my-4 alegreya-sans-sc-regular inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono ">
              &lt;PROJECTS_CSESA/&gt;
            </span>
          </motion.div>
        </motion.div>



        <div className="flex justify-center mb-12">
          {isAuthenticated && (user?.role === 'PRESIDENT' || user?.role === 'HEAD') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold transition-all duration-300"
            >
              Add Project
            </motion.button>
          )}
        </div>

        {loading && <div className="text-center text-white/70">Loading Projects...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {/* Projects Grid */}
        {!loading && !error && (
          <motion.div
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetails
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onProjectUpdated={(updatedProject) => {
              setProjects(prevProjects => 
                prevProjects.map(p => 
                  p.id === updatedProject.id ? updatedProject : p
                )
              );
              setSelectedProject(updatedProject);
            }}
          />
        )}
      </AnimatePresence>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={(newProject) => setProjects([newProject, ...projects])}
        allUsers={allUsers}
      />
    </section>
  );
};

export default Projects;