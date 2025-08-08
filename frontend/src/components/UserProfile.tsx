// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { Link } from 'react-router-dom';

// interface UserProfileProps {
//   className?: string;
// }

// // Helper function to get initials from name
// const getInitials = (name: string) => {
//   if (!name) return 'U';
//   const names = name.split(' ');
//   if (names.length === 1) return names[0].charAt(0).toUpperCase();
//   return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
// };

// // Helper function to get role display name
// const getRoleDisplayName = (role: string) => {
//   switch (role) {
//     case 'PRESIDENT':
//       return 'President';
//     case 'DOMAIN_HEAD':
//       return 'Domain Head';
//     case 'COORDINATOR':
//       return 'Coordinator';
//     case 'ASSOCIATE':
//       return 'Associate';
//     default:
//       return role;
//   }
// };

// const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
//   const { user, logout, isAuthenticated } = useAuth();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   if (!isAuthenticated || !user) {
//     return null;
//   }
  
//   const userInitials = getInitials(user.name || user.email || '');
//   const userRole = user.role ? getRoleDisplayName(user.role) : 'Member';

//   const toggleDropdown = () => {
//     if (isLoggingOut) return; // Prevent interaction during logout
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const handleLogout = async () => {
//     try {
//       setIsLoggingOut(true);
//       await logout();
//       toast.success('Successfully logged out');
//     } catch (error) {
//       console.error('Logout error:', error);
//       toast.error('Failed to log out. Please try again.');
//     } finally {
//       setIsLoggingOut(false);
//       setIsDropdownOpen(false);
//     }
//   };
  
//   // Close dropdown when clicking outside
//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (isDropdownOpen && !target.closest('.user-profile-dropdown')) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isDropdownOpen]);

//   return (
//     <div className={`relative user-profile-dropdown ${className}`}>
//       {/* User Avatar Button */}
//       <motion.button
//         onClick={toggleDropdown}
//         disabled={isLoggingOut}
//         whileHover={{ scale: 1.03 }}
//         whileTap={{ scale: 0.98 }}
//         className={`flex items-center gap-2 p-1.5 rounded-full transition-colors ${
//           isDropdownOpen 
//             ? 'bg-blue-500/20' 
//             : 'hover:bg-slate-800/50'
//         } ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
//         aria-label="User profile"
//         aria-expanded={isDropdownOpen}
//         aria-haspopup="true"
//       >
//         <div className="relative">
//           <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-colors bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
//             <span className="text-white font-semibold text-sm">
//               {userInitials}
//             </span>
//           </div>
//           <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></span>
//         </div>
//         <div className="hidden md:block text-left">
//           <p className="text-sm font-medium text-white">
//             {user.name || user.email?.split('@')[0] || 'User'}
//           </p>
//           {user.role && (
//             <p className="text-[10px] text-blue-400 font-medium">
//               {userRole}
//             </p>
//           )}
//         </div>
//         <svg
//           className={`w-4 h-4 text-slate-400 transition-transform ${
//             isDropdownOpen ? 'rotate-180' : ''
//           }`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </motion.button>

//       {/* Dropdown Menu */}
//       <AnimatePresence>
//         {isDropdownOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 10, scale: 0.98 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.98 }}
//             transition={{ duration: 0.15, ease: "easeOut" }}
//             className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-50 border border-blue-400/20"
//             style={{
//               boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
//             }}
//           >
//             {/* User Info Section */}
//             <div className="p-4 border-b border-blue-400/10">
//               <div className="flex items-center space-x-3">
//                 <div className="relative">
//                   <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
//                     <span className="text-white font-semibold text-sm">
//                       {userInitials}
//                     </span>
//                       </div>
//                     )}
//                   </div>
//                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-white truncate">
//                     {user.name || user.email?.split('@')[0] || 'User'}
//                   </p>
//                   <p className="text-xs text-blue-400 font-medium">
//                     {userRole}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate mt-0.5">
//                     {user.email || ''}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Menu Items */}
//             <div className="py-1">
//               <Link
//                 to="/profile"
//                 onClick={() => setIsDropdownOpen(false)}
//                 className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-blue-500/10 transition-colors hover:text-white"
//               >
//                 <div className="flex items-center space-x-2">
//                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   <span>My Profile</span>
//                 </div>
//               </Link>
              
//               <Link
//                 to="/settings"
//                 onClick={() => setIsDropdownOpen(false)}
//                 className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-blue-500/10 transition-colors hover:text-white"
//               >
//                 <div className="flex items-center space-x-2">
//                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                   <span>Settings</span>
//                 </div>
//               </Link>
              
//               <div className="border-t border-blue-400/10 my-1"></div>
              
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 </svg>
//                 Settings
//               </button>

//               <hr className="my-2 border-slate-700" />

//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//                 Sign Out
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Backdrop */}
//       {isDropdownOpen && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={() => setIsDropdownOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default UserProfile;
