import React, { useState, useEffect } from 'react';
import { User } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ContributorSelector from './ContributorSelector';
import ContributorErrorBoundary from './ContributorErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import InlineError from './InlineError';
import { cn } from '../lib/utils';
import { 
  addContributorsOptimistic, 
  removeContributorsOptimistic, 
  getAvailableContributors,
  ContributorAPIError 
} from '../services/api';

interface ContributorManagementProps {
  projectId: string;
  currentContributors: User[];
  onContributorsUpdate: (contributors: User[]) => void;
  canManage: boolean;
  className?: string;
}



const ContributorManagement: React.FC<ContributorManagementProps> = ({
  projectId,
  currentContributors,
  onContributorsUpdate,
  canManage,
  className
}) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingContributors, setIsAddingContributors] = useState(false);
  const [isRemovingContributor, setIsRemovingContributor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddInterface, setShowAddInterface] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState<User | null>(null);


  const fetchAvailableContributors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAvailableContributors(projectId);
      setAvailableUsers(response.data.available_contributors);
    } catch (err: unknown) {
      const apiError = err as ContributorAPIError;
      const errorMessage = apiError instanceof ContributorAPIError 
        ? apiError.message 
        : 'Failed to fetch available contributors';
      setError(errorMessage);
      
      addToast({
        type: 'error',
        title: 'Failed to Load Contributors',
        message: errorMessage,
        duration: 6000,
      });
      
      console.error('Error fetching available contributors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (canManage && showAddInterface) {
      fetchAvailableContributors();
    }
  }, [projectId, canManage, showAddInterface]);

  const handleAddContributors = async () => {
    if (selectedContributors.length === 0) return;

    setIsAddingContributors(true);
    setError(null);

    const userIds = selectedContributors.map(user => parseInt(user.id));
    const contributorNames = selectedContributors.map(user => `${user.first_name} ${user.last_name}`);

    try {
      await addContributorsOptimistic(
        projectId,
        userIds,
        selectedContributors,
        currentContributors,
        (updatedContributors) => {
          onContributorsUpdate(updatedContributors);
        },
        (error: ContributorAPIError) => {
          setError(error.message);
          
          addToast({
            type: 'error',
            title: 'Failed to Add Contributors',
            message: error.message,
            duration: 6000,
          });
          
          console.error('Error adding contributors:', error);
        }
      );

      setSelectedContributors([]);
      setShowAddInterface(false);
      
      addToast({
        type: 'success',
        title: 'Contributors Added Successfully',
        message: `Added ${contributorNames.length} contributor${contributorNames.length !== 1 ? 's' : ''}: ${contributorNames.join(', ')}`,
        duration: 5000,
      });
      
      console.log(`Successfully added ${selectedContributors.length} contributor(s)`);
    } catch (err: unknown) {
      const errorMessage = 'An unexpected error occurred while adding contributors';
      setError(errorMessage);
      
      addToast({
        type: 'error',
        title: 'Unexpected Error',
        message: errorMessage,
        duration: 6000,
      });
      
      console.error('Unexpected error adding contributors:', err);
    } finally {
      setIsAddingContributors(false);
    }
  };

  const handleRemoveContributor = async (user: User) => {
    setIsRemovingContributor(true);
    setError(null);

    const contributorName = `${user.first_name} ${user.last_name}`;

    try {
      await removeContributorsOptimistic(
        projectId,
        [parseInt(user.id)],
        currentContributors,
        (updatedContributors) => {
          onContributorsUpdate(updatedContributors);
        },
        (error: ContributorAPIError) => {
          setError(error.message);
          
          addToast({
            type: 'error',
            title: 'Failed to Remove Contributor',
            message: error.message,
            duration: 6000,
          });
          
          console.error('Error removing contributor:', error);
        }
      );

      setConfirmRemoval(null);
      
      addToast({
        type: 'success',
        title: 'Contributor Removed',
        message: `Successfully removed ${contributorName} from the project`,
        duration: 4000,
      });
      
      console.log(`Successfully removed ${contributorName}`);
    } catch (err: unknown) {
      const errorMessage = 'An unexpected error occurred while removing contributor';
      setError(errorMessage);
      
      addToast({
        type: 'error',
        title: 'Unexpected Error',
        message: errorMessage,
        duration: 6000,
      });
      
      console.error('Unexpected error removing contributor:', err);
    } finally {
      setIsRemovingContributor(false);
    }
  };

  const handleCancelAdd = () => {
    setSelectedContributors([]);
    setShowAddInterface(false);
    setError(null);
  };

  return (
    <ContributorErrorBoundary>
      <div className={cn("space-y-6", className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Contributors ({currentContributors.length})
          </h3>
          {canManage && !showAddInterface && (
            <button
              onClick={() => setShowAddInterface(true)}
              disabled={isLoading || isAddingContributors || isRemovingContributor}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Contributors
            </button>
          )}
        </div>

        {error && (
          <InlineError 
            message={error} 
            className="mb-4"
            onRetry={() => {
              setError(null);
              if (showAddInterface) {
                fetchAvailableContributors();
              }
            }}
          />
        )}

        {currentContributors.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No contributors yet</p>
            <p className="text-sm">Add team members to start collaborating on this project</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {currentContributors.map((contributor) => {
              const isCurrentUser = currentUser?.id === contributor.id;
              
              return (
                <div
                  key={contributor.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                      {contributor.image_url ? (
                        <img
                          src={contributor.image_url}
                          alt={`${contributor.first_name} ${contributor.last_name}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${contributor.first_name[0]}${contributor.last_name[0]}`
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium truncate">
                          {contributor.first_name} {contributor.last_name}
                        </p>
                        {isCurrentUser && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{contributor.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                          {contributor.role}
                        </span>
                        
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => setConfirmRemoval(contributor)}
                      disabled={isLoading || isAddingContributors || isRemovingContributor}
                      className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove contributor"
                    >
                      {isRemovingContributor ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canManage && showAddInterface && (
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Add Contributors</h4>
            <button
              onClick={handleCancelAdd}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="py-8">
              <LoadingSpinner size="lg" message="Loading available contributors..." />
            </div>
          ) : (
            <>
              <ContributorSelector
                selectedContributors={selectedContributors}
                availableUsers={availableUsers}
                onContributorChange={setSelectedContributors}
                showAddSelfOption={false}
                className="mb-4"
              />

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContributors}
                  disabled={selectedContributors.length === 0 || isLoading || isAddingContributors}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isAddingContributors && <LoadingSpinner size="sm" />}
                  <span>
                    {isAddingContributors 
                      ? 'Adding...' 
                      : `Add ${selectedContributors.length} Contributor${selectedContributors.length !== 1 ? 's' : ''}`
                    }
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {confirmRemoval && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Remove Contributor</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to remove <span className="font-medium text-white">
                  {confirmRemoval.first_name} {confirmRemoval.last_name}
                </span> from this project?
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setConfirmRemoval(null)}
                  disabled={isRemovingContributor}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveContributor(confirmRemoval)}
                  disabled={isRemovingContributor}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isRemovingContributor && <LoadingSpinner size="sm" />}
                  <span>{isRemovingContributor ? 'Removing...' : 'Remove'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ContributorErrorBoundary>
  );
};

export default ContributorManagement;