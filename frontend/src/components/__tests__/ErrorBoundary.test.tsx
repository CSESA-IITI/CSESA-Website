import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred while loading this component/)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const mockOnError = vi.fn();
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('reloads page when refresh button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);
    
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('logs error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });
});