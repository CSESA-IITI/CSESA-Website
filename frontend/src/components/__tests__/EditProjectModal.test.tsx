// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { vi, describe, it, expect, beforeEach } from 'vitest';
// import EditProjectModal from '../EditProjectModal';
// import * as api from '../../services/api';

// // Mock contexts
// const AuthContext = React.createContext({});
// const ToastContext = React.createContext({});

// // Mock the API
// vi.mock('../../services/api');
// const mockUpdateProject = vi.mocked(api.updateProject);

// // Mock framer-motion
// vi.mock('framer-motion', () => ({
//   motion: {
//     div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
//     button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
//   },
//   AnimatePresence: ({ children }: any) => <>{children}</>,
// }));

// // Mock ContributorManagement component
// vi.mock('../ContributorManagement', () => ({
//   default: ({ onContributorsUpdate, currentContributors }: any) => (
//     <div data-testid="contributor-management">
//       <button
//         onClick={() => onContributorsUpdate([
//           ...currentContributors,
//           { id: '3', first_name: 'New', last_name: 'Contributor', email: 'new@test.com', role: 'ASSOCIATE' }
//         ])}
//       >
//         Add Contributor
//       </button>
//     </div>
//   ),
// }));

// const mockProject = {
//   id: 1,
//   name: 'Test Project',
//   description: 'Test Description',
//   tech_stack: 'React, Node.js',
//   github_link: 'https://github.com/test/project',
//   deployment_link: 'https://test.example.com',
//   created_at: '2023-01-01T00:00:00Z',
//   updated_at: '2023-01-01T00:00:00Z',
//   created_by: 1,
//   team_members_details: [
//     { id: '1', first_name: 'Test', last_name: 'User', email: 'test@test.com', role: 'PRESIDENT' },
//     { id: '2', first_name: 'Another', last_name: 'User', email: 'another@test.com', role: 'ASSOCIATE' }
//   ],
//   domains_details: []
// };

// const mockUser = {
//   id: '1',
//   email: 'test@test.com',
//   first_name: 'Test',
//   last_name: 'User',
//   role: 'PRESIDENT'
// };

// const mockAuthContext = {
//   user: mockUser,
//   isAuthenticated: true,
//   login: vi.fn(),
//   logout: vi.fn(),
//   loading: false
// };

// const mockToastContext = {
//   showToast: vi.fn(),
//   toasts: []
// };

// const renderEditProjectModal = (props = {}) => {
//   const defaultProps = {
//     isOpen: true,
//     onClose: vi.fn(),
//     onProjectUpdated: vi.fn(),
//     project: mockProject,
//     ...props
//   };

//   return render(
//     <AuthContext.Provider value={mockAuthContext}>
//       <ToastContext.Provider value={mockToastContext}>
//         <EditProjectModal {...defaultProps} />
//       </ToastContext.Provider>
//     </AuthContext.Provider>
//   );
// };

// describe('EditProjectModal', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('renders edit project modal when open', () => {
//     renderEditProjectModal();
    
//     expect(screen.getByText('Edit Project')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('React, Node.js')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('https://github.com/test/project')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('https://test.example.com')).toBeInTheDocument();
//   });

//   it('does not render when closed', () => {
//     renderEditProjectModal({ isOpen: false });
    
//     expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
//   });

//   it('does not render when user cannot edit', () => {
//     const nonCreatorUser = {
//       ...mockUser,
//       id: '999',
//       role: 'ASSOCIATE'
//     };

//     renderEditProjectModal({
//       authContext: { ...mockAuthContext, user: nonCreatorUser }
//     });
    
//     expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
//   });

//   it('allows project creator to edit', () => {
//     renderEditProjectModal();
    
//     expect(screen.getByText('Edit Project')).toBeInTheDocument();
//   });

//   it('allows president to edit any project', () => {
//     const presidentUser = {
//       ...mockUser,
//       id: '999',
//       role: 'PRESIDENT'
//     };

//     renderEditProjectModal({
//       authContext: { ...mockAuthContext, user: presidentUser }
//     });
    
//     expect(screen.getByText('Edit Project')).toBeInTheDocument();
//   });

//   it('validates required fields', async () => {
//     renderEditProjectModal();
    
//     // Clear required fields
//     const titleInput = screen.getByDisplayValue('Test Project');
//     const descriptionInput = screen.getByDisplayValue('Test Description');
    
//     fireEvent.change(titleInput, { target: { value: '' } });
//     fireEvent.change(descriptionInput, { target: { value: '' } });
    
//     // Submit form
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(screen.getByText('Title is required')).toBeInTheDocument();
//       expect(screen.getByText('Description is required')).toBeInTheDocument();
//     });
    
//     expect(mockUpdateProject).not.toHaveBeenCalled();
//   });

//   it('validates URL fields', async () => {
//     renderEditProjectModal();
    
//     const githubInput = screen.getByDisplayValue('https://github.com/test/project');
//     const deploymentInput = screen.getByDisplayValue('https://test.example.com');
    
//     fireEvent.change(githubInput, { target: { value: 'invalid-url' } });
//     fireEvent.change(deploymentInput, { target: { value: 'also-invalid' } });
    
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(screen.getByText('Please enter a valid GitHub URL')).toBeInTheDocument();
//       expect(screen.getByText('Please enter a valid deployment URL')).toBeInTheDocument();
//     });
    
//     expect(mockUpdateProject).not.toHaveBeenCalled();
//   });

//   it('submits form with updated data', async () => {
//     const mockUpdatedProject = {
//       ...mockProject,
//       name: 'Updated Project Name',
//       description: 'Updated description'
//     };

//     mockUpdateProject.mockResolvedValue({ data: mockUpdatedProject });

//     const onProjectUpdated = vi.fn();
//     const onClose = vi.fn();

//     renderEditProjectModal({ onProjectUpdated, onClose });
    
//     // Update form fields
//     const titleInput = screen.getByDisplayValue('Test Project');
//     const descriptionInput = screen.getByDisplayValue('Test Description');
    
//     fireEvent.change(titleInput, { target: { value: 'Updated Project Name' } });
//     fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    
//     // Submit form
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(mockUpdateProject).toHaveBeenCalledWith('1', {
//         name: 'Updated Project Name',
//         description: 'Updated description',
//         tech_stack: 'React, Node.js',
//         github_link: 'https://github.com/test/project',
//         deployment_link: 'https://test.example.com',
//         team_members: [1, 2]
//       });
//     });
    
//     expect(onProjectUpdated).toHaveBeenCalledWith(mockUpdatedProject);
//     expect(onClose).toHaveBeenCalled();
//     expect(mockToastContext.showToast).toHaveBeenCalledWith('Project updated successfully!', 'success');
//   });

//   it('handles contributor updates', async () => {
//     const mockUpdatedProject = {
//       ...mockProject,
//       team_members_details: [
//         ...mockProject.team_members_details,
//         { id: '3', first_name: 'New', last_name: 'Contributor', email: 'new@test.com', role: 'ASSOCIATE' }
//       ]
//     };

//     mockUpdateProject.mockResolvedValue({ data: mockUpdatedProject });

//     const onProjectUpdated = vi.fn();
//     renderEditProjectModal({ onProjectUpdated });
    
//     // Add contributor through ContributorManagement component
//     const addContributorButton = screen.getByText('Add Contributor');
//     fireEvent.click(addContributorButton);
    
//     // Submit form
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(mockUpdateProject).toHaveBeenCalledWith('1', expect.objectContaining({
//         team_members: [1, 2, 3]
//       }));
//     });
//   });

//   it('handles API errors', async () => {
//     mockUpdateProject.mockRejectedValue(new Error('API Error'));

//     renderEditProjectModal();
    
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(screen.getByText('Failed to update project. Please try again.')).toBeInTheDocument();
//     });
    
//     expect(mockToastContext.showToast).toHaveBeenCalledWith('Failed to update project', 'error');
//   });

//   it('shows loading state during submission', async () => {
//     mockUpdateProject.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

//     renderEditProjectModal();
    
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     expect(screen.getByText('Updating...')).toBeInTheDocument();
//     expect(submitButton).toBeDisabled();
//   });

//   it('closes modal when cancel is clicked', () => {
//     const onClose = vi.fn();
//     renderEditProjectModal({ onClose });
    
//     const cancelButton = screen.getByText('Cancel');
//     fireEvent.click(cancelButton);
    
//     expect(onClose).toHaveBeenCalled();
//   });

//   it('closes modal when X button is clicked', () => {
//     const onClose = vi.fn();
//     renderEditProjectModal({ onClose });
    
//     const closeButton = screen.getByText('×');
//     fireEvent.click(closeButton);
    
//     expect(onClose).toHaveBeenCalled();
//   });

//   it('resets form when project changes', () => {
//     const { rerender } = renderEditProjectModal();
    
//     // Change a field
//     const titleInput = screen.getByDisplayValue('Test Project');
//     fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    
//     expect(screen.getByDisplayValue('Changed Title')).toBeInTheDocument();
    
//     // Change project prop
//     const newProject = {
//       ...mockProject,
//       name: 'Different Project',
//       description: 'Different Description'
//     };
    
//     rerender(
//       <AuthContext.Provider value={mockAuthContext}>
//         <ToastContext.Provider value={mockToastContext}>
//           <EditProjectModal
//             isOpen={true}
//             onClose={vi.fn()}
//             onProjectUpdated={vi.fn()}
//             project={newProject}
//           />
//         </ToastContext.Provider>
//       </AuthContext.Provider>
//     );
    
//     // Form should reset to new project values
//     expect(screen.getByDisplayValue('Different Project')).toBeInTheDocument();
//     expect(screen.getByDisplayValue('Different Description')).toBeInTheDocument();
//   });

//   it('includes ContributorManagement component', () => {
//     renderEditProjectModal();
    
//     expect(screen.getByTestId('contributor-management')).toBeInTheDocument();
//   });

//   it('handles empty deployment link', async () => {
//     const mockUpdatedProject = { ...mockProject, deployment_link: null };
//     mockUpdateProject.mockResolvedValue({ data: mockUpdatedProject });

//     renderEditProjectModal();
    
//     // Clear deployment link
//     const deploymentInput = screen.getByDisplayValue('https://test.example.com');
//     fireEvent.change(deploymentInput, { target: { value: '' } });
    
//     const submitButton = screen.getByText('Update Project');
//     fireEvent.click(submitButton);
    
//     await waitFor(() => {
//       expect(mockUpdateProject).toHaveBeenCalledWith('1', expect.objectContaining({
//         deployment_link: null
//       }));
//     });
//   });
// });