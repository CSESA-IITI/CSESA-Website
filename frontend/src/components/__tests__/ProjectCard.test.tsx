// import { render, screen, fireEvent } from '@testing-library/react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import ProjectCard from '../ProjectCard';

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

// const mockProjectWithManyContributors = {
//   ...mockProject,
//   team_members_details: [
//     ...mockProject.team_members_details,
//     {
//       id: 3,
//       email: 'alice@example.com',
//       first_name: 'Alice',
//       last_name: 'Johnson',
//       role: 'COORDINATOR',
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
//       id: 4,
//       email: 'bob@example.com',
//       first_name: 'Bob',
//       last_name: 'Wilson',
//       role: 'ASSOCIATE',
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

// describe('ProjectCard', () => {
//   const mockOnClick = vi.fn();

//   beforeEach(() => {
//     mockOnClick.mockClear();
//   });

//   it('renders project information correctly', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('Test Project')).toBeInTheDocument();
//     expect(screen.getByText('This is a test project description')).toBeInTheDocument();
//   });

//   it('displays technology stack correctly', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('React')).toBeInTheDocument();
//     expect(screen.getByText('TypeScript')).toBeInTheDocument();
//     expect(screen.getByText('Node.js')).toBeInTheDocument();
//   });

//   it('shows contributor count and avatars', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('2 contributors')).toBeInTheDocument();
    
//     // Check for contributor initials
//     expect(screen.getByText('JD')).toBeInTheDocument();
//     expect(screen.getByText('JS')).toBeInTheDocument();
//   });

//   it('displays "No contributors yet" when project has no team members', () => {
//     render(<ProjectCard project={mockProjectWithoutContributors} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('No contributors yet')).toBeInTheDocument();
//   });

//   it('shows +N indicator when there are more than 3 contributors', () => {
//     render(<ProjectCard project={mockProjectWithManyContributors} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('+1')).toBeInTheDocument();
//     expect(screen.getByText('4 contributors')).toBeInTheDocument();
//   });

//   it('shows +N indicator when there are more than 3 technologies', () => {
//     const projectWithManyTechs = {
//       ...mockProject,
//       tech_stack: 'React, TypeScript, Node.js, Express, MongoDB'
//     };
    
//     render(<ProjectCard project={projectWithManyTechs} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('+2')).toBeInTheDocument();
//   });

//   it('calls onClick when card is clicked', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     const card = screen.getByText('Test Project').closest('.group');
//     fireEvent.click(card!);
    
//     expect(mockOnClick).toHaveBeenCalledTimes(1);
//   });

//   it('calls onClick when View Details button is clicked', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     const viewDetailsButton = screen.getByText('View Details');
//     fireEvent.click(viewDetailsButton);
    
//     expect(mockOnClick).toHaveBeenCalledTimes(1);
//   });

//   it('handles empty tech stack gracefully', () => {
//     const projectWithoutTech = {
//       ...mockProject,
//       tech_stack: ''
//     };
    
//     render(<ProjectCard project={projectWithoutTech} onClick={mockOnClick} index={0} />);
    
//     // Should not crash and should still render the project
//     expect(screen.getByText('Test Project')).toBeInTheDocument();
//   });

//   it('displays contributor tooltips with full names', () => {
//     render(<ProjectCard project={mockProject} onClick={mockOnClick} index={0} />);
    
//     const johnAvatar = screen.getByText('JD');
//     expect(johnAvatar).toHaveAttribute('title', 'John Doe');
    
//     const janeAvatar = screen.getByText('JS');
//     expect(janeAvatar).toHaveAttribute('title', 'Jane Smith');
//   });

//   it('handles single contributor correctly', () => {
//     const projectWithOneContributor = {
//       ...mockProject,
//       team_members_details: [mockProject.team_members_details[0]]
//     };
    
//     render(<ProjectCard project={projectWithOneContributor} onClick={mockOnClick} index={0} />);
    
//     expect(screen.getByText('1 contributor')).toBeInTheDocument();
//   });
// });