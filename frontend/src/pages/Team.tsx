import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import authService, { User } from "../services/authService";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleHierarchy = {
    'president': 1,
    'head': 2,
    'coordinator': 3,
    'associate': 4,
    'member': 5
  };

  const sortMembersByRole = (members: User[]) => {
    return members.sort((a, b) => {
      const roleA = a.role.toLowerCase();
      const roleB = b.role.toLowerCase();
      
      const hierarchyA = roleHierarchy[roleA as keyof typeof roleHierarchy] || 999;
      const hierarchyB = roleHierarchy[roleB as keyof typeof roleHierarchy] || 999;
      
      if (hierarchyA === hierarchyB) {
        return a.first_name.localeCompare(b.first_name);
      }
      
      return hierarchyA - hierarchyB;
    });
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await authService.getAllUsers();
        const sortedMembers = sortMembersByRole(response.data);
        setTeamMembers(sortedMembers);
      } catch (err) {
        setError("Failed to fetch team members. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-20 overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto mt-6">
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
            <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono ">
              &lt;TEAM_CSESA/&gt;
              {/* {` { TEAM }`} */}
            </span>
          </motion.div>

        </motion.div>

        {loading && <div className="text-center text-white/70">Loading Team...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="space-y-12">
            {Object.entries(
              teamMembers.reduce((groups, member) => {
                const role = member.role.toLowerCase();
                if (!groups[role]) groups[role] = [];
                groups[role].push(member);
                return groups;
              }, {} as Record<string, User[]>)
            )
            .sort(([roleA], [roleB]) => {
              const hierarchyA = roleHierarchy[roleA as keyof typeof roleHierarchy] || 999;
              const hierarchyB = roleHierarchy[roleB as keyof typeof roleHierarchy] || 999;
              return hierarchyA - hierarchyB;
            })
            .map(([role, members]) => (
              <div key={role} className="mb-16">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <h2 className={`text-2xl font-bold mb-2 ${
                    role === 'president' 
                      ? 'text-indigo-300'
                      : role === 'head'
                      ? 'text-purple-300'
                      : role === 'coordinator'
                      ? 'text-blue-300'
                      : 'text-green-300'
                  }`}>
                    {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {members.length > 1 ? 's' : ''}
                  </h2>
                  <div className={`w-24 h-1 mx-auto rounded-full ${
                    role === 'president' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-500'
                      : role === 'head'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : role === 'coordinator'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`} />
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: member.role.toLowerCase() === 'president' ? 1.08 : 1.05, rotateY: 5 }}
                className={`relative group cursor-pointer ${
                  member.role.toLowerCase() === 'president' ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                onClick={() => setSelectedMember(member)}
              >
                <div className={`backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ${
                  member.role.toLowerCase() === 'president'
                    ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 hover:border-indigo-400/60 shadow-lg shadow-indigo-500/10'
                    : member.role.toLowerCase() === 'head'
                    ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30 hover:border-purple-400/60'
                    : member.role.toLowerCase() === 'coordinator'
                    ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400/60'
                    : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50 hover:border-green-500/50'
                }`}>
                  <div className="relative mb-6">
                    <motion.div
                      className={`mx-auto rounded-full overflow-hidden border-4 ${
                        member.role.toLowerCase() === 'president'
                          ? 'w-40 h-40 border-indigo-500/50'
                          : 'w-32 h-32 border-blue-500/30'
                      }`}
                      whileHover={{ 
                        borderColor: member.role.toLowerCase() === 'president' 
                          ? "rgba(234, 179, 8, 0.8)" 
                          : "rgba(59, 130, 246, 0.8)" 
                      }}
                    >
                      <img
                        src={member.image_url || '/default.jpg'}
                        alt={`${member.first_name} ${member.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default.jpg';
                        }}
                      />
                    </motion.div>
                    {/* <motion.div
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        member.role.toLowerCase() === 'president'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      {member.role.toLowerCase() === 'president' ? '👑' : member.year.charAt(0)}
                    </motion.div> */}
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors vamos">
                      {`${member.first_name} ${member.last_name}`}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold alegreya-sans-sc-regular ${
                        member.role.toLowerCase() === 'president' 
                          ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-400/30 text-indigo-300'
                          : member.role.toLowerCase() === 'head'
                          ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 text-purple-300'
                          : member.role.toLowerCase() === 'coordinator'
                          ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 text-blue-300'
                          : 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 text-green-300'
                      }`}>
                        {member.role.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    {member.domain && (
                      <p className="text-purple-400 text-sm mb-1 alegreya-sans-sc-regular">
                        {member.domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    )}
                    {member.year && (
                      <p className="text-gray-400 text-sm mb-4 alegreya-sans-sc-regular">Class of {member.year}</p>
                    )}
                    <div></div>

                    {/* <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {member.skills.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {member.skills.length > 2 && (
                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                          +{member.skills.length - 2}
                        </span>
                      )}
                    </div> */}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 mt-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        
      </div>

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
                    src={selectedMember.image_url || '/default.jpg'}
                    alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-500/30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default.jpg';
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{`${selectedMember.first_name} ${selectedMember.last_name}`}</h2>
                  <div className="mb-2">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedMember.role.toLowerCase() === 'president' 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 text-indigo-300'
                        : selectedMember.role.toLowerCase() === 'head'
                        ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 text-purple-300'
                        : selectedMember.role.toLowerCase() === 'coordinator'
                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 text-blue-300'
                        : 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 text-green-300'
                    }`}>
                      {selectedMember.role.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  {selectedMember.domain && (
                    <p className="text-purple-400 text-lg font-medium mb-1">
                      {selectedMember.domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  )}
                  {selectedMember.year && (
                    <p className="text-gray-400 mb-4">Class of {selectedMember.year}</p>
                  )}

                  {selectedMember.bio && (
                    <p className="text-gray-300 mb-6 leading-relaxed">{selectedMember.bio}</p>
                  )}

                  <div>
                    <h3 className="text-white font-semibold mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedMember.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    {selectedMember.github_link && (
                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href={selectedMember.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </motion.a>
                    )}
                    {selectedMember.linkedin_link && (
                      <motion.a
                        whileHover={{ scale: 1.1, y: -2 }}
                        href={selectedMember.linkedin_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </motion.a>
                    )}
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