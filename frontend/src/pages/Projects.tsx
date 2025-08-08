import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

interface Project {
  id: number;
  title: string; // 'name' from backend
  category: string; // Derived from 'domains_data'
  status: "completed" | "in-progress"; // 'status' from backend
  description: string; // 'description_short' from backend
  longDescription: string; // 'description_long' from backend
  technologies: string[]; // 'tech_stack' from backend
  github: string | null;
  demo: string | null;
  image: string;
  team: string[]; // Derived from 'team_members_data'
}

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getProjects();
        console.log(response.data)

        // **THE FIX**: Access the .results property of the paginated response
        const projectData = response.data.results || [];

        // Transform API data to match the frontend 'Project' interface
        const transformedData: Project[] = projectData.map((p: any) => ({
          id: p.id,
          title: p.name,
          // Use the first domain name as the category, with a fallback
          category: p.domains_data[0]?.name || "General",
          status: p.status,
          description: p.description_short, // Use description_short
          longDescription: p.description_long,
          technologies: p.tech_stack, // Use tech_stack
          github: p.github_link,
          demo: p.deployment_link,
          image: p.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
          // Map team members to just their names
          team: p.team_members_data.map((member: any) => member.user.first_name || "User"),
          // The fields below do not exist in your serializer, so they are removed.
          // achievements: [],
          // timeline: "",
        }));
        
        // Dynamically create category list from fetched projects
        const uniqueCategories = ["all", ...new Set(transformedData.map(p => p.category))];
        setCategories(uniqueCategories);
        
        setProjects(transformedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Could not load projects. The server might be down or an error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const statusColors: Record<Project['status'], string> = {
    completed: "bg-green-500",
    "in-progress": "bg-yellow-500",
  };

  const filteredProjects = filterCategory === "all"
    ? projects
    : projects.filter(project => project.category === filterCategory);

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Projects...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-20 overflow-hidden">
      {/* Background Effects */}
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

        {/* Filter Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                filterCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
              }`}
            >
              {category === "all" ? "All Projects" : category}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}

              >
                <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
                  {/* Project Image */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {/* Access statusColors using project.status (now correctly typed) */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[project.status]}`}>
                        {project.status.replace("-", " ").toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-semibold">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-3 text-white group-hover:text-blue-400 transition-colors vamos">
                      {project.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-3 alegreya-sans-sc-regular">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold border-2 border-gray-900"
                          >
                            {member.split(" ").map(n => n[0]).join("")}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-gray-900">
                            +{project.team.length - 3}
                          </div>
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
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {/* 7. Conditional rendering ensures selectedProject is not null */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
              >
                ×
              </button>

              {/* Project Header */}
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <div className="flex gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[selectedProject.status]}`}>
                      {selectedProject.status.replace("-", " ").toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-semibold">
                      {selectedProject.category}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedProject.title}</h2>
                </div>
              </div>

              <div className="p-8">
                {/* Project Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">About the Project</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedProject.longDescription}</p>
                </div>


                {/* Technologies */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Team Members</h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedProject.team.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                          {member.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-gray-300">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedProject.github && ( 
                    <motion.a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <span>View Code</span>
                    </motion.a>
                  )}
                  {selectedProject.demo && ( 
                    <motion.a
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>Live Demo</span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;