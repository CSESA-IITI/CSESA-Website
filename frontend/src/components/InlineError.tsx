import React from 'react';
import { cn } from '../lib/utils';

interface InlineErrorProps {
  message: string;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const InlineError: React.FC<InlineErrorProps> = ({ 
  message, 
  className,
  onRetry,
  retryLabel = 'Try Again'
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300",
      className
    )}>
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm">{message}</span>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 text-sm text-red-400 hover:text-red-300 underline hover:no-underline transition-colors flex-shrink-0"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default InlineError;