import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Toast from '../Toast';
import { ToastProvider } from '../../contexts/ToastContext';

const mockToast = {
  id: 'test-toast',
  type: 'success' as const,
  title: 'Test Toast',
  message: 'This is a test message',
  duration: 5000,
};

const mockRemoveToast = vi.fn();

// Mock the useToast hook
vi.mock('../../contexts/ToastContext', async () => {
  const actual = await vi.importActual('../../contexts/ToastContext');
  return {
    ...actual,
    useToast: () => ({
      removeToast: mockRemoveToast,
    }),
  };
});

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toast with title and message', () => {
    render(<Toast toast={mockToast} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('renders success toast with correct styling', () => {
    render(<Toast toast={mockToast} />);
    
    const toastElement = screen.getByTestId('toast-container');
    expect(toastElement).toHaveClass('bg-green-900/90', 'border-green-500');
  });

  it('renders error toast with correct styling', () => {
    const errorToast = { ...mockToast, type: 'error' as const };
    render(<Toast toast={errorToast} />);
    
    const toastElement = screen.getByTestId('toast-container');
    expect(toastElement).toHaveClass('bg-red-900/90', 'border-red-500');
  });

  it('calls removeToast when close button is clicked', async () => {
    render(<Toast toast={mockToast} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    // Wait for the timeout to complete
    await waitFor(() => {
      expect(mockRemoveToast).toHaveBeenCalledWith('test-toast');
    }, { timeout: 400 });
  });

  it('renders action button when action is provided', () => {
    const actionToast = {
      ...mockToast,
      action: {
        label: 'Retry',
        onClick: vi.fn(),
      },
    };
    
    render(<Toast toast={actionToast} />);
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls action onClick and removes toast when action button is clicked', async () => {
    const mockActionClick = vi.fn();
    const actionToast = {
      ...mockToast,
      action: {
        label: 'Retry',
        onClick: mockActionClick,
      },
    };
    
    render(<Toast toast={actionToast} />);
    
    const actionButton = screen.getByText('Retry');
    fireEvent.click(actionButton);
    
    expect(mockActionClick).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockRemoveToast).toHaveBeenCalledWith('test-toast');
    }, { timeout: 400 });
  });

  it('does not render message when not provided', () => {
    const toastWithoutMessage = { ...mockToast, message: undefined };
    render(<Toast toast={toastWithoutMessage} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.queryByText('This is a test message')).not.toBeInTheDocument();
  });
});