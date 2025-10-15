import React from 'react';
import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  message 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)} data-testid="loading-container">
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            "animate-spin border-2 border-blue-500 border-t-transparent rounded-full",
            sizeClasses[size]
          )}
          data-testid="loading-spinner"
        />
        {message && (
          <p className="text-sm text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;