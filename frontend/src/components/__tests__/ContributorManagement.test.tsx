// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { User } from '../../services/authService';
// import ContributorManagement from '../ContributorManagement';
// import { useAuth } from '../../contexts/AuthContext';
// import { useToast } from '../../contexts/ToastContext';
// import { 
//   addContributorsOptimistic, 
//   removeContributorsOptimistic, 
//   getAvailableContributors 
// } from '../../services/api';

// // Mock dependencies
// vi.mock('../../contexts/AuthContext');
// vi.mock('../../contexts/ToastContext');
// vi.mock('../../services/api');
// vi.mock('../ContributorSelector', () => ({
//   default: ({ selectedContributors, availableUsers, onContributorChange, showAddSelfOption }: any) => (
//     <div data-testid="contributor-selector">
//       <div data-testid="available-users-count">{availableUsers.length}</div>
//       <div data-testid="selected-contributors-count">{selectedContributors.length}</div>
//       <div data-testid="show-add-self">{showAddSelfOption ? 'true' : 'false'}</div>
//       <button 
//         onClick={() => onContributorChange([...selectedContributors, availableUsers[0]])}
//         data-testid="select-contributor"
//       >
//         Select First User
//       </button>
//     </div>
//   )
// }));

// const mockUseAuth = vi.mocked(useAuth);
// const mockUseToast = vi.mocked(useToast);
// const mockAddContributorsOptimistic = vi.mocked(addContributorsOptimistic);
// const mockRemoveContributorsOptimistic = vi.mocked(removeContributorsOptimistic);
// const mockGetAvailableContributors = vi.mocked(getAvailableContributors);

// describe('ContributorManagement', () => {
//   const mockCurrentUser: User = {
//     id: '1',
//     email: 'current@example.com',
//     first_name: 'Current',
//     last_name: 'User',
//     role: 'PRESIDENT',
//     department: 'Computer Science',
//     year: '2024',
//     bio: 'Test bio',
//     image: 'https://example.com/avatar.jpg',
//     skills: [{ name: 'React' }],
//     github_link: 'https://github.com/current',
//     linkedin_link: 'https://linkedin.com/in/current'
//   };

//   const mockContributors: User[] = [
//     {
//       id: '2',
//       email: 'contributor1@example.com',
//       first_name: 'John',
//       last_name: 'Doe',
//       role: 'HEAD',
//       department: 'Computer Science',
//       year: '2023',
//       bio: 'Test bio',
//       image: '',
//       skills: [{ name: 'JavaScript' }],
//       github_link: '',
//       linkedin_link: ''
//     },
//     {
//       id: '3',
//       email: 'contributor2@example.com',
//       first_name: 'Jane',
//       last_name: 'Smith',
//       role: 'COORDINATOR',
//       department: 'Electronics',
//       year: '2024',
//       bio: 'Test bio',
//       image: 'https://example.com/jane.jpg',
//       skills: [{ name: 'Python' }],
//       github_link: '',
//       linkedin_link: ''
//     }
//   ];

//   const mockAvailableUsers: User[] = [
//     {
//       id: '4',
//       email: 'available1@example.com',
//       first_name: 'Available',
//       last_name: 'User',
//       role: 'ASSOCIATE',
//       department: 'Computer Science',
//       year: '2025',
//       bio: 'Test bio',
//       image: '',
//       skills: [{ name: 'Java' }],
//       github_link: '',
//       linkedin_link: ''
//     }
//   ];

//   const defaultProps = {
//     projectId: '1',
//     currentContributors: mockContributors,
//     onContributorsUpdate: vi.fn(),
//     canManage: true
//   };

//   beforeEach(() => {
//     mockUseAuth.mockReturnValue({
//       user: mockCurrentUser,
//       isAuthenticated: true,
//       login: vi.fn(),
//       logout: vi.fn(),
//       setUser: vi.fn(),
//       isLoading: false
//     });

//     mockUseToast.mockReturnValue({
//       toasts: [],
//       addToast: vi.fn(),
//       removeToast: vi.fn(),
//       clearAllToasts: vi.fn()
//     });

//     mockGetAvailableContributors.mockResolvedValue({
//       data: {
//         available_contributors: mockAvailableUsers,
//         count: mockAvailableUsers.length
//       }
//     });

//     mockAddContributorsOptimistic.mockImplementation(async (_projectId, _userIds, usersToAdd, currentContributors, onUpdate, _onError) => {
//       // Simulate successful optimistic update
//       onUpdate([...currentContributors, ...usersToAdd]);
//     });
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('Component Rendering', () => {
//     it('should render current contributors list', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       expect(screen.getByText('Contributors (2)')).toBeInTheDocument();
//       expect(screen.getByText('John Doe')).toBeInTheDocument();
//       expect(screen.getByText('Jane Smith')).toBeInTheDocument();
//       expect(screen.getByText('contributor1@example.com')).toBeInTheDocument();
//       expect(screen.getByText('contributor2@example.com')).toBeInTheDocument();
//     });

//     it('should show "No contributors yet" when list is empty', () => {
//       render(<ContributorManagement {...defaultProps} currentContributors={[]} />);
      
//       expect(screen.getByText('No contributors yet')).toBeInTheDocument();
//       expect(screen.getByText('Add team members to start collaborating on this project')).toBeInTheDocument();
//     });

//     it('should show "You" badge for current user', () => {
//       const contributorsWithCurrentUser = [...mockContributors, mockCurrentUser];
//       render(<ContributorManagement {...defaultProps} currentContributors={contributorsWithCurrentUser} />);
      
//       expect(screen.getByText('You')).toBeInTheDocument();
//     });

//     it('should display user avatars correctly', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       // Jane has an image, should render img element
//       const janeAvatar = screen.getByAltText('Jane Smith');
//       expect(janeAvatar).toBeInTheDocument();
//       expect(janeAvatar.tagName).toBe('IMG');
      
//       // John has no image, should show initials
//       expect(screen.getByText('JD')).toBeInTheDocument();
//     });
//   });

//   describe('Permission-based UI', () => {
//     it('should show Add Contributors button when user can manage', () => {
//       render(<ContributorManagement {...defaultProps} canManage={true} />);
      
//       expect(screen.getByText('Add Contributors')).toBeInTheDocument();
//     });

//     it('should hide Add Contributors button when user cannot manage', () => {
//       render(<ContributorManagement {...defaultProps} canManage={false} />);
      
//       expect(screen.queryByText('Add Contributors')).not.toBeInTheDocument();
//     });

//     it('should show remove buttons when user can manage', () => {
//       render(<ContributorManagement {...defaultProps} canManage={true} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       expect(removeButtons).toHaveLength(2);
//     });

//     it('should hide remove buttons when user cannot manage', () => {
//       render(<ContributorManagement {...defaultProps} canManage={false} />);
      
//       expect(screen.queryByTitle('Remove contributor')).not.toBeInTheDocument();
//     });
//   });

//   describe('Add Contributors Functionality', () => {
//     it('should show add interface when Add Contributors is clicked', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Add Contributors', { selector: 'h4' })).toBeInTheDocument();
//         expect(screen.getByTestId('contributor-selector')).toBeInTheDocument();
//       });
//     });

//     it('should fetch available contributors when add interface is shown', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(mockGetAvailableContributors).toHaveBeenCalledWith('1');
//       });
//     });

//     it('should pass correct props to ContributorSelector', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(screen.getByTestId('available-users-count')).toHaveTextContent('1');
//         expect(screen.getByTestId('selected-contributors-count')).toHaveTextContent('0');
//         expect(screen.getByTestId('show-add-self')).toHaveTextContent('false');
//       });
//     });

//     it('should handle contributor selection', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         expect(screen.getByTestId('selected-contributors-count')).toHaveTextContent('1');
//       });
//     });

//     it('should enable Add button when contributors are selected', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         const addButton = screen.getByText('Add 1 Contributor');
//         expect(addButton).toBeEnabled();
//       });
//     });

//     it('should call API to add contributors', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Add 1 Contributor'));
//       });
      
//       await waitFor(() => {
//         expect(mockAddContributorsOptimistic).toHaveBeenCalledWith(
//           '1', 
//           [4], 
//           [mockAvailableUsers[0]], 
//           mockContributors, 
//           expect.any(Function), 
//           expect.any(Function)
//         );
//       });
//     });

//     it('should call onContributorsUpdate after successful add', async () => {
//       const onContributorsUpdate = vi.fn();
//       render(<ContributorManagement {...defaultProps} onContributorsUpdate={onContributorsUpdate} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Add 1 Contributor'));
//       });
      
//       await waitFor(() => {
//         expect(onContributorsUpdate).toHaveBeenCalledWith([...mockContributors, mockAvailableUsers[0]]);
//       });
//     });

//     it('should close add interface after successful add', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Add 1 Contributor'));
//       });
      
//       await waitFor(() => {
//         expect(screen.queryByText('Add Contributors', { selector: 'h4' })).not.toBeInTheDocument();
//       });
//     });

//     it('should handle cancel add', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Cancel'));
//       });
      
//       expect(screen.queryByText('Add Contributors', { selector: 'h4' })).not.toBeInTheDocument();
//     });
//   });

//   describe('Remove Contributors Functionality', () => {
//     it('should show confirmation dialog when remove is clicked', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       expect(screen.getByText('Remove Contributor')).toBeInTheDocument();
//       expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
//       expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
//     });

//     it('should close confirmation dialog when cancel is clicked', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Cancel'));
      
//       expect(screen.queryByText('Remove Contributor')).not.toBeInTheDocument();
//     });

//     it('should call API to remove contributor when confirmed', async () => {
//       mockRemoveContributorsOptimistic.mockImplementation(async (projectId, userIds, currentContributors, onUpdate, onError) => {
//         // Simulate successful optimistic update
//         const updatedContributors = currentContributors.filter(c => !userIds.includes(parseInt(c.id)));
//         onUpdate(updatedContributors);
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       await waitFor(() => {
//         expect(mockRemoveContributorsOptimistic).toHaveBeenCalledWith(
//           '1', 
//           [2], 
//           mockContributors, 
//           expect.any(Function), 
//           expect.any(Function)
//         );
//       });
//     });

//     it('should call onContributorsUpdate after successful removal', async () => {
//       const onContributorsUpdate = vi.fn();
//       mockRemoveContributorsOptimistic.mockImplementation(async (projectId, userIds, currentContributors, onUpdate, onError) => {
//         // Simulate successful optimistic update
//         const updatedContributors = currentContributors.filter(c => !userIds.includes(parseInt(c.id)));
//         onUpdate(updatedContributors);
//       });

//       render(<ContributorManagement {...defaultProps} onContributorsUpdate={onContributorsUpdate} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       await waitFor(() => {
//         expect(onContributorsUpdate).toHaveBeenCalledWith([mockContributors[1]]);
//       });
//     });
//   });

//   describe('Error Handling', () => {
//     it('should display error when fetching available contributors fails', async () => {
//       const mockAddToast = vi.fn();
//       mockUseToast.mockReturnValue({
//         toasts: [],
//         addToast: mockAddToast,
//         removeToast: vi.fn(),
//         clearAllToasts: vi.fn()
//       });

//       mockGetAvailableContributors.mockRejectedValueOnce({
//         response: { data: { message: 'Failed to fetch contributors' } }
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Failed to fetch available contributors')).toBeInTheDocument();
//         expect(mockAddToast).toHaveBeenCalledWith({
//           type: 'error',
//           title: 'Failed to Load Contributors',
//           message: 'Failed to fetch available contributors',
//           duration: 6000,
//         });
//       });
//     });

//     it('should display error when adding contributors fails', async () => {
//       const mockAddToast = vi.fn();
//       mockUseToast.mockReturnValue({
//         toasts: [],
//         addToast: mockAddToast,
//         removeToast: vi.fn(),
//         clearAllToasts: vi.fn()
//       });

//       mockAddContributorsOptimistic.mockImplementation(async (_projectId, _userIds, _usersToAdd, _currentContributors, _onUpdate, onError) => {
//         // Simulate error
//         onError({ message: 'Failed to add contributors', name: 'ContributorAPIError' } as any);
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Add 1 Contributor'));
//       });
      
//       await waitFor(() => {
//         expect(screen.getByText('Failed to add contributors')).toBeInTheDocument();
//         expect(mockAddToast).toHaveBeenCalledWith({
//           type: 'error',
//           title: 'Failed to Add Contributors',
//           message: 'Failed to add contributors',
//           duration: 6000,
//         });
//       });
//     });

//     it('should display error when removing contributor fails', async () => {
//       const mockAddToast = vi.fn();
//       mockUseToast.mockReturnValue({
//         toasts: [],
//         addToast: mockAddToast,
//         removeToast: vi.fn(),
//         clearAllToasts: vi.fn()
//       });

//       mockRemoveContributorsOptimistic.mockImplementation(async (_projectId, _userIds, _currentContributors, _onUpdate, onError) => {
//         // Simulate error
//         onError({ message: 'Failed to remove contributor', name: 'ContributorAPIError' } as any);
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Failed to remove contributor')).toBeInTheDocument();
//         expect(mockAddToast).toHaveBeenCalledWith({
//           type: 'error',
//           title: 'Failed to Remove Contributor',
//           message: 'Failed to remove contributor',
//           duration: 6000,
//         });
//       });
//     });
//   });

//   describe('Loading States', () => {
//     it('should show loading state when fetching available contributors', async () => {
//       // Mock a delayed response
//       mockGetAvailableContributors.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       expect(screen.getByText('Loading available contributors...')).toBeInTheDocument();
//     });

//     it('should disable buttons during loading', async () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       // Mock a delayed response for removal
//       mockRemoveContributorsOptimistic.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       expect(screen.getByText('Removing...')).toBeInTheDocument();
//     });
//   });

//   describe('Toast Notifications', () => {
//     it('should show success toast when contributors are added successfully', async () => {
//       const mockAddToast = vi.fn();
//       mockUseToast.mockReturnValue({
//         toasts: [],
//         addToast: mockAddToast,
//         removeToast: vi.fn(),
//         clearAllToasts: vi.fn()
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByText('Add 1 Contributor'));
//       });
      
//       await waitFor(() => {
//         expect(mockAddToast).toHaveBeenCalledWith({
//           type: 'success',
//           title: 'Contributors Added Successfully',
//           message: 'Added 1 contributor: Available User',
//           duration: 5000,
//         });
//       });
//     });

//     it('should show success toast when contributor is removed successfully', async () => {
//       const mockAddToast = vi.fn();
//       mockUseToast.mockReturnValue({
//         toasts: [],
//         addToast: mockAddToast,
//         removeToast: vi.fn(),
//         clearAllToasts: vi.fn()
//       });

//       mockRemoveContributorsOptimistic.mockImplementation(async (_projectId, userIds, currentContributors, onUpdate, _onError) => {
//         const updatedContributors = currentContributors.filter(c => !userIds.includes(parseInt(c.id)));
//         onUpdate(updatedContributors);
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       await waitFor(() => {
//         expect(mockAddToast).toHaveBeenCalledWith({
//           type: 'success',
//           title: 'Contributor Removed',
//           message: 'Successfully removed John Doe from the project',
//           duration: 4000,
//         });
//       });
//     });
//   });

//   describe('Enhanced Loading States', () => {
//     it('should show loading spinner in remove button during removal', async () => {
//       // Mock a delayed response for removal
//       mockRemoveContributorsOptimistic.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       fireEvent.click(screen.getByText('Remove'));
      
//       // Should show loading spinner in the remove button
//       await waitFor(() => {
//         expect(screen.getByText('Removing...')).toBeInTheDocument();
//       });
//     });

//     it('should show loading spinner in add button during addition', async () => {
//       // Mock a delayed response for addition
//       mockAddContributorsOptimistic.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         fireEvent.click(screen.getByTestId('select-contributor'));
//       });
      
//       fireEvent.click(screen.getByText('Add 1 Contributor'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Adding...')).toBeInTheDocument();
//       });
//     });
//   });

//   describe('Error Boundary Integration', () => {
//     it('should be wrapped in ContributorErrorBoundary', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       // The component should render without throwing errors
//       expect(screen.getByText('Contributors (2)')).toBeInTheDocument();
//     });
//   });

//   describe('Inline Error Handling', () => {
//     it('should show retry button in error message', async () => {
//       mockGetAvailableContributors.mockRejectedValueOnce({
//         response: { data: { message: 'Network error' } }
//       });

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Try Again')).toBeInTheDocument();
//       });
//     });

//     it('should retry fetching contributors when retry button is clicked', async () => {
//       mockGetAvailableContributors
//         .mockRejectedValueOnce({
//           response: { data: { message: 'Network error' } }
//         })
//         .mockResolvedValueOnce({
//           data: {
//             available_contributors: mockAvailableUsers,
//             count: mockAvailableUsers.length
//           }
//         });

//       render(<ContributorManagement {...defaultProps} />);
      
//       fireEvent.click(screen.getByText('Add Contributors'));
      
//       await waitFor(() => {
//         expect(screen.getByText('Try Again')).toBeInTheDocument();
//       });

//       fireEvent.click(screen.getByText('Try Again'));
      
//       await waitFor(() => {
//         expect(mockGetAvailableContributors).toHaveBeenCalledTimes(2);
//       });
//     });
//   });

//   describe('Accessibility', () => {
//     it('should have proper ARIA labels and roles', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       expect(removeButtons[0]).toHaveAttribute('title', 'Remove contributor');
//     });

//     it('should handle keyboard navigation in confirmation dialog', () => {
//       render(<ContributorManagement {...defaultProps} />);
      
//       const removeButtons = screen.getAllByTitle('Remove contributor');
//       fireEvent.click(removeButtons[0]);
      
//       const cancelButton = screen.getByText('Cancel');
//       const removeButton = screen.getByText('Remove');
      
//       expect(cancelButton).toBeInTheDocument();
//       expect(removeButton).toBeInTheDocument();
//     });
//   });
// });