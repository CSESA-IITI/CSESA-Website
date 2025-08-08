import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

// 1. Define an interface for a TeamMember object
interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  year: string;
  bio: string; // We'll add a default for this
  skills: string[];
  image: string;
}

const Team = () => {
  // 2. Type selectedMember state: TeamMember | null
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getUsers();

        // The backend uses pagination, so the user data is in response.data.results
        const rawUsers = response.data.results || [];

        // Transform the backend data to match the frontend's TeamMember interface
        const transformedMembers: TeamMember[] = rawUsers.map((user: any) => {
          const backendUrl = "http://127.0.0.1:8000";
          return {
            id: user.id,
            name: user.name,
            role: user.role_name || "Member", // from role_name
            department: user.domain_name || "General", // from domain_name
            year: user.batch || "N/A", // from batch
            skills: user.skills || [],
            image: user.profile_pic
              ? `${backendUrl}${user.profile_pic}`
              : `https://ui-avatars.com/api/?name=${user.name.replace(
                  " ",
                  "+"
                )}&background=random`,
            // Your User model doesn't have a 'bio' field, so we add a placeholder.
            bio: "This member has not yet added a bio. They are a valued part of our team, contributing with their unique skills and perspective.",
          };
        });

        setTeamMembers(transformedMembers);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
        setError("Could not load the team list.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Team...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

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
            <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono ">
              &lt;TEAM_CSESA/&gt;
              {/* {` { TEAM }`} */}
            </span>
          </motion.div>
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
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {member.year.charAt(0)}
                  </motion.div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors vamos">
                    {member.name}
                  </h3>
                  <p className="text-blue-400 font-semibold mb-1 alegreya-sans-sc-regular">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm mb-4 alegreya-sans-sc-regular">
                    {member.department}
                  </p>

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
      </div>

      {/* Modal for Member Details */}
      <AnimatePresence>
        {/* 4. Conditional rendering ensures selectedMember is not null */}
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
                    src={selectedMember.image} // No error now as selectedMember is guaranteed to be a TeamMember
                    alt={selectedMember.name} // No error
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-500/30"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedMember.name}
                  </h2>
                  <p className="text-blue-400 text-xl font-semibold mb-1">
                    {selectedMember.role}
                  </p>
                  <p className="text-gray-400 mb-4">
                    {selectedMember.department} • {selectedMember.year}
                  </p>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {selectedMember.bio}
                  </p>

                  <div>
                    <h3 className="text-white font-semibold mb-3">
                      Skills & Expertise
                    </h3>
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
