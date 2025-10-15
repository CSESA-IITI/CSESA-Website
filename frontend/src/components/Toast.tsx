import React, { useEffect, useState } from 'react';
import { Toast as ToastType, useToast } from '../contexts/ToastContext';
import { cn } from '../lib/utils';

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-500 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-500 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/90 border-yellow-500 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-900/90 border-blue-500 text-blue-100`;
      default:
        return `${baseStyles} bg-gray-900/90 border-gray-500 text-gray-100`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "max-w-sm w-full rounded-lg p-4 transition-all duration-300 ease-in-out transform",
        getToastStyles(),
        isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      data-testid="toast-container"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{toast.title}</p>
            <button
              onClick={handleClose}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={() => {
                  toast.action!.onClick();
                  handleClose();
                }}
                className="text-sm font-medium underline hover:no-underline transition-all"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;