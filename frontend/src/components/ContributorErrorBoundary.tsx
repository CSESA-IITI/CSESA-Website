import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '../contexts/ToastContext';

interface ContributorErrorBoundaryProps {
  children: React.ReactNode;
}

const ContributorErrorBoundary: React.FC<ContributorErrorBoundaryProps> = ({ children }) => {
  const { addToast } = useToast();

  const handleError = (error: Error) => {
    addToast({
      type: 'error',
      title: 'Contributor Management Error',
      message: 'An unexpected error occurred in the contributor management system. Please try refreshing the page.',
      duration: 8000,
    });
    console.log(error);
  };

  const fallback = (
    <div className="min-h-[200px] flex items-center justify-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-900/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h4 className="text-md font-medium text-white mb-2">Contributor Management Unavailable</h4>
        <p className="text-sm text-gray-400 mb-3">
          There was an error loading the contributor management interface.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ContributorErrorBoundary;