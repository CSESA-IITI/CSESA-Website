import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const Team = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Alex Chen",
      role: "President",
      department: "Computer Science",
      year: "Senior",
      bio: "Leading CSESA with passion for innovation and community building. Specializes in full-stack development and AI/ML.",
      skills: ["Leadership", "React", "Python", "Machine Learning"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Vice President",
      department: "Software Engineering",
      year: "Junior",
      bio: "Driving technical initiatives and fostering collaboration between students and industry professionals.",
      skills: ["Project Management", "Java", "DevOps", "Cloud Computing"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Marcus Rodriguez",
      role: "Technical Lead",
      department: "Computer Engineering",
      year: "Senior",
      bio: "Organizing hackathons and technical workshops. Passionate about open source and cybersecurity.",
      skills: ["Cybersecurity", "C++", "Linux", "Blockchain"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Emily Zhang",
      role: "Events Coordinator",
      department: "Information Systems",
      year: "Sophomore",
      bio: "Creating engaging events that bring together the CS community. Expert in UX design and mobile development.",
      skills: ["Event Planning", "UI/UX", "Flutter", "Design Thinking"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "David Kim",
      role: "Treasurer",
      department: "Data Science",
      year: "Junior",
      bio: "Managing finances and partnerships. Specializes in data analytics and financial technology.",
      skills: ["Finance", "Data Analysis", "R", "SQL"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Lisa Wang",
      role: "Secretary",
      department: "Computer Science",
      year: "Sophomore",
      bio: "Keeping everything organized and maintaining communication channels. Passionate about web development.",
      skills: ["Organization", "JavaScript", "Node.js", "Communication"],
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face"
    }
  ];

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-20 overflow-hidden">
      {/* Background Effects - Similar to Home */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-indigo-400 opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-blue-500 opacity-15"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
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
          <h1 className="text-3xl md:text-6xl font-extrabold mb-6 tracking-wider">
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent ">
              OUR TEAM
            </span>
          </h1>
          <p className="text-xl md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Meet our techies
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <motion.div
                    className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-500/30"
                    whileHover={{ borderColor: "rgba(59, 130, 246, 0.8)" }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    {member.year.charAt(0)}
                  </motion.div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors vamos">
                    {member.name}
                  </h3>
                  <p className="text-blue-400 font-semibold mb-1">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-4">{member.department}</p>
                  
                  {/* Skills Preview */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {member.skills.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 2 && (
                      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                        +{member.skills.length - 2}
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                  >
                    View Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { number: "500+", label: "Active Members" },
            { number: "50+", label: "Events Hosted" },
            { number: "25+", label: "Industry Partners" },
            { number: "100%", label: "Passion for CS" }
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
                className="text-3xl md:text-4xl font-bold text-blue-400 mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal for Member Details */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-500/30"
                  />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedMember.name}</h2>
                  <p className="text-blue-400 text-xl font-semibold mb-1">{selectedMember.role}</p>
                  <p className="text-gray-400 mb-4">{selectedMember.department} • {selectedMember.year}</p>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">{selectedMember.bio}</p>
                  
                  <div>
                    <h3 className="text-white font-semibold mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedMember.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Team;