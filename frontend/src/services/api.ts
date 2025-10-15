import apiClient from '../apiClient';
import { User } from './authService';

// Types for API responses
export interface ContributorOperationResult {
  user_id: string;
  user_name: string;
  action: 'added' | 'removed';
  success: boolean;
  message: string;
}

export interface ContributorOperationResponse {
  message: string;
  results: ContributorOperationResult[];
  current_contributors: User[];
}

export interface AvailableContributorsResponse {
  available_contributors: User[];
  count: number;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  tech_stack: string;
  github_link: string;
  deployment_link: string | null;
  created_at: string;
  updated_at: string;
  team_members_details: User[];
}



// Error types for better error handling
export class ContributorAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ContributorAPIError';
  }
}

// Helper function to handle API errors consistently
const handleAPIError = (error: unknown): never => {
  const apiError = error as any;
  const message = apiError.response?.data?.message || apiError.message || 'An unexpected error occurred';
  const statusCode = apiError.response?.status;
  const details = apiError.response?.data;
  
  throw new ContributorAPIError(message, statusCode, details);
};

// Project API functions

export const getProjects = async (): Promise<{ data: ProjectResponse[] }> => {
  try {
    return await apiClient.get('/projects/');
  } catch (error) {
    return handleAPIError(error);
  }
};

export const getProject = async (projectId: string): Promise<{ data: ProjectResponse }> => {
  try {
    return await apiClient.get(`/projects/${projectId}/`);
  } catch (error) {
    return handleAPIError(error);
  }
};

export const createProject = async (projectData: any): Promise<{ data: ProjectResponse }> => {
  try {
    return await apiClient.post('/projects/', projectData);
  } catch (error) {
    return handleAPIError(error);
  }
};

export const updateProject = async (projectId: string, projectData: any): Promise<{ data: ProjectResponse }> => {
  try {
    return await apiClient.patch(`/projects/${projectId}/`, projectData);
  } catch (error) {
    return handleAPIError(error);
  }
};

// Enhanced contributor management functions with better error handling
export const addContributors = async (
  projectId: string, 
  userIds: number[]
): Promise<{ data: ContributorOperationResponse }> => {
  try {
    if (!projectId) {
      throw new ContributorAPIError('Project ID is required');
    }
    
    if (!userIds || userIds.length === 0) {
      throw new ContributorAPIError('At least one user ID is required');
    }

    return await apiClient.post(`/projects/${projectId}/contributors/`, {
      user_ids: userIds,
      action: 'add'
    });
  } catch (error) {
    return handleAPIError(error);
  }
};

export const removeContributors = async (
  projectId: string, 
  userIds: number[]
): Promise<{ data: ContributorOperationResponse }> => {
  try {
    if (!projectId) {
      throw new ContributorAPIError('Project ID is required');
    }
    
    if (!userIds || userIds.length === 0) {
      throw new ContributorAPIError('At least one user ID is required');
    }

    return await apiClient.post(`/projects/${projectId}/contributors/`, {
      user_ids: userIds,
      action: 'remove'
    });
  } catch (error) {
    return handleAPIError(error);
  }
};

export const getAvailableContributors = async (
  projectId: string
): Promise<{ data: AvailableContributorsResponse }> => {
  try {
    if (!projectId) {
      throw new ContributorAPIError('Project ID is required');
    }

    return await apiClient.get(`/projects/${projectId}/available-contributors/`);
  } catch (error) {
    return handleAPIError(error);
  }
};

// Optimistic update helper functions
export interface OptimisticUpdateOptions<T> {
  operation: () => Promise<T>;
  onOptimisticUpdate: () => void;
  onSuccess: (result: T) => void;
  onError: (error: ContributorAPIError) => void;
  onRollback: () => void;
}

export const performOptimisticUpdate = async <T>(
  options: OptimisticUpdateOptions<T>
): Promise<void> => {
  const { operation, onOptimisticUpdate, onSuccess, onError, onRollback } = options;
  
  // Apply optimistic update immediately
  onOptimisticUpdate();
  
  try {
    // Perform the actual API operation
    const result = await operation();
    
    // If successful, call success handler
    onSuccess(result);
  } catch (error) {
    // If failed, rollback the optimistic update
    onRollback();
    
    // Handle the error
    const apiError = error instanceof ContributorAPIError 
      ? error 
      : new ContributorAPIError((error as Error).message || 'Operation failed');
    
    onError(apiError);
  }
};

// Convenience functions for optimistic contributor operations
export const addContributorsOptimistic = async (
  projectId: string,
  userIds: number[],
  usersToAdd: User[],
  currentContributors: User[],
  onUpdate: (contributors: User[]) => void,
  onError: (error: ContributorAPIError) => void
): Promise<void> => {
  const optimisticContributors = [...currentContributors, ...usersToAdd];
  
  return performOptimisticUpdate({
    operation: () => addContributors(projectId, userIds),
    onOptimisticUpdate: () => onUpdate(optimisticContributors),
    onSuccess: (result) => {
      // Use the actual result from the server
      onUpdate(result.data.current_contributors);
    },
    onError: onError,
    onRollback: () => onUpdate(currentContributors)
  });
};

export const removeContributorsOptimistic = async (
  projectId: string,
  userIds: number[],
  currentContributors: User[],
  onUpdate: (contributors: User[]) => void,
  onError: (error: ContributorAPIError) => void
): Promise<void> => {
  const optimisticContributors = currentContributors.filter(
    contributor => !userIds.includes(parseInt(contributor.id))
  );
  
  return performOptimisticUpdate({
    operation: () => removeContributors(projectId, userIds),
    onOptimisticUpdate: () => onUpdate(optimisticContributors),
    onSuccess: (result) => {
      // Use the actual result from the server
      onUpdate(result.data.current_contributors);
    },
    onError: onError,
    onRollback: () => onUpdate(currentContributors)
  });
};
