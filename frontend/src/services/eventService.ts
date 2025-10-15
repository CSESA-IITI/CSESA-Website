import apiClient from '../apiClient';
import { User } from './authService';

// TypeScript interfaces for Event and related data structures
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string; // ISO datetime string
  location: string;
  created_by: User;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string; // ISO datetime string
  location: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string; // ISO datetime string
  location?: string;
}

export interface EventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

// Error types for better error handling
export class EventAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'EventAPIError';
  }
}

// Helper function to handle API errors consistently
const handleAPIError = (error: unknown): never => {
  const apiError = error as any;
  const message = apiError.response?.data?.message || 
                 apiError.response?.data?.detail ||
                 apiError.message || 
                 'An unexpected error occurred';
  const statusCode = apiError.response?.status;
  const details = apiError.response?.data;
  
  throw new EventAPIError(message, statusCode, details);
};

/**
 * EventService class providing all CRUD operations for events
 * Includes filtering methods and proper error handling
 */
class EventService {
  /**
   * Get all events with optional pagination
   */
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get('/events/');
      // Handle both paginated and non-paginated responses
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  }

  /**
   * Get events created by the current user
   */
  async getMyEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get('/events/my_events/');
      // Handle both paginated and non-paginated responses
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  }

  /**
   * Get a specific event by ID
   */
  async getEvent(eventId: number): Promise<Event> {
    try {
      const response = await apiClient.get(`/events/${eventId}/`);
      return response.data;
    } catch (error) {
      return handleAPIError(error);
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      // Validate required fields
      if (!eventData.title?.trim()) {
        throw new EventAPIError('Event title is required');
      }
      if (!eventData.description?.trim()) {
        throw new EventAPIError('Event description is required');
      }
      if (!eventData.date) {
        throw new EventAPIError('Event date is required');
      }
      if (!eventData.location?.trim()) {
        throw new EventAPIError('Event location is required');
      }

      // Validate date is in the future
      const eventDate = new Date(eventData.date);
      if (eventDate <= new Date()) {
        throw new EventAPIError('Event date must be in the future');
      }

      const response = await apiClient.post('/events/', eventData);
      return response.data;
    } catch (error) {
      if (error instanceof EventAPIError) {
        throw error;
      }
      return handleAPIError(error);
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: number, eventData: UpdateEventData): Promise<Event> {
    try {
      // Validate date if provided
      if (eventData.date) {
        const eventDate = new Date(eventData.date);
        if (eventDate <= new Date()) {
          throw new EventAPIError('Event date must be in the future');
        }
      }

      // Validate non-empty strings if provided
      if (eventData.title !== undefined && !eventData.title.trim()) {
        throw new EventAPIError('Event title cannot be empty');
      }
      if (eventData.description !== undefined && !eventData.description.trim()) {
        throw new EventAPIError('Event description cannot be empty');
      }
      if (eventData.location !== undefined && !eventData.location.trim()) {
        throw new EventAPIError('Event location cannot be empty');
      }

      const response = await apiClient.patch(`/events/${eventId}/`, eventData);
      return response.data;
    } catch (error) {
      if (error instanceof EventAPIError) {
        throw error;
      }
      return handleAPIError(error);
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: number): Promise<void> {
    try {
      await apiClient.delete(`/events/${eventId}/`);
    } catch (error) {
      return handleAPIError(error);
    }
  }

  /**
   * Check if current user can create events
   * Based on role (PRESIDENT or HEAD)
   */
  canCreateEvents(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'PRESIDENT' || user.role === 'HEAD';
  }

  /**
   * Check if current user can manage a specific event
   */
  canManageEvent(event: Event, user: User | null): boolean {
    if (!user) return false;
    
    // Event creator can manage
    if (event.created_by.id === user.id) return true;
    
    // Presidents and heads can manage all events
    return user.role === 'PRESIDENT' || user.role === 'HEAD';
  }

  /**
   * Format event date for display
   */
  formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if event is in the past
   */
  isEventPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  /**
   * Check if event is upcoming (within next 7 days)
   */
  isEventUpcoming(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return eventDate > now && eventDate <= weekFromNow;
  }
}

// Export singleton instance
export default new EventService();