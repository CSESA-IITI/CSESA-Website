// import { DiamondGrid } from "../components/DiamondGrid";
// import { TeamCard } from "../components/TeamCard";


// const CardGridPage = () => {
//   const teamMembers = [
//     {
//       id: 1,
//       name: "Alex Chen",
//       role: "President",
//       department: "Computer Science",
//       year: "Senior",
//       bio: "Leading CSESA with passion for innovation and community building. Specializes in full-stack development and AI/ML.",
//       skills: ["Leadership", "React", "Python", "Machine Learning"],
//       image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
//     },
//     {
//       id: 2,
//       name: "Sarah Johnson",
//       role: "Vice President",
//       department: "Software Engineering",
//       year: "Junior",
//       bio: "Driving technical initiatives and fostering collaboration between students and industry professionals.",
//       skills: ["Project Management", "Java", "DevOps", "Cloud Computing"],
//       image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit:crop&crop=face"
//     },
//     {
//       id: 3,
//       name: "Marcus Rodriguez",
//       role: "Technical Lead",
//       department: "Computer Engineering",
//       year: "Senior",
//       bio: "Organizing hackathons and technical workshops. Passionate about open source and cybersecurity.",
//       skills: ["Cybersecurity", "C++", "Linux", "Blockchain"],
//       image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit:crop&crop=face"
//     },
//     {
//       id: 4,
//       name: "Emily Zhang",
//       role: "Events Coordinator",
//       department: "Information Systems",
//       year: "Sophomore",
//       bio: "Creating engaging events that bring together the CS community. Expert in UX design and mobile development.",
//       skills: ["Event Planning", "UI/UX", "Flutter", "Design Thinking"],
//       image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit:crop&crop=face"
//     },
//     {
//       id: 5,
//       name: "David Kim",
//       role: "Treasurer",
//       department: "Data Science",
//       year: "Junior",
//       bio: "Managing finances and partnerships. Specializes in data analytics and financial technology.",
//       skills: ["Finance", "Data Analysis", "R", "SQL"],
//       image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit:crop&crop=face"
//     },
//     {
//       id: 6,
//       name: "Lisa Wang",
//       role: "Secretary",
//       department: "Computer Science",
//       year: "Sophomore",
//       bio: "Keeping everything organized and maintaining communication channels. Passionate about web development.",
//       skills: ["Organization", "JavaScript", "Node.js", "Communication"],
//       image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit:crop&crop=face"
//     }
//   ];

//   return (
//     <div className="">
//       <div className="">
//         <DiamondGrid>
//           {teamMembers.map((member) => (
//             <TeamCard key={member.id} member={member} />
//           ))}
//         </DiamondGrid>
//       </div>
//     </div>
//   );
// };

// export default CardGridPage;
