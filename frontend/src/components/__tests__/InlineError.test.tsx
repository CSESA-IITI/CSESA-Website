// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import { vi } from 'vitest';
// import InlineError from '../InlineError';

// describe('InlineError Component', () => {
//   it('renders error message', () => {
//     render(<InlineError message="Test error message" />);
    
//     expect(screen.getByText('Test error message')).toBeInTheDocument();
//   });

//   it('renders retry button when onRetry is provided', () => {
//     const mockRetry = vi.fn();
//     render(<InlineError message="Test error" onRetry={mockRetry} />);
    
//     expect(screen.getByText('Try Again')).toBeInTheDocument();
//   });

//   it('calls onRetry when retry button is clicked', () => {
//     const mockRetry = vi.fn();
//     render(<InlineError message="Test error" onRetry={mockRetry} />);
    
//     const retryButton = screen.getByText('Try Again');
//     fireEvent.click(retryButton);
    
//     expect(mockRetry).toHaveBeenCalled();
//   });

//   it('uses custom retry label when provided', () => {
//     const mockRetry = vi.fn();
//     render(
//       <InlineError 
//         message="Test error" 
//         onRetry={mockRetry} 
//         retryLabel="Reload Data" 
//       />
//     );
    
//     expect(screen.getByText('Reload Data')).toBeInTheDocument();
//     expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
//   });

//   it('does not render retry button when onRetry is not provided', () => {
//     render(<InlineError message="Test error" />);
    
//     expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
//   });

//   it('applies custom className', () => {
//     render(<InlineError message="Test error" className="custom-class" />);
    
//     const errorElement = screen.getByText('Test error').closest('div')?.parentElement;
//     expect(errorElement).toHaveClass('custom-class');
//   });

//   it('has correct error styling', () => {
//     render(<InlineError message="Test error" />);
    
//     const errorElement = screen.getByText('Test error').closest('div')?.parentElement;
//     expect(errorElement).toHaveClass('bg-red-900/20', 'border-red-700/50', 'text-red-300');
//   });
// });