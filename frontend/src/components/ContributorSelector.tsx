import React, { useState, useMemo } from 'react';
import { User } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import InlineError from './InlineError';
import { cn } from '../lib/utils';

interface ContributorSelectorProps {
  selectedContributors: User[];
  availableUsers: User[];
  onContributorChange: (contributors: User[]) => void;
  showAddSelfOption?: boolean;
  addSelfAsContributor?: boolean;
  onAddSelfChange?: (addSelf: boolean) => void;
  className?: string;
  maxHeight?: string;
  error?: string;
  onRetry?: () => void;
}

const ContributorSelector: React.FC<ContributorSelectorProps> = ({
  selectedContributors,
  availableUsers,
  onContributorChange,
  showAddSelfOption = true,
  addSelfAsContributor = true,
  className,
  maxHeight = 'max-h-60',
  error,
  onRetry
}) => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return availableUsers;
    
    const searchLower = searchTerm.toLowerCase();
    return availableUsers.filter(user => 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  }, [availableUsers, searchTerm]);

  const handleContributorToggle = (user: User) => {
    try {
      const isSelected = selectedContributors.some(contributor => contributor.id === user.id);
      
      if (isSelected) {
        const updatedContributors = selectedContributors.filter(contributor => contributor.id !== user.id);
        onContributorChange(updatedContributors);
      } else {
        onContributorChange([...selectedContributors, user]);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Selection Error',
        message: 'Failed to update contributor selection. Please try again.',
        duration: 4000,
      });
      console.error('Error toggling contributor selection:', error);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedContributors.some(contributor => contributor.id === user.id);
  };

  const getSelectedCount = () => {
    let count = selectedContributors.length;
    if (showAddSelfOption && addSelfAsContributor && currentUser) {
      const currentUserSelected = selectedContributors.some(contributor => contributor.id === currentUser.id);
      if (!currentUserSelected) {
        count += 1;
      }
    }
    return count;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Add Self Option */}
      {/* {showAddSelfOption && currentUser && onAddSelfChange && (
        <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <input
            type="checkbox"
            id="add-self-contributor"
            checked={addSelfAsContributor}
            onChange={(e) => onAddSelfChange(e.target.checked)}
            className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="add-self-contributor" className="text-white font-medium">
            Add myself as contributor
          </label>
          <div className="flex items-center space-x-2 ml-auto">
            {currentUser.image && (
              <img
                src={currentUser.image}
                alt={`${currentUser.first_name} ${currentUser.last_name}`}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-300">
              {currentUser.first_name} {currentUser.last_name}
            </span>
          </div>
        </div>
      )} */}

      {/* Selected Contributors Summary */}
      {getSelectedCount() > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
          <span className="text-blue-300 font-medium">
            {getSelectedCount()} contributor{getSelectedCount() !== 1 ? 's' : ''} selected
          </span>
          <div className="flex -space-x-2">
            {selectedContributors.slice(0, 3).map((contributor) => (
              <div
                key={contributor.id}
                className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium"
                title={`${contributor.first_name} ${contributor.last_name}`}
              >
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
            ))}
            {getSelectedCount() > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium">
                +{getSelectedCount() - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <InlineError 
          message={error}
          onRetry={onRetry}
          retryLabel="Reload Contributors"
        />
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Search contributors by name, email, role, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className={cn("bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", maxHeight)}>
        <div className="overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchTerm ? 'No users found matching your search.' : 'No users available.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredUsers.map((user) => {
                const isSelected = isUserSelected(user);
                const isCurrentUser = currentUser?.id === user.id;
                
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center p-4 hover:bg-gray-700/50 transition-colors cursor-pointer",
                      isSelected && "bg-blue-900/20 border-l-4 border-l-blue-500"
                    )}
                    onClick={() => handleContributorToggle(user)}
                  >
                    <input
                      type="checkbox"
                      id={`contributor-${user.id}`}
                      checked={isSelected}
                      onChange={() => handleContributorToggle(user)}
                      className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mr-3"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${user.first_name} ${user.last_name}`}
                    />
                    
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                        {user.image_url ? (
                          <img
                            src={user.image_url}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${user.first_name[0]}${user.last_name[0]}`
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          {isCurrentUser && (
                            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                            {user.role}
                          </span>
                          
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="ml-2">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributorSelector;