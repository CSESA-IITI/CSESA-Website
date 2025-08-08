// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { toast } from 'react-toastify';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRole?: string;
//   redirectTo?: string;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   children,
//   requiredRole,
//   redirectTo = '/login',
// }) => {
//   const { isAuthenticated, hasRole, isLoading } = useAuth();
//   const location = useLocation();

//   // Show loading state while checking authentication
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Redirect to login if not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to={redirectTo} state={{ from: location }} replace />;
//   }

//   // Check if user has the required role
//   if (requiredRole && !hasRole(requiredRole)) {
//     toast.error('You do not have permission to access this page.');
//     return <Navigate to="/CSESA-Website" replace />;
//   }

//   // If all checks pass, render the children
//   return <>{children}</>;
// };

// export default ProtectedRoute;
