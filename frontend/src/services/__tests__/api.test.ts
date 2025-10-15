import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from '../../apiClient';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  addContributors,
  removeContributors,
  getAvailableContributors,
  addContributorsOptimistic,
  removeContributorsOptimistic,
  performOptimisticUpdate,
  ContributorAPIError
} from '../api';
import { User } from '../authService';

// Mock the apiClient
vi.mock('../../apiClient');
const mockApiClient = vi.mocked(apiClient);

describe('API Service', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'ASSOCIATE',
    department: 'Computer Science',
    year: '2024',
    bio: 'Test bio',
    image: '',
    skills: [{ name: 'JavaScript' }],
    github_link: '',
    linkedin_link: ''
  };

  const mockProject = {
    id: '1',
    name: 'Test Project',
    description: 'Test Description',
    team_members: [mockUser],
    created_by: mockUser,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Project Operations', () => {
    describe('getProjects', () => {
      it('should fetch projects successfully', async () => {
        const mockResponse = { data: [mockProject] };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await getProjects();

        expect(mockApiClient.get).toHaveBeenCalledWith('/projects/');
        expect(result).toEqual(mockResponse);
      });

      it('should handle API errors', async () => {
        const mockError = {
          response: {
            status: 500,
            data: { message: 'Server error' }
          }
        };
        mockApiClient.get.mockRejectedValue(mockError);

        await expect(getProjects()).rejects.toThrow(ContributorAPIError);
        await expect(getProjects()).rejects.toThrow('Server error');
      });
    });

    describe('getProject', () => {
      it('should fetch single project successfully', async () => {
        const mockResponse = { data: mockProject };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await getProject('1');

        expect(mockApiClient.get).toHaveBeenCalledWith('/projects/1/');
        expect(result).toEqual(mockResponse);
      });

      it('should handle not found errors', async () => {
        const mockError = {
          response: {
            status: 404,
            data: { message: 'Project not found' }
          }
        };
        mockApiClient.get.mockRejectedValue(mockError);

        await expect(getProject('999')).rejects.toThrow(ContributorAPIError);
        await expect(getProject('999')).rejects.toThrow('Project not found');
      });
    });

    describe('createProject', () => {
      it('should create project successfully', async () => {
        const projectData = {
          name: 'New Project',
          description: 'New Description',
          add_self_as_contributor: true
        };
        const mockResponse = { data: mockProject };
        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await createProject(projectData);

        expect(mockApiClient.post).toHaveBeenCalledWith('/projects/', projectData);
        expect(result).toEqual(mockResponse);
      });

      it('should handle validation errors', async () => {
        const mockError = {
          response: {
            status: 400,
            data: { message: 'Name is required' }
          }
        };
        mockApiClient.post.mockRejectedValue(mockError);

        await expect(createProject({})).rejects.toThrow(ContributorAPIError);
        await expect(createProject({})).rejects.toThrow('Name is required');
      });
    });

    describe('updateProject', () => {
      it('should update project successfully', async () => {
        const updateData = { name: 'Updated Project' };
        const mockResponse = { data: { ...mockProject, ...updateData } };
        mockApiClient.patch.mockResolvedValueOnce(mockResponse);

        const result = await updateProject('1', updateData);

        expect(mockApiClient.patch).toHaveBeenCalledWith('/projects/1/', updateData);
        expect(result).toEqual(mockResponse);
      });

      it('should handle permission errors', async () => {
        const mockError = {
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        };
        mockApiClient.patch.mockRejectedValue(mockError);

        await expect(updateProject('1', {})).rejects.toThrow(ContributorAPIError);
        await expect(updateProject('1', {})).rejects.toThrow('Permission denied');
      });
    });
  });

  describe('Contributor Management Operations', () => {
    describe('addContributors', () => {
      it('should add contributors successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Contributors added successfully',
            results: [
              {
                user_id: '2',
                user_name: 'New User',
                action: 'added' as const,
                success: true,
                message: 'User added successfully'
              }
            ],
            current_contributors: [mockUser, { ...mockUser, id: '2' }]
          }
        };
        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await addContributors('1', [2]);

        expect(mockApiClient.post).toHaveBeenCalledWith('/projects/1/contributors/', {
          user_ids: [2],
          action: 'add'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should validate project ID', async () => {
        await expect(addContributors('', [1])).rejects.toThrow(ContributorAPIError);
        await expect(addContributors('', [1])).rejects.toThrow('Project ID is required');
      });

      it('should validate user IDs', async () => {
        await expect(addContributors('1', [])).rejects.toThrow(ContributorAPIError);
        await expect(addContributors('1', [])).rejects.toThrow('At least one user ID is required');
      });

      it('should handle API errors', async () => {
        const mockError = {
          response: {
            status: 400,
            data: { message: 'User already a contributor' }
          }
        };
        mockApiClient.post.mockRejectedValue(mockError);

        await expect(addContributors('1', [1])).rejects.toThrow(ContributorAPIError);
        await expect(addContributors('1', [1])).rejects.toThrow('User already a contributor');
      });
    });

    describe('removeContributors', () => {
      it('should remove contributors successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Contributors removed successfully',
            results: [
              {
                user_id: '2',
                user_name: 'Removed User',
                action: 'removed' as const,
                success: true,
                message: 'User removed successfully'
              }
            ],
            current_contributors: [mockUser]
          }
        };
        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await removeContributors('1', [2]);

        expect(mockApiClient.post).toHaveBeenCalledWith('/projects/1/contributors/', {
          user_ids: [2],
          action: 'remove'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should validate project ID', async () => {
        await expect(removeContributors('', [1])).rejects.toThrow(ContributorAPIError);
        await expect(removeContributors('', [1])).rejects.toThrow('Project ID is required');
      });

      it('should validate user IDs', async () => {
        await expect(removeContributors('1', [])).rejects.toThrow(ContributorAPIError);
        await expect(removeContributors('1', [])).rejects.toThrow('At least one user ID is required');
      });

      it('should handle not found errors', async () => {
        const mockError = {
          response: {
            status: 404,
            data: { message: 'User not found in project' }
          }
        };
        mockApiClient.post.mockRejectedValue(mockError);

        await expect(removeContributors('1', [999])).rejects.toThrow(ContributorAPIError);
        await expect(removeContributors('1', [999])).rejects.toThrow('User not found in project');
      });
    });

    describe('getAvailableContributors', () => {
      it('should fetch available contributors successfully', async () => {
        const mockResponse = {
          data: {
            available_contributors: [{ ...mockUser, id: '2' }],
            count: 1
          }
        };
        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await getAvailableContributors('1');

        expect(mockApiClient.get).toHaveBeenCalledWith('/projects/1/available-contributors/');
        expect(result).toEqual(mockResponse);
      });

      it('should validate project ID', async () => {
        await expect(getAvailableContributors('')).rejects.toThrow(ContributorAPIError);
        await expect(getAvailableContributors('')).rejects.toThrow('Project ID is required');
      });

      it('should handle permission errors', async () => {
        const mockError = {
          response: {
            status: 403,
            data: { message: 'Permission denied' }
          }
        };
        mockApiClient.get.mockRejectedValue(mockError);

        await expect(getAvailableContributors('1')).rejects.toThrow(ContributorAPIError);
        await expect(getAvailableContributors('1')).rejects.toThrow('Permission denied');
      });
    });
  });

  describe('Optimistic Updates', () => {
    describe('performOptimisticUpdate', () => {
      it('should perform successful optimistic update', async () => {
        const mockOperation = vi.fn().mockResolvedValueOnce('success');
        const mockOnOptimisticUpdate = vi.fn();
        const mockOnSuccess = vi.fn();
        const mockOnError = vi.fn();
        const mockOnRollback = vi.fn();

        await performOptimisticUpdate({
          operation: mockOperation,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          onRollback: mockOnRollback
        });

        expect(mockOnOptimisticUpdate).toHaveBeenCalledTimes(1);
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledWith('success');
        expect(mockOnError).not.toHaveBeenCalled();
        expect(mockOnRollback).not.toHaveBeenCalled();
      });

      it('should rollback on operation failure', async () => {
        const mockError = new Error('Operation failed');
        const mockOperation = vi.fn().mockRejectedValueOnce(mockError);
        const mockOnOptimisticUpdate = vi.fn();
        const mockOnSuccess = vi.fn();
        const mockOnError = vi.fn();
        const mockOnRollback = vi.fn();

        await performOptimisticUpdate({
          operation: mockOperation,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          onRollback: mockOnRollback
        });

        expect(mockOnOptimisticUpdate).toHaveBeenCalledTimes(1);
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockOnRollback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledWith(expect.any(ContributorAPIError));
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('should handle ContributorAPIError correctly', async () => {
        const mockError = new ContributorAPIError('Custom error', 400);
        const mockOperation = vi.fn().mockRejectedValueOnce(mockError);
        const mockOnOptimisticUpdate = vi.fn();
        const mockOnSuccess = vi.fn();
        const mockOnError = vi.fn();
        const mockOnRollback = vi.fn();

        await performOptimisticUpdate({
          operation: mockOperation,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          onSuccess: mockOnSuccess,
          onError: mockOnError,
          onRollback: mockOnRollback
        });

        expect(mockOnError).toHaveBeenCalledWith(mockError);
      });
    });

    describe('addContributorsOptimistic', () => {
      it('should perform optimistic add successfully', async () => {
        const newUser = { ...mockUser, id: '2', first_name: 'New' };
        const currentContributors = [mockUser];
        const usersToAdd = [newUser];
        const mockOnUpdate = vi.fn();
        const mockOnError = vi.fn();

        const mockResponse = {
          data: {
            message: 'Success',
            results: [],
            current_contributors: [...currentContributors, newUser]
          }
        };
        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        await addContributorsOptimistic(
          '1',
          [2],
          usersToAdd,
          currentContributors,
          mockOnUpdate,
          mockOnError
        );

        // Should be called twice: once optimistically, once with server result
        expect(mockOnUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, [...currentContributors, newUser]);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, mockResponse.data.current_contributors);
        expect(mockOnError).not.toHaveBeenCalled();
      });

      it('should rollback on failure', async () => {
        const newUser = { ...mockUser, id: '2', first_name: 'New' };
        const currentContributors = [mockUser];
        const usersToAdd = [newUser];
        const mockOnUpdate = vi.fn();
        const mockOnError = vi.fn();

        const mockError = {
          response: {
            status: 400,
            data: { message: 'Add failed' }
          }
        };
        mockApiClient.post.mockRejectedValueOnce(mockError);

        await addContributorsOptimistic(
          '1',
          [2],
          usersToAdd,
          currentContributors,
          mockOnUpdate,
          mockOnError
        );

        // Should be called twice: once optimistically, once for rollback
        expect(mockOnUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, [...currentContributors, newUser]);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, currentContributors);
        expect(mockOnError).toHaveBeenCalledWith(expect.any(ContributorAPIError));
      });
    });

    describe('removeContributorsOptimistic', () => {
      it('should perform optimistic remove successfully', async () => {
        const userToRemove = { ...mockUser, id: '2' };
        const currentContributors = [mockUser, userToRemove];
        const mockOnUpdate = vi.fn();
        const mockOnError = vi.fn();

        const mockResponse = {
          data: {
            message: 'Success',
            results: [],
            current_contributors: [mockUser]
          }
        };
        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        await removeContributorsOptimistic(
          '1',
          [2],
          currentContributors,
          mockOnUpdate,
          mockOnError
        );

        // Should be called twice: once optimistically, once with server result
        expect(mockOnUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, [mockUser]);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, mockResponse.data.current_contributors);
        expect(mockOnError).not.toHaveBeenCalled();
      });

      it('should rollback on failure', async () => {
        const userToRemove = { ...mockUser, id: '2' };
        const currentContributors = [mockUser, userToRemove];
        const mockOnUpdate = vi.fn();
        const mockOnError = vi.fn();

        const mockError = {
          response: {
            status: 400,
            data: { message: 'Remove failed' }
          }
        };
        mockApiClient.post.mockRejectedValueOnce(mockError);

        await removeContributorsOptimistic(
          '1',
          [2],
          currentContributors,
          mockOnUpdate,
          mockOnError
        );

        // Should be called twice: once optimistically, once for rollback
        expect(mockOnUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, [mockUser]);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, currentContributors);
        expect(mockOnError).toHaveBeenCalledWith(expect.any(ContributorAPIError));
      });
    });
  });

  describe('Error Handling', () => {
    describe('ContributorAPIError', () => {
      it('should create error with message only', () => {
        const error = new ContributorAPIError('Test error');
        
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('ContributorAPIError');
        expect(error.statusCode).toBeUndefined();
        expect(error.details).toBeUndefined();
      });

      it('should create error with all properties', () => {
        const details = { field: 'value' };
        const error = new ContributorAPIError('Test error', 400, details);
        
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('ContributorAPIError');
        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual(details);
      });
    });

    it('should handle errors without response data', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getProjects()).rejects.toThrow(ContributorAPIError);
      await expect(getProjects()).rejects.toThrow('Network error');
    });

    it('should handle errors without message', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {}
        }
      };
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(getProjects()).rejects.toThrow(ContributorAPIError);
      await expect(getProjects()).rejects.toThrow('An unexpected error occurred');
    });
  });
});