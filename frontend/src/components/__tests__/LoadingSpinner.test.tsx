import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders spinner with default size', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders spinner with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders spinner with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders message when provided', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('does not render message when not provided', () => {
    render(<LoadingSpinner />);
    
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct spinner styling', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('border-2', 'border-blue-500', 'border-t-transparent', 'rounded-full');
  });
});