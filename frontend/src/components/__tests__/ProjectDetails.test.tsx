// import { render, screen, fireEvent } from '@testing-library/react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import ProjectDetails from '../ProjectDetails';

// const mockProject = {
//   id: 1,
//   name: 'Test Project',
//   description: 'This is a test project description',
//   tech_stack: 'React, TypeScript, Node.js',
//   github_link: 'https://github.com/test/project',
//   deployment_link: 'https://test-project.com',
//   created_at: '2024-01-01T00:00:00Z',
//   updated_at: '2024-01-02T00:00:00Z',
//   team_members_details: [
//     {
//       id: 1,
//       email: 'john@example.com',
//       first_name: 'John',
//       last_name: 'Doe',
//       role: 'PRESIDENT',
//       department: 'Computer Science',
//       year: '2024',
//       bio: '',
//       image: null,
//       skills: [],
//       github_link: '',
//       linkedin_link: '',
//       is_onboarded: true
//     },
//     {
//       id: 2,
//       email: 'jane@example.com',
//       first_name: 'Jane',
//       last_name: 'Smith',
//       role: 'HEAD',
//       department: 'Computer Science',
//       year: '2024',
//       bio: '',
//       image: null,
//       skills: [],
//       github_link: '',
//       linkedin_link: '',
//       is_onboarded: true
//     }
//   ]
// };

// const mockProjectWithoutContributors = {
//   ...mockProject,
//   team_members_details: []
// };

// const mockProjectWithoutLinks = {
//   ...mockProject,
//   github_link: '',
//   deployment_link: null
// };

// describe('ProjectDetails', () => {
//   const mockOnClose = vi.fn();

//   beforeEach(() => {
//     mockOnClose.mockClear();
//   });

//   it('renders project information correctly', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     expect(screen.getByText('Test Project')).toBeInTheDocument();
//     expect(screen.getByText('This is a test project description')).toBeInTheDocument();
//   });

//   it('displays formatted dates correctly', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
//     expect(screen.getByText('January 2, 2024')).toBeInTheDocument();
//   });

//   it('displays technology stack correctly', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     expect(screen.getByText('Technologies Used')).toBeInTheDocument();
//     expect(screen.getByText('React')).toBeInTheDocument();
//     expect(screen.getByText('TypeScript')).toBeInTheDocument();
//     expect(screen.getByText('Node.js')).toBeInTheDocument();
//   });

//   it('displays contributors with correct information', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     expect(screen.getByText('Contributors (2)')).toBeInTheDocument();
//     expect(screen.getByText('John Doe')).toBeInTheDocument();
//     expect(screen.getByText('Jane Smith')).toBeInTheDocument();
//     expect(screen.getByText('president')).toBeInTheDocument();
//     expect(screen.getByText('head')).toBeInTheDocument();
//   });

//   it('displays "No contributors yet" message when project has no team members', () => {
//     render(<ProjectDetails project={mockProjectWithoutContributors} onClose={mockOnClose} />);
    
//     expect(screen.getByText('Contributors (0)')).toBeInTheDocument();
//     expect(screen.getByText('No contributors yet')).toBeInTheDocument();
//     expect(screen.getByText('This project is looking for contributors')).toBeInTheDocument();
//   });

//   it('displays action buttons when links are available', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     const githubLink = screen.getByText('View Code').closest('a');
//     const deploymentLink = screen.getByText('Live Demo').closest('a');
    
//     expect(githubLink).toHaveAttribute('href', 'https://github.com/test/project');
//     expect(deploymentLink).toHaveAttribute('href', 'https://test-project.com');
//     expect(githubLink).toHaveAttribute('target', '_blank');
//     expect(deploymentLink).toHaveAttribute('target', '_blank');
//   });

//   it('hides action buttons when links are not available', () => {
//     render(<ProjectDetails project={mockProjectWithoutLinks} onClose={mockOnClose} />);
    
//     expect(screen.queryByText('View Code')).not.toBeInTheDocument();
//     expect(screen.queryByText('Live Demo')).not.toBeInTheDocument();
//   });

//   it('calls onClose when close button is clicked', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     const closeButton = screen.getByText('×');
//     fireEvent.click(closeButton);
    
//     expect(mockOnClose).toHaveBeenCalledTimes(1);
//   });

//   it('calls onClose when backdrop is clicked', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     const backdrop = screen.getByText('Test Project').closest('.fixed');
//     fireEvent.click(backdrop!);
    
//     expect(mockOnClose).toHaveBeenCalledTimes(1);
//   });

//   it('does not call onClose when modal content is clicked', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     const modalContent = screen.getByText('Test Project').closest('.bg-gray-900');
//     fireEvent.click(modalContent!);
    
//     expect(mockOnClose).not.toHaveBeenCalled();
//   });

//   it('displays contributor initials correctly', () => {
//     render(<ProjectDetails project={mockProject} onClose={mockOnClose} />);
    
//     expect(screen.getByText('JD')).toBeInTheDocument();
//     expect(screen.getByText('JS')).toBeInTheDocument();
//   });

//   it('handles empty tech stack gracefully', () => {
//     const projectWithoutTech = {
//       ...mockProject,
//       tech_stack: ''
//     };
    
//     render(<ProjectDetails project={projectWithoutTech} onClose={mockOnClose} />);
    
//     // Should still render the Technologies Used section but with no tech items
//     expect(screen.getByText('Technologies Used')).toBeInTheDocument();
//     expect(screen.getByText('No technologies specified')).toBeInTheDocument();
//   });

//   it('handles contributors with different roles correctly', () => {
//     const projectWithVariousRoles = {
//       ...mockProject,
//       team_members_details: [
//         {
//           id: 1,
//           email: 'president@example.com',
//           first_name: 'President',
//           last_name: 'User',
//           role: 'PRESIDENT',
//           department: 'Computer Science',
//           year: '2024',
//           bio: '',
//           image: null,
//           skills: [],
//           github_link: '',
//           linkedin_link: '',
//           is_onboarded: true
//         },
//         {
//           id: 2,
//           email: 'head@example.com',
//           first_name: 'Head',
//           last_name: 'User',
//           role: 'HEAD',
//           department: 'Computer Science',
//           year: '2024',
//           bio: '',
//           image: null,
//           skills: [],
//           github_link: '',
//           linkedin_link: '',
//           is_onboarded: true
//         },
//         {
//           id: 3,
//           email: 'coordinator@example.com',
//           first_name: 'Coordinator',
//           last_name: 'User',
//           role: 'COORDINATOR',
//           department: 'Computer Science',
//           year: '2024',
//           bio: '',
//           image: null,
//           skills: [],
//           github_link: '',
//           linkedin_link: '',
//           is_onboarded: true
//         },
//         {
//           id: 4,
//           email: 'associate@example.com',
//           first_name: 'Associate',
//           last_name: 'User',
//           role: 'ASSOCIATE',
//           department: 'Computer Science',
//           year: '2024',
//           bio: '',
//           image: null,
//           skills: [],
//           github_link: '',
//           linkedin_link: '',
//           is_onboarded: true
//         }
//       ]
//     };
    
//     render(<ProjectDetails project={projectWithVariousRoles} onClose={mockOnClose} />);
    
//     expect(screen.getByText('president')).toBeInTheDocument();
//     expect(screen.getByText('head')).toBeInTheDocument();
//     expect(screen.getByText('coordinator')).toBeInTheDocument();
//     expect(screen.getByText('associate')).toBeInTheDocument();
//   });
// });