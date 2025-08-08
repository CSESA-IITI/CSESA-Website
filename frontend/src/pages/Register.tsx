// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import Magnet from "../components/ui/Magnet";

// // Role options for the select dropdown
// const roleOptions = [
//   { value: 'DOMAIN_HEAD', label: 'Domain Head' },
//   { value: 'COORDINATOR', label: 'Coordinator' },
//   { value: 'ASSOCIATE', label: 'Associate' },
// ];

// const Register = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     first_name: "",
//     last_name: "",
//     role: "ASSOCIATE",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { isAuthenticated, hasRole } = useAuth();
//   // Redirect if not authenticated or not President
//   useEffect(() => {
//     if (!isAuthenticated) {
//       window.location.href = "/login";
//     } else if (!hasRole('PRESIDENT')) {
//       toast.error("Only the President can access this page.");
//       window.location.href = "/";
//     }
//   }, [isAuthenticated, hasRole]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (!formData.email.endsWith('@iiti.ac.in')) {
//       setError("Please use an IITI institutional email.");
//       return;
//     }
    
//     if (!formData.first_name || !formData.last_name) {
//       setError("Please provide both first and last name.");
//       return;
//     }
    
//     setError("");
//     setIsLoading(true);
    
//     try {
//       // Call the register API through AuthContext
//       const response = await fetch('/api/auth/register/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         },
//         body: JSON.stringify({
//           ...formData,
//           // Add any additional required fields here
//           password: 'temporary-password-123', // This will be changed by the user
//           password2: 'temporary-password-123',
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to register user');
//       }
      
//       await response.json();
//       toast.success(`Invitation sent to ${formData.email}`);
      
//       // Reset form
//       setFormData({
//         email: "",
//         first_name: "",
//         last_name: "",
//         role: "ASSOCIATE",
//       });
      
//     } catch (err: any) {
//       console.error("Registration error:", err);
//       const errorMessage = err.message || "Failed to register user. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Animation variants
//   const cardVariants = {
//     hidden: { opacity: 0, scale: 0.95, y: 20 },
//     visible: {
//       opacity: 1,
//       scale: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: "easeOut",
//         when: "beforeChildren",
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 15 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.4, ease: "easeOut" },
//     },
//   };

//   const errorVariants = {
//     initial: { opacity: 0, height: 0, y: -10 },
//     animate: { opacity: 1, height: "auto", y: 0 },
//     exit: { opacity: 0, height: 0, y: -10 },
//   };

//   return (
//     <section className="relative min-h-screen flex items-center justify-center bg-black text-white px-4 py-12">
//       <motion.div
//         className="w-full max-w-md bg-gradient-to-b from-blue-400 to-white rounded-2xl shadow-2xl px-8 py-12 
//         before:absolute before:inset-0 before:content-[''] before:bg-[url('/noise_texture_3.png')] before:opacity-40 before:z-0"
//         variants={cardVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         <div className="relative z-10">
//           <motion.h2
//             className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-white vamos tracking-widest"
//             variants={itemVariants}
//           >
//             INVITE MEMBER
//           </motion.h2>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <motion.div variants={itemVariants}>
//               <label
//                 className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
//                 htmlFor="email"
//               >
//                 IITI Email
//               </label>
//               <div className="relative">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   className="w-full text-xs px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 vamos"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="username@iiti.ac.in"
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
//               <div>
//                 <label
//                   className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
//                   htmlFor="first_name"
//                 >
//                   First Name
//                 </label>
//                 <input
//                   id="first_name"
//                   name="first_name"
//                   type="text"
//                   className="w-full text-xs px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//               <div>
//                 <label
//                   className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
//                   htmlFor="last_name"
//                 >
//                   Last Name
//                 </label>
//                 <input
//                   id="last_name"
//                   name="last_name"
//                   type="text"
//                   className="w-full text-xs px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants}>
//               <label
//                 className="block text-sm font-medium mb-2 alegreya-sans-sc-regular"
//                 htmlFor="role"
//               >
//                 Role
//               </label>
//               <div className="relative">
//                 <select
//                   id="role"
//                   name="role"
//                   className="w-full text-xs px-4 py-2 rounded-lg bg-transparent border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
//                   value={formData.role}
//                   onChange={handleChange}
//                   required
//                 >
//                   {roleOptions.map((option) => (
//                     <option 
//                       key={option.value} 
//                       value={option.value}
//                       className="bg-gray-900 text-white"
//                     >
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                   <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Error message */}
//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   className="text-red-400 text-sm mt-2"
//                   variants={errorVariants}
//                   initial="initial"
//                   animate="animate"
//                   exit="exit"
//                 >
//                   {error}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <motion.div variants={itemVariants} className="pt-2">
//               <Magnet>
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className={`w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending Invite...
//                     </>
//                   ) : 'Send Invitation'}
//                 </button>
//               </Magnet>
//             </motion.div>
//           </form>
//         </div>
//       </motion.div>
//     </section>
//   );
// };

// export default Register;
