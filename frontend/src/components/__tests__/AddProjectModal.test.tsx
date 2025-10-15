import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddProjectModal from '../AddProjectModal';
import { AuthProvider } from '../../contexts/AuthContext';
import { User } from '../../services/authService';
import * as api from '../../services/api';
import { AxiosResponse } from 'axios';

// Mock the API
vi.mock('../../services/api', () => ({
  createProject: vi.fn()
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

const mockCurrentUser: User = {
  id: '1',
  email: 'current@example.com',
  first_name: 'Current',
  last_name: 'User',
  role: 'President',
  department: 'Computer Science',
  year: '2024',
  bio: 'Current user bio',
  image: 'https://example.com/current.jpg',
  skills: [{ name: 'React' }],
  github_link: 'https://github.com/current',
  linkedin_link: 'https://linkedin.com/in/current'
};

const mockAllUsers: User[] = [
  {
    id: '2',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'Domain Head',
    department: 'Computer Science',
    year: '2023',
    bio: 'John bio',
    image: 'https://example.com/john.jpg',
    skills: [{ name: 'JavaScript' }],
    github_link: 'https://github.com/john',
    linkedin_link: 'https://linkedin.com/in/john'
  },
  {
    id: '3',
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'Coordinator',
    department: 'Electrical Engineering',
    year: '2024',
    bio: 'Jane bio',
    image: '',
    skills: [{ name: 'Python' }],
    github_link: 'https://github.com/jane',
    linkedin_link: 'https://linkedin.com/in/jane'
  }
];

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('AddProjectModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onProjectAdded: vi.fn(),
    allUsers: mockAllUsers
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  const renderComponent = (props = {}) => {
    return render(
      <AuthProvider>
        <AddProjectModal {...defaultProps} {...props} />
      </AuthProvider>
    );
  };

  describe('Modal Rendering', () => {
    it('should render when isOpen is true', () => {
      renderComponent();
      
      expect(screen.getByText('Add Project')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderComponent({ isOpen: false });
      
      expect(screen.queryByText('Add Project')).not.toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderComponent();
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/github link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live demo link/i)).toBeInTheDocument();
      expect(screen.getByText('Contributors')).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      renderComponent();
      
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(2); // Title and Description are required
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('should show error when description is empty', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Project');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Trigger validation error
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      
      // Start typing in title field
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'T');
      
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });

    it('should allow form submission with valid required fields', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(mockCreateProject).toHaveBeenCalled();
    });
  });

  describe('Contributor Management Integration', () => {
    it('should render ContributorSelector component', () => {
      renderComponent();
      
      expect(screen.getByLabelText('Add myself as contributor')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search contributors/i)).toBeInTheDocument();
    });

    it('should have "Add myself as contributor" checked by default', () => {
      renderComponent();
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).toBeChecked();
    });

    it('should allow toggling "Add myself as contributor"', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).toBeChecked();
      
      await user.click(addSelfCheckbox);
      expect(addSelfCheckbox).not.toBeChecked();
    });

    it('should allow selecting contributors from the list', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      await user.click(johnCheckbox);
      
      expect(johnCheckbox).toBeChecked();
      expect(screen.getByText(/contributors selected/)).toBeInTheDocument();
    });

    it('should show contributor count including self when add self is enabled', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      await user.click(johnCheckbox);
      
      // Should show 2 contributors (John + self)
      expect(screen.getByText('2 contributors selected')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit project with add_self_as_contributor flag', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(mockCreateProject).toHaveBeenCalledWith({
        title: 'Test Project',
        description: 'Test Description',
        github_link: null,
        live_demo_link: null,
        contributors: [],
        add_self_as_contributor: true
      });
    });

    it('should submit project without add_self_as_contributor when unchecked', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      await user.click(addSelfCheckbox); // Uncheck
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(mockCreateProject).toHaveBeenCalledWith({
        title: 'Test Project',
        description: 'Test Description',
        github_link: null,
        live_demo_link: null,
        contributors: [],
        add_self_as_contributor: false
      });
    });

    it('should submit project with selected contributors', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const johnCheckbox = screen.getByLabelText('John Doe');
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      await user.click(johnCheckbox);
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(mockCreateProject).toHaveBeenCalledWith({
        title: 'Test Project',
        description: 'Test Description',
        github_link: null,
        live_demo_link: null,
        contributors: [2], // John's ID
        add_self_as_contributor: true
      });
    });

    it('should submit project with optional fields when provided', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const githubInput = screen.getByLabelText(/github link/i);
      const demoInput = screen.getByLabelText(/live demo link/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      await user.type(githubInput, 'https://github.com/test/repo');
      await user.type(demoInput, 'https://demo.example.com');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      expect(mockCreateProject).toHaveBeenCalledWith({
        title: 'Test Project',
        description: 'Test Description',
        github_link: 'https://github.com/test/repo',
        live_demo_link: 'https://demo.example.com',
        contributors: [],
        add_self_as_contributor: true
      });
    });

    it('should call onProjectAdded and onClose after successful submission', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      const mockOnProjectAdded = vi.fn();
      const mockOnClose = vi.fn();
      const projectData = { id: 1, title: 'Test Project' };
      
      mockCreateProject.mockResolvedValue(createMockAxiosResponse(projectData));
      
      renderComponent({ onProjectAdded: mockOnProjectAdded, onClose: mockOnClose });
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnProjectAdded).toHaveBeenCalledWith(projectData);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockResolvedValue(createMockAxiosResponse({ id: 1, title: 'Test Project' }));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const githubInput = screen.getByLabelText(/github link/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      await user.type(githubInput, 'https://github.com/test/repo');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
        expect(githubInput).toHaveValue('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      mockCreateProject.mockRejectedValue(new Error('API Error'));
      
      renderComponent();
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create project. Please try again.')).toBeInTheDocument();
      });
    });

    it('should not close modal when API call fails', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.mocked(api.createProject);
      const mockOnClose = vi.fn();
      mockCreateProject.mockRejectedValue(new Error('API Error'));
      
      renderComponent({ onClose: mockOnClose });
      
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      
      await user.type(titleInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create project. Please try again.')).toBeInTheDocument();
      });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      renderComponent({ onClose: mockOnClose });
      
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      renderComponent({ onClose: mockOnClose });
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      renderComponent({ onClose: mockOnClose });
      
      // Find the backdrop element by its class
      const backdrop = document.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      
      await user.click(backdrop as HTMLElement);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal content', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      renderComponent({ onClose: mockOnClose });
      
      const modalContent = screen.getByText('Add Project');
      await user.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderComponent();
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/github link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live demo link/i)).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      renderComponent();
      
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should show validation errors with proper association', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const submitButton = screen.getByText('Create Project');
      await user.click(submitButton);
      
      const titleInput = screen.getByLabelText(/title/i);
      const titleError = screen.getByText('Title is required');
      
      expect(titleInput).toHaveClass('border-red-500');
      expect(titleError).toBeInTheDocument();
    });
  });
});