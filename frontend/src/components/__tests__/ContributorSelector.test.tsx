import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContributorSelector from '../ContributorSelector';
import { AuthProvider } from '../../contexts/AuthContext';
import { User } from '../../services/authService';

// Mock the auth context
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

const mockAvailableUsers: User[] = [
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
  },
  {
    id: '4',
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    role: 'Associate',
    department: 'Computer Science',
    year: '2025',
    bio: 'Bob bio',
    image: 'https://example.com/bob.jpg',
    skills: [{ name: 'TypeScript' }],
    github_link: 'https://github.com/bob',
    linkedin_link: 'https://linkedin.com/in/bob'
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

describe('ContributorSelector', () => {
  const defaultProps = {
    selectedContributors: [],
    availableUsers: mockAvailableUsers,
    onContributorChange: vi.fn(),
    onAddSelfChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <AuthProvider>
        <ContributorSelector {...defaultProps} {...props} />
      </AuthProvider>
    );
  };

  describe('Add Self Option', () => {
    it('should show "Add myself as contributor" checkbox by default', () => {
      renderComponent();
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).toBeInTheDocument();
      expect(addSelfCheckbox).toBeChecked();
    });

    it('should not show "Add myself as contributor" when showAddSelfOption is false', () => {
      renderComponent({ showAddSelfOption: false });
      
      const addSelfCheckbox = screen.queryByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).not.toBeInTheDocument();
    });

    it('should call onAddSelfChange when checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onAddSelfChange = vi.fn();
      renderComponent({ onAddSelfChange });
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      await user.click(addSelfCheckbox);
      
      expect(onAddSelfChange).toHaveBeenCalledWith(false);
    });

    it('should display current user information in add self section', () => {
      renderComponent();
      
      expect(screen.getByText('Current User')).toBeInTheDocument();
      expect(screen.getByAltText('Current User')).toBeInTheDocument();
    });

    it('should respect addSelfAsContributor prop', () => {
      renderComponent({ addSelfAsContributor: false });
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).not.toBeChecked();
    });
  });

  describe('User Search and Filtering', () => {
    it('should display search input', () => {
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter users by name', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'john doe');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('should filter users by email', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'jane@example.com');
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should filter users by role', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'Coordinator');
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should filter users by department', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'Electrical');
      
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should show "no users found" message when search has no results', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No users found matching your search.')).toBeInTheDocument();
    });

    it('should show all users when search is cleared', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/search contributors/i);
      await user.type(searchInput, 'John');
      await user.clear(searchInput);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('Contributor Selection', () => {
    it('should display all available users', () => {
      renderComponent();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should show user details including email, role, and department', () => {
      renderComponent();
      
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Domain Head')).toBeInTheDocument();
      expect(screen.getAllByText('Computer Science')).toHaveLength(2); // John and Bob both have Computer Science
    });

    it('should handle user selection', async () => {
      const user = userEvent.setup();
      const onContributorChange = vi.fn();
      renderComponent({ onContributorChange });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      await user.click(johnCheckbox);
      
      expect(onContributorChange).toHaveBeenCalledWith([mockAvailableUsers[0]]);
    });

    it('should handle user deselection', async () => {
      const user = userEvent.setup();
      const onContributorChange = vi.fn();
      renderComponent({ 
        selectedContributors: [mockAvailableUsers[0]], 
        onContributorChange 
      });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      await user.click(johnCheckbox);
      
      expect(onContributorChange).toHaveBeenCalledWith([]);
    });

    it('should show selected state for contributors', () => {
      renderComponent({ selectedContributors: [mockAvailableUsers[0]] });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      expect(johnCheckbox).toBeChecked();
    });

    it('should display user avatars when image is available', () => {
      renderComponent();
      
      const johnAvatar = screen.getByAltText('John Doe');
      expect(johnAvatar).toBeInTheDocument();
      expect(johnAvatar).toHaveAttribute('src', 'https://example.com/john.jpg');
    });

    it('should display initials when no image is available', () => {
      renderComponent();
      
      // Jane Smith has no image, so should show initials
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should handle clicking on user row to toggle selection', async () => {
      const user = userEvent.setup();
      const onContributorChange = vi.fn();
      renderComponent({ onContributorChange });
      
      // Click on the user row (not the checkbox)
      const userRow = screen.getByText('John Doe').closest('div');
      await user.click(userRow!);
      
      expect(onContributorChange).toHaveBeenCalledWith([mockAvailableUsers[0]]);
    });
  });

  describe('Visual Indicators', () => {
    it('should show selected contributors count', () => {
      renderComponent({ 
        selectedContributors: [mockAvailableUsers[0], mockAvailableUsers[1]],
        addSelfAsContributor: true
      });
      
      expect(screen.getByText('3 contributors selected')).toBeInTheDocument();
    });

    it('should show singular form for one contributor', () => {
      renderComponent({ 
        selectedContributors: [mockAvailableUsers[0]],
        addSelfAsContributor: false
      });
      
      expect(screen.getByText('1 contributor selected')).toBeInTheDocument();
    });

    it('should display contributor avatars in summary', () => {
      renderComponent({ 
        selectedContributors: [mockAvailableUsers[0], mockAvailableUsers[1]] 
      });
      
      // Should show avatars for selected contributors
      const summarySection = screen.getByText(/contributors selected/).closest('div');
      expect(summarySection).toBeInTheDocument();
    });

    it('should show overflow indicator for many contributors', () => {
      renderComponent({ 
        selectedContributors: mockAvailableUsers,
        addSelfAsContributor: true
      });
      
      // Should show +1 indicator since we have 4 total (3 selected + 1 self)
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should highlight selected users with visual indicators', () => {
      renderComponent({ selectedContributors: [mockAvailableUsers[0]] });
      
      // Check for the checkmark icon
      const checkIcon = screen.getByLabelText('John Doe');
      expect(checkIcon).toBeChecked();
    });

    it('should show "You" indicator for current user', () => {
      const usersWithCurrentUser = [...mockAvailableUsers, mockCurrentUser];
      renderComponent({ availableUsers: usersWithCurrentUser });
      
      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user list', () => {
      renderComponent({ availableUsers: [] });
      
      expect(screen.getByText('No users available.')).toBeInTheDocument();
    });

    it('should handle missing onAddSelfChange prop', () => {
      renderComponent({ onAddSelfChange: undefined });
      
      // Should not show the add self option when onAddSelfChange is not provided
      const addSelfCheckbox = screen.queryByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderComponent({ className: 'custom-class' });
      
      expect(container.firstChild?.firstChild).toHaveClass('custom-class');
    });

    it('should apply custom maxHeight', () => {
      renderComponent({ maxHeight: 'max-h-96' });
      
      const contributorsList = screen.getByText('John Doe').closest('.max-h-96');
      expect(contributorsList).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for checkboxes', () => {
      renderComponent();
      
      const addSelfCheckbox = screen.getByLabelText('Add myself as contributor');
      expect(addSelfCheckbox).toBeInTheDocument();
      
      // User checkboxes should be accessible by their names
      const johnCheckbox = screen.getByLabelText('John Doe');
      expect(johnCheckbox).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      renderComponent();
      
      const johnAvatar = screen.getByAltText('John Doe');
      expect(johnAvatar).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onContributorChange = vi.fn();
      renderComponent({ onContributorChange });
      
      const johnCheckbox = screen.getByLabelText('John Doe');
      johnCheckbox.focus();
      await user.keyboard(' ');
      
      expect(onContributorChange).toHaveBeenCalledWith([mockAvailableUsers[0]]);
    });
  });
});