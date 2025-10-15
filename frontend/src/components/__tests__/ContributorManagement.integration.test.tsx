/**
 * Integration tests for complete contributor management flow.
 * Tests the full end-to-end workflow including project creation with self-assignment,
 * contributor add/remove operations, permission validation, and error scenarios.
 * 
 * Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '../../services/authService';
import ContributorManagement from '../ContributorManagement';
import ContributorSelector from '../ContributorSelector';
import AddProjectModal from '../AddProjectModal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  addContributorsOptimistic, 
  removeContributorsOptimistic, 
  getAvailableContributors,
  createProject,
  getProject
} from '../../services/api';

// Mock dependencies
vi.mock('../../contexts/AuthContext');
vi.mock('../../contexts/ToastContext');
vi.mock('../../services/api');

const mockUseAuth = vi.mocked(useAuth);
const mockUseToast = vi.mocked(useToast);
const mockAddContributorsOptimistic = vi.mocked(addContributorsOptimistic);
const mockRemoveContributorsOptimistic = vi.mocked(removeContributorsOptimistic);
const mockGetAvailableContributors = vi.mocked(getAvailableContributors);
const mockCreateProject = vi.mocked(createProject);
const mockGetProject = vi.mocked(getProject);

describe('Contributor Management Integration Tests', () => {
  const mockPresident: User = {
    id: '1',
    email: 'president@iiti.ac.in',
    first_name: 'Test',
    last_name: 'President',
    role: 'PRESIDENT',
    department: 'Computer Science',
    year: '2024',
    bio: 'Test bio',
    image: 'https://example.com/president.jpg',
    skills: [{ name: 'Leadership' }],
    github_link: 'https://github.com/president',
    linkedin_link: 'https://linkedin.com/in/president'
  };

  const mockCoordinator: User = {
    id: '2',
    email: 'coordinator@iiti.ac.in',
    first_name: 'Test',
    last_name: 'Coordinator',
    role: 'COORDINATOR',
    department: 'Computer Science',
    year: '2023',
    bio: 'Test bio',
    image: '',
    skills: [{ name: 'Project Management' }],
    github_link: '',
    linkedin_link: ''
  };

  const mockAssociate1: User = {
    id: '3',
    email: 'associate1@iiti.ac.in',
    first_name: 'Associate',
    last_name: 'One',
    role: 'ASSOCIATE',
    department: 'Electronics',
    year: '2024',
    bio: 'Test bio',
    image: 'https://example.com/associate1.jpg',
    skills: [{ name: 'React' }],
    github_link: '',
    linkedin_link: ''
  };

  const mockAssociate2: User = {
    id: '4',
    email: 'associate2@iiti.ac.in',
    first_name: 'Associate',
    last_name: 'Two',
    role: 'ASSOCIATE',
    department: 'Computer Science',
    year: '2025',
    bio: 'Test bio',
    image: '',
    skills: [{ name: 'Python' }],
    github_link: '',
    linkedin_link: ''
  };

  const mockAssociate3: User = {
    id: '5',
    email: 'associate3@iiti.ac.in',
    first_name: 'Associate',
    last_name: 'Three',
    role: 'ASSOCIATE',
    department: 'Mechanical',
    year: '2023',
    bio: 'Test bio',
    image: '',
    skills: [{ name: 'Java' }],
    github_link: '',
    linkedin_link: ''
  };

  const mockAllUsers = [mockPresident, mockCoordinator, mockAssociate1, mockAssociate2, mockAssociate3];

  const mockAddToast = vi.fn();
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockPresident,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      isLoading: false
    });

    mockUseToast.mockReturnValue({
      toasts: [],
      addToast: mockAddToast,
      removeToast: mockRemoveToast,
      clearAllToasts: vi.fn()
    });

    // Default successful API responses
    mockGetAvailableContributors.mockResolvedValue({
      data: {
        available_contributors: [mockCoordinator, mockAssociate1, mockAssociate2, mockAssociate3],
        count: 4
      }
    });

    mockCreateProject.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        tech_stack: 'React, Django',
        github_link: 'https://github.com/test/project',
        deployment_link: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        team_members_details: [mockPresident]
      }
    });

    mockGetProject.mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        tech_stack: 'React, Django',
        github_link: 'https://github.com/test/project',
        deployment_link: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        team_members_details: [mockPresident]
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Creation with Self-Assignment Flow', () => {
    it('should complete project creation with self-assignment enabled by default', async () => {
      const user = userEvent.setup();
      const onProjectCreated = vi.fn();

      // Mock project creation with self-assignment
      mockCreateProject.mockResolvedValueOnce({
        data: {
          id: 1,
          name: 'Integration Test Project',
          description: 'Project for testing integration flow',
          tech_stack: 'Django, React, PostgreSQL',
          github_link: 'https://github.com/test/integration-project',
          deployment_link: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          team_members_details: [mockPresident] // Creator added as contributor
        }
      });

      render(
        <AddProjectModal 
          isOpen={true} 
          onClose={vi.fn()} 
          onProjectCreated={onProjectCreated}
        />
      );

      // Fill in project details
      await user.type(screen.getByLabelText(/project name/i), 'Integration Test Project');
      await user.type(screen.getByLabelText(/description/i), 'Project for testing integration flow');
      await user.type(screen.getByLabelText(/tech stack/i), 'Django, React, PostgreSQL');
      await user.type(screen.getByLabelText(/github link/i), 'https://github.com/test/integration-project');

      // Verify "Add myself as contributor" is checked by default
      const addSelfCheckbox = screen.getByLabelText(/add myself as contributor/i);
      expect(addSelfCheckbox).toBeChecked();

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create project/i }));

      // Verify API call was made with correct data
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Integration Test Project',
            description: 'Project for testing integration flow',
            tech_stack: 'Django, React, PostgreSQL',
            github_link: 'https://github.com/test/integration-project',
            add_self_as_contributor: true
          })
        );
      });

      // Verify success callback was called
      await waitFor(() => {
        expect(onProjectCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            team_members_details: [mockPresident]
          })
        );
      });

      // Verify success toast
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Project Created Successfully',
        message: 'Integration Test Project has been created and you have been added as a contributor.',
        duration: 5000
      });
    });

    it('should complete project creation without self-assignment when unchecked', async () => {
      const user = userEvent.setup();
      const onProjectCreated = vi.fn();

      // Mock project creation without self-assignment
      mockCreateProject.mockResolvedValueOnce({
        data: {
          id: 2,
          name: 'No Contributors Project',
          description: 'Project created without initial contributors',
          tech_stack: 'Python, FastAPI',
          github_link: 'https://github.com/test/no-contributors',
          deployment_link: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          team_members_details: [] // No contributors
        }
      });

      render(
        <AddProjectModal 
          isOpen={true} 
          onClose={vi.fn()} 
          onProjectCreated={onProjectCreated}
        />
      );

      // Fill in project details
      await user.type(screen.getByLabelText(/project name/i), 'No Contributors Project');
      await user.type(screen.getByLabelText(/description/i), 'Project created without initial contributors');
      await user.type(screen.getByLabelText(/tech stack/i), 'Python, FastAPI');
      await user.type(screen.getByLabelText(/github link/i), 'https://github.com/test/no-contributors');

      // Uncheck "Add myself as contributor"
      const addSelfCheckbox = screen.getByLabelText(/add myself as contributor/i);
      await user.click(addSelfCheckbox);
      expect(addSelfCheckbox).not.toBeChecked();

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create project/i }));

      // Verify API call was made with correct data
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            add_self_as_contributor: false
          })
        );
      });

      // Verify project was created without contributors
      await waitFor(() => {
        expect(onProjectCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 2,
            team_members_details: []
          })
        );
      });
    });
  });

  describe('Complete Contributor Add/Remove Workflow', () => {
    const defaultProps = {
      projectId: '1',
      currentContributors: [mockPresident],
      onContributorsUpdate: vi.fn(),
      canManage: true
    };

    it('should complete full contributor management workflow', async () => {
      const user = userEvent.setup();
      const onContributorsUpdate = vi.fn();

      // Mock successful API responses
      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        const updatedContributors = [...currentContributors, ...usersToAdd];
        onUpdate(updatedContributors);
      });

      mockRemoveContributorsOptimistic.mockImplementation(async (projectId, userIds, currentContributors, onUpdate, onError) => {
        const updatedContributors = currentContributors.filter(c => !userIds.includes(parseInt(c.id)));
        onUpdate(updatedContributors);
      });

      render(
        <ContributorManagement 
          {...defaultProps} 
          onContributorsUpdate={onContributorsUpdate}
        />
      );

      // Step 1: Open add contributors interface
      await user.click(screen.getByText('Add Contributors'));

      // Wait for available contributors to load
      await waitFor(() => {
        expect(mockGetAvailableContributors).toHaveBeenCalledWith('1');
      });

      // Step 2: Select multiple contributors
      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
        expect(screen.getByText('Associate One')).toBeInTheDocument();
      });

      // Select contributors (mock the ContributorSelector behavior)
      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      const associate1Checkbox = screen.getByLabelText(/associate one/i);
      
      await user.click(coordinatorCheckbox);
      await user.click(associate1Checkbox);

      // Step 3: Add selected contributors
      await user.click(screen.getByText('Add 2 Contributors'));

      // Verify API call
      await waitFor(() => {
        expect(mockAddContributorsOptimistic).toHaveBeenCalledWith(
          '1',
          [2, 3],
          [mockCoordinator, mockAssociate1],
          [mockPresident],
          expect.any(Function),
          expect.any(Function)
        );
      });

      // Verify UI update callback
      await waitFor(() => {
        expect(onContributorsUpdate).toHaveBeenCalledWith([
          mockPresident,
          mockCoordinator,
          mockAssociate1
        ]);
      });

      // Verify success toast
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Contributors Added Successfully',
        message: 'Added 2 contributors: Test Coordinator, Associate One',
        duration: 5000
      });

      // Step 4: Remove a contributor
      const updatedContributors = [mockPresident, mockCoordinator, mockAssociate1];
      render(
        <ContributorManagement 
          {...defaultProps} 
          currentContributors={updatedContributors}
          onContributorsUpdate={onContributorsUpdate}
        />
      );

      // Find and click remove button for Associate One
      const removeButtons = screen.getAllByTitle('Remove contributor');
      const associate1RemoveButton = removeButtons.find(button => {
        const contributorCard = button.closest('[data-testid*="contributor-card"]');
        return contributorCard && within(contributorCard).queryByText('Associate One');
      });

      if (associate1RemoveButton) {
        await user.click(associate1RemoveButton);
      }

      // Confirm removal in dialog
      await user.click(screen.getByText('Remove'));

      // Verify removal API call
      await waitFor(() => {
        expect(mockRemoveContributorsOptimistic).toHaveBeenCalledWith(
          '1',
          [3],
          updatedContributors,
          expect.any(Function),
          expect.any(Function)
        );
      });

      // Verify UI update after removal
      await waitFor(() => {
        expect(onContributorsUpdate).toHaveBeenCalledWith([
          mockPresident,
          mockCoordinator
        ]);
      });

      // Verify removal success toast
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Contributor Removed',
        message: 'Successfully removed Associate One from the project',
        duration: 4000
      });
    });

    it('should handle bulk contributor operations', async () => {
      const user = userEvent.setup();
      const onContributorsUpdate = vi.fn();

      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        const updatedContributors = [...currentContributors, ...usersToAdd];
        onUpdate(updatedContributors);
      });

      render(
        <ContributorManagement 
          {...defaultProps} 
          onContributorsUpdate={onContributorsUpdate}
        />
      );

      // Open add contributors interface
      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      // Select all available contributors
      const allCheckboxes = screen.getAllByRole('checkbox');
      for (const checkbox of allCheckboxes) {
        if (!checkbox.checked) {
          await user.click(checkbox);
        }
      }

      // Add all selected contributors
      await user.click(screen.getByText(/Add \d+ Contributors/));

      // Verify bulk addition
      await waitFor(() => {
        expect(mockAddContributorsOptimistic).toHaveBeenCalledWith(
          '1',
          [2, 3, 4, 5],
          [mockCoordinator, mockAssociate1, mockAssociate2, mockAssociate3],
          [mockPresident],
          expect.any(Function),
          expect.any(Function)
        );
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Contributors Added Successfully',
        message: 'Added 4 contributors: Test Coordinator, Associate One, Associate Two, Associate Three',
        duration: 5000
      });
    });
  });

  describe('Permission Validation Across Full Flow', () => {
    it('should validate permissions for different user roles', async () => {
      // Test as project creator (associate)
      const associateCreator = { ...mockAssociate1 };
      mockUseAuth.mockReturnValue({
        user: associateCreator,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        setUser: vi.fn(),
        isLoading: false
      });

      const props = {
        projectId: '1',
        currentContributors: [associateCreator],
        onContributorsUpdate: vi.fn(),
        canManage: true // Creator can manage
      };

      render(<ContributorManagement {...props} />);

      // Should show management controls for creator
      expect(screen.getByText('Add Contributors')).toBeInTheDocument();
      expect(screen.getByTitle('Remove contributor')).toBeInTheDocument();

      // Test as non-creator associate
      const nonCreatorAssociate = { ...mockAssociate2 };
      mockUseAuth.mockReturnValue({
        user: nonCreatorAssociate,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        setUser: vi.fn(),
        isLoading: false
      });

      const restrictedProps = {
        ...props,
        canManage: false // Non-creator cannot manage
      };

      render(<ContributorManagement {...restrictedProps} />);

      // Should not show management controls for non-creator
      expect(screen.queryByText('Add Contributors')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Remove contributor')).not.toBeInTheDocument();
    });

    it('should handle permission errors gracefully', async () => {
      const user = userEvent.setup();
      const onContributorsUpdate = vi.fn();

      // Mock permission error
      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        onError({
          name: 'ContributorAPIError',
          message: 'You do not have permission to manage contributors for this project',
          statusCode: 403
        } as any);
      });

      const props = {
        projectId: '1',
        currentContributors: [mockPresident],
        onContributorsUpdate,
        canManage: true
      };

      render(<ContributorManagement {...props} />);

      // Try to add contributors
      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      await user.click(coordinatorCheckbox);
      await user.click(screen.getByText('Add 1 Contributor'));

      // Verify error handling
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Failed to Add Contributors',
          message: 'You do not have permission to manage contributors for this project',
          duration: 6000
        });
      });

      // Verify UI shows error state
      expect(screen.getByText('You do not have permission to manage contributors for this project')).toBeInTheDocument();
    });
  });

  describe('Error Scenarios and Recovery', () => {
    const defaultProps = {
      projectId: '1',
      currentContributors: [mockPresident],
      onContributorsUpdate: vi.fn(),
      canManage: true
    };

    it('should handle network errors during contributor operations', async () => {
      const user = userEvent.setup();

      // Mock network error
      mockGetAvailableContributors.mockRejectedValueOnce({
        response: { 
          status: 500,
          data: { message: 'Internal server error' } 
        }
      });

      render(<ContributorManagement {...defaultProps} />);

      await user.click(screen.getByText('Add Contributors'));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch available contributors')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Failed to Load Contributors',
        message: 'Failed to fetch available contributors',
        duration: 6000
      });

      // Test retry functionality
      mockGetAvailableContributors.mockResolvedValueOnce({
        data: {
          available_contributors: [mockCoordinator],
          count: 1
        }
      });

      await user.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(mockGetAvailableContributors).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });
    });

    it('should handle API validation errors', async () => {
      const user = userEvent.setup();

      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        onError({
          name: 'ContributorAPIError',
          message: 'Invalid user IDs provided',
          statusCode: 400,
          details: { user_ids: ['Invalid user ID: 999'] }
        } as any);
      });

      render(<ContributorManagement {...defaultProps} />);

      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      await user.click(coordinatorCheckbox);
      await user.click(screen.getByText('Add 1 Contributor'));

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Failed to Add Contributors',
          message: 'Invalid user IDs provided',
          duration: 6000
        });
      });
    });

    it('should handle optimistic update rollback on failure', async () => {
      const user = userEvent.setup();
      const onContributorsUpdate = vi.fn();

      // Mock optimistic update that fails and rolls back
      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        // First apply optimistic update
        const optimisticContributors = [...currentContributors, ...usersToAdd];
        onUpdate(optimisticContributors);
        
        // Then simulate failure and rollback
        setTimeout(() => {
          onUpdate(currentContributors); // Rollback
          onError({
            name: 'ContributorAPIError',
            message: 'Network timeout',
            statusCode: 408
          } as any);
        }, 100);
      });

      render(
        <ContributorManagement 
          {...defaultProps} 
          onContributorsUpdate={onContributorsUpdate}
        />
      );

      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      await user.click(coordinatorCheckbox);
      await user.click(screen.getByText('Add 1 Contributor'));

      // Verify optimistic update was applied
      await waitFor(() => {
        expect(onContributorsUpdate).toHaveBeenCalledWith([
          mockPresident,
          mockCoordinator
        ]);
      });

      // Verify rollback occurred
      await waitFor(() => {
        expect(onContributorsUpdate).toHaveBeenCalledWith([
          mockPresident
        ]);
      }, { timeout: 200 });

      // Verify error was shown
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Failed to Add Contributors',
          message: 'Network timeout',
          duration: 6000
        });
      });
    });
  });

  describe('UI Updates After Contributor Changes', () => {
    it('should update UI correctly after successful contributor operations', async () => {
      const user = userEvent.setup();
      const onContributorsUpdate = vi.fn();

      mockAddContributorsOptimistic.mockImplementation(async (projectId, userIds, usersToAdd, currentContributors, onUpdate, onError) => {
        const updatedContributors = [...currentContributors, ...usersToAdd];
        onUpdate(updatedContributors);
      });

      const { rerender } = render(
        <ContributorManagement 
          projectId="1"
          currentContributors={[mockPresident]}
          onContributorsUpdate={onContributorsUpdate}
          canManage={true}
        />
      );

      // Initial state
      expect(screen.getByText('Contributors (1)')).toBeInTheDocument();
      expect(screen.getByText('Test President')).toBeInTheDocument();

      // Add contributor
      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      await user.click(coordinatorCheckbox);
      await user.click(screen.getByText('Add 1 Contributor'));

      // Verify callback was called with updated contributors
      await waitFor(() => {
        expect(onContributorsUpdate).toHaveBeenCalledWith([
          mockPresident,
          mockCoordinator
        ]);
      });

      // Simulate parent component updating props
      rerender(
        <ContributorManagement 
          projectId="1"
          currentContributors={[mockPresident, mockCoordinator]}
          onContributorsUpdate={onContributorsUpdate}
          canManage={true}
        />
      );

      // Verify UI reflects the change
      expect(screen.getByText('Contributors (2)')).toBeInTheDocument();
      expect(screen.getByText('Test President')).toBeInTheDocument();
      expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
    });

    it('should show correct contributor count and details', async () => {
      const contributors = [mockPresident, mockCoordinator, mockAssociate1];

      render(
        <ContributorManagement 
          projectId="1"
          currentContributors={contributors}
          onContributorsUpdate={vi.fn()}
          canManage={true}
        />
      );

      // Verify count
      expect(screen.getByText('Contributors (3)')).toBeInTheDocument();

      // Verify all contributors are displayed
      expect(screen.getByText('Test President')).toBeInTheDocument();
      expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      expect(screen.getByText('Associate One')).toBeInTheDocument();

      // Verify email addresses
      expect(screen.getByText('president@iiti.ac.in')).toBeInTheDocument();
      expect(screen.getByText('coordinator@iiti.ac.in')).toBeInTheDocument();
      expect(screen.getByText('associate1@iiti.ac.in')).toBeInTheDocument();

      // Verify roles
      expect(screen.getByText('PRESIDENT')).toBeInTheDocument();
      expect(screen.getByText('COORDINATOR')).toBeInTheDocument();
      expect(screen.getByText('ASSOCIATE')).toBeInTheDocument();
    });

    it('should handle empty contributor list correctly', () => {
      render(
        <ContributorManagement 
          projectId="1"
          currentContributors={[]}
          onContributorsUpdate={vi.fn()}
          canManage={true}
        />
      );

      expect(screen.getByText('No contributors yet')).toBeInTheDocument();
      expect(screen.getByText('Add team members to start collaborating on this project')).toBeInTheDocument();
      expect(screen.getByText('Add Contributors')).toBeInTheDocument();
    });
  });

  describe('Loading States and User Feedback', () => {
    it('should show appropriate loading states during operations', async () => {
      const user = userEvent.setup();

      // Mock delayed API response
      mockGetAvailableContributors.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: {
              available_contributors: [mockCoordinator],
              count: 1
            }
          }), 100)
        )
      );

      render(
        <ContributorManagement 
          projectId="1"
          currentContributors={[mockPresident]}
          onContributorsUpdate={vi.fn()}
          canManage={true}
        />
      );

      await user.click(screen.getByText('Add Contributors'));

      // Should show loading state
      expect(screen.getByText('Loading available contributors...')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading available contributors...')).not.toBeInTheDocument();
    });

    it('should show loading state during contributor operations', async () => {
      const user = userEvent.setup();

      // Mock delayed operation
      mockAddContributorsOptimistic.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <ContributorManagement 
          projectId="1"
          currentContributors={[mockPresident]}
          onContributorsUpdate={vi.fn()}
          canManage={true}
        />
      );

      await user.click(screen.getByText('Add Contributors'));

      await waitFor(() => {
        expect(screen.getByText('Test Coordinator')).toBeInTheDocument();
      });

      const coordinatorCheckbox = screen.getByLabelText(/test coordinator/i);
      await user.click(coordinatorCheckbox);
      
      const addButton = screen.getByText('Add 1 Contributor');
      await user.click(addButton);

      // Should show loading state
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });
  });
});