import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const projects = [
    {
      id: 1,
      title: "AI Study Buddy",
      category: "AI/ML",
      status: "completed",
      description: "An intelligent tutoring system that helps students learn programming concepts through personalized AI assistance.",
      longDescription: "AI Study Buddy is a comprehensive learning platform that uses machine learning algorithms to adapt to each student's learning style. The system analyzes coding patterns, identifies knowledge gaps, and provides personalized recommendations for improvement. Built with React, Python Flask, and TensorFlow, it has helped over 200 students improve their programming skills.",
      technologies: ["React", "Python", "TensorFlow", "Flask", "PostgreSQL"],
      github: "https://github.com/csesa/ai-study-buddy",
      demo: "https://ai-study-buddy.csesa.org",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
      team: ["Alex Chen", "Sarah Johnson", "Emily Zhang"],
      achievements: ["Winner of University Innovation Award", "1000+ active users", "Featured in Tech News"],
      timeline: "Sep 2024 - Dec 2024"
    },
    {
      id: 2,
      title: "Campus Connect",
      category: "Web Development",
      status: "in-progress",
      description: "A social networking platform designed specifically for university students to connect, collaborate, and share resources.",
      longDescription: "Campus Connect aims to bridge the gap between students across different departments and year levels. The platform features study groups, project collaboration tools, event management, and a resource sharing system. Currently in beta testing with 500+ student users.",
      technologies: ["Next.js", "Node.js", "MongoDB", "Socket.io", "AWS"],
      github: "https://github.com/csesa/campus-connect",
      demo: "https://beta.campus-connect.edu",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
      team: ["Marcus Rodriguez", "Lisa Wang", "David Kim"],
      achievements: ["500+ beta users", "Positive feedback from students", "Partnership with Student Affairs"],
      timeline: "Jan 2025 - Ongoing"
    },
    {
      id: 3,
      title: "CodeLab VR",
      category: "VR/AR",
      status: "completed",
      description: "Virtual reality environment for learning programming concepts through immersive 3D visualizations.",
      longDescription: "CodeLab VR revolutionizes programming education by creating immersive virtual environments where students can visualize data structures, algorithms, and code execution in 3D space. The project won first place in the National VR Education Hackathon.",
      technologies: ["Unity", "C#", "Oculus SDK", "Blender", "Firebase"],
      github: "https://github.com/csesa/codelab-vr",
      demo: "https://codelab-vr.csesa.org",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=500&h=300&fit=crop",
      team: ["Emily Zhang", "Alex Chen", "Marcus Rodriguez"],
      achievements: ["1st Place National VR Hackathon", "Featured in VR Education Journal", "Patent Application Filed"],
      timeline: "Mar 2024 - Aug 2024"
    },
    {
      id: 4,
      title: "EcoTrack",
      category: "Mobile Development",
      status: "completed",
      description: "Mobile app for tracking and reducing carbon footprint with gamification elements and community challenges.",
      longDescription: "EcoTrack motivates users to adopt sustainable practices through gamification and social features. Users can track their daily activities, earn points for eco-friendly choices, and participate in community challenges. The app has been downloaded over 5000 times.",
      technologies: ["React Native", "Firebase", "Node.js", "Google Maps API"],
      github: "https://github.com/csesa/ecotrack",
      demo: "https://apps.apple.com/ecotrack",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop",
      team: ["Sarah Johnson", "David Kim", "Lisa Wang"],
      achievements: ["5000+ downloads", "4.8 star rating", "Featured in App Store"],
      timeline: "Jun 2024 - Oct 2024"
    },
    {
      id: 5,
      title: "Blockchain Voting System",
      category: "Blockchain",
      status: "in-progress",
      description: "Secure and transparent voting system using blockchain technology for student government elections.",
      longDescription: "A decentralized voting platform that ensures election integrity and transparency. The system uses smart contracts to automate vote counting and provides real-time results while maintaining voter anonymity. Currently being tested for student government elections.",
      technologies: ["Solidity", "Web3.js", "React", "Ethereum", "IPFS"],
      github: "https://github.com/csesa/blockchain-voting",
      demo: "https://vote.csesa.org",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop",
      team: ["Marcus Rodriguez", "Alex Chen", "David Kim"],
      achievements: ["Successful pilot test", "Security audit passed", "Collaboration with Student Government"],
      timeline: "Nov 2024 - Ongoing"
    },
    {
      id: 6,
      title: "Smart Library System",
      category: "IoT",
      status: "planning",
      description: "IoT-based library management system with automated book tracking and smart study space allocation.",
      longDescription: "An intelligent library system that uses IoT sensors to track book locations, monitor study space occupancy, and provide real-time availability updates. The system aims to optimize library resources and improve student experience.",
      technologies: ["Arduino", "Raspberry Pi", "Python", "React", "LoRaWAN"],
      github: "https://github.com/csesa/smart-library",
      demo: null,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
      team: ["Emily Zhang", "Sarah Johnson", "Lisa Wang"],
      achievements: ["Approved by Library Committee", "Funding secured", "Partnership with IoT Lab"],
      timeline: "Mar 2025 - Planned"
    }
  ];

  const categories = ["all", "AI/ML", "Web Development", "VR/AR", "Mobile Development", "Blockchain", "IoT"];
  const statusColors = {
    completed: "bg-green-500",
    "in-progress": "bg-yellow-500",
    planning: "bg-blue-500"
  };

  const filteredProjects = filterCategory === "all" 
    ? projects 
    : projects.filter(project => project.category === filterCategory);

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
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              OUR PROJECTS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Innovative solutions built by students, for students. Exploring the future of technology.
          </p>
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
                    <p className="text-gray-300 mb-4 line-clamp-3">
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

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: "25+", label: "Projects Completed" },
            { number: "10+", label: "Technologies Used" },
            { number: "50+", label: "Contributors" },
            { number: "10K+", label: "Users Impacted" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="bg-gray-900/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
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

                {/* Timeline */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Timeline</h3>
                  <p className="text-gray-300">{selectedProject.timeline}</p>
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

                {/* Achievements */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                  <ul className="space-y-2">
                    {selectedProject.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {achievement}
                      </li>
                    ))}
                  </ul>
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