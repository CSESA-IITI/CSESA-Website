import { Github, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";

type TeamMember = {
  id: number;
  name: string;
  position: string;
  domain: string;
  skills: string[];
  avatarUrl: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  // any other links
};


export const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{
      boxShadow: "0 8px 40px 0 rgba(124, 88, 255, 0.45)",
      transition: { duration: 0.3 },
      scale: 1.03,
      background:
        "linear-gradient(135deg, rgba(127,90,255,0.15) 0%, rgba(109,74,255,0.18) 100%)",
      backdropFilter: "blur(22px)",
    }}
    className="relative flex flex-col items-center justify-between w-72 h-96 p-6 m-2 rounded-2xl bg-white/15 border border-white/30 shadow-lg transition-all duration-300 backdrop-blur-lg"
    style={{
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(127,90,255,0.13) 100%)",
      boxShadow: "0 4px 24px 0 rgba(124, 88, 255, 0.15)",
    }}
  >
    <img
      src={member.avatarUrl}
      alt={member.name}
      className="w-24 h-24 rounded-full shadow-xl ring-4 ring-violet-400/20 object-cover mb-3"
    />
    <div className="text-center mb-2">
      <div className="font-semibold text-white text-xl">{member.name}</div>
      <div className="text-violet-200 text-sm">{member.position}</div>
      <div className="text-violet-300 text-xs mb-2">{member.domain}</div>
      <div className="text-sm text-violet-100 flex flex-wrap gap-1 justify-center mb-2">
        {member.skills.map(skill => (
          <span
            key={skill}
            className="bg-violet-800/20 rounded-full px-2 py-0.5 font-medium text-xs"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
    <div className="flex space-x-4 mt-2 mb-4">
      {member.github && (
        <a href={member.github} target="_blank" rel="noopener" aria-label="GitHub">
          <Github size={22} className="text-violet-300 hover:text-white transition" />
        </a>
      )}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
          <Linkedin size={22} className="text-violet-300 hover:text-white transition" />
        </a>
      )}
      {member.instagram && (
        <a href={member.instagram} target="_blank" rel="noopener" aria-label="Instagram">
          <Instagram size={22} className="text-violet-300 hover:text-white transition" />
        </a>
      )}
      {/* add more social icons as needed */}
    </div>
    <a
      href={`/team/${member.id}`}
      className="w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-700 hover:from-violet-700 hover:to-purple-900 text-white rounded-lg py-2 font-semibold mt-auto transition"
    >
      View Profile
    </a>
  </motion.div>
);
