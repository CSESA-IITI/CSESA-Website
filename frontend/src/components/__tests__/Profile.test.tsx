// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { BrowserRouter } from 'react-router-dom';
// import Profile from '../../pages/Profile';
// import { AuthProvider } from '../../contexts/AuthContext';
// import { ToastProvider } from '../../contexts/ToastContext';

// // Mock framer-motion
// jest.mock('framer-motion', () => ({
//   motion: {
//     div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
//     section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
//     button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
//     label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
//     a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
//   },
//   AnimatePresence: ({ children }: any) => children,
// }));

// // Mock auth service
// jest.mock('../../services/authService', () => ({
//   __esModule: true,
//   default: {
//     updateProfile: jest.fn(),
//     createUser: jest.fn(),
//   },
// }));

// const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <BrowserRouter>
//     <ToastProvider>
//       <AuthProvider>
//         {children}
//       </AuthProvider>
//     </ToastProvider>
//   </BrowserRouter>
// );

// describe('Profile Component', () => {
//   it('renders loading state when user is not loaded', () => {
//     render(
//       <MockProviders>
//         <Profile />
//       </MockProviders>
//     );

//     expect(screen.getByText('Loading profile...')).toBeInTheDocument();
//   });
// });