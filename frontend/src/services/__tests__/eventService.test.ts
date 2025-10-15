// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import eventService, { EventAPIError } from '../eventService';
// import apiClient from '../../apiClient';
// import { User } from '../authService';

// // Mock the apiClient
// vi.mock('../../apiClient');
// const mockedApiClient = vi.mocked(apiClient);

// describe('EventService', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   const mockUser: User = {
//     id: '1',
//     email: 'test@example.com',
//     first_name: 'Test',
//     last_name: 'User',
//     role: 'PRESIDENT',
//     department: 'CS',
//     year: '2024',
//     bio: 'Test bio',
//     image: '',
//     skills: [],
//     github_link: '',
//     linkedin_link: ''
//   };

//   const mockEvent = {
//     id: 1,
//     title: 'Test Event',
//     description: 'Test Description',
//     date: '2025-12-01T10:00:00Z',
//     location: 'Test Location',
//     created_by: mockUser,
//     can_edit: true,
//     can_delete: true,
//     created_at: '2024-01-01T00:00:00Z',
//     updated_at: '2024-01-01T00:00:00Z'
//   };

//   describe('getAllEvents', () => {
//     it('should fetch all events successfully', async () => {
//       const mockResponse = { data: [mockEvent] };
//       mockedApiClient.get.mockResolvedValue(mockResponse);

//       const result = await eventService.getAllEvents();

//       expect(mockedApiClient.get).toHaveBeenCalledWith('/events/');
//       expect(result).toEqual([mockEvent]);
//     });

//     it('should handle paginated response', async () => {
//       const mockResponse = { 
//         data: { 
//           results: [mockEvent],
//           count: 1,
//           next: null,
//           previous: null
//         } 
//       };
//       mockedApiClient.get.mockResolvedValue(mockResponse);

//       const result = await eventService.getAllEvents();

//       expect(result).toEqual([mockEvent]);
//     });

//     it('should handle API errors', async () => {
//       const mockError = {
//         response: {
//           status: 500,
//           data: { message: 'Server error' }
//         }
//       };
//       mockedApiClient.get.mockRejectedValue(mockError);

//       await expect(eventService.getAllEvents()).rejects.toThrow(EventAPIError);
//     });
//   });

//   describe('getMyEvents', () => {
//     it('should fetch user events successfully', async () => {
//       const mockResponse = { data: [mockEvent] };
//       mockedApiClient.get.mockResolvedValue(mockResponse);

//       const result = await eventService.getMyEvents();

//       expect(mockedApiClient.get).toHaveBeenCalledWith('/events/my_events/');
//       expect(result).toEqual([mockEvent]);
//     });
//   });

//   describe('createEvent', () => {
//     const validEventData = {
//       title: 'New Event',
//       description: 'New Description',
//       date: '2025-12-01T10:00:00Z',
//       location: 'New Location'
//     };

//     it('should create event successfully', async () => {
//       const mockResponse = { data: mockEvent };
//       mockedApiClient.post.mockResolvedValue(mockResponse);

//       const result = await eventService.createEvent(validEventData);

//       expect(mockedApiClient.post).toHaveBeenCalledWith('/events/', validEventData);
//       expect(result).toEqual(mockEvent);
//     });

//     it('should validate required fields', async () => {
//       const invalidData = { ...validEventData, title: '' };

//       await expect(eventService.createEvent(invalidData)).rejects.toThrow('Event title is required');
//     });

//     it('should validate future date', async () => {
//       const pastDate = new Date();
//       pastDate.setDate(pastDate.getDate() - 1);
//       const invalidData = { ...validEventData, date: pastDate.toISOString() };

//       await expect(eventService.createEvent(invalidData)).rejects.toThrow('Event date must be in the future');
//     });
//   });

//   describe('updateEvent', () => {
//     it('should update event successfully', async () => {
//       const updateData = { title: 'Updated Title' };
//       const mockResponse = { data: { ...mockEvent, ...updateData } };
//       mockedApiClient.patch.mockResolvedValue(mockResponse);

//       const result = await eventService.updateEvent(1, updateData);

//       expect(mockedApiClient.patch).toHaveBeenCalledWith('/events/1/', updateData);
//       expect(result.title).toBe('Updated Title');
//     });

//     it('should validate future date when updating', async () => {
//       const pastDate = new Date();
//       pastDate.setDate(pastDate.getDate() - 1);
//       const updateData = { date: pastDate.toISOString() };

//       await expect(eventService.updateEvent(1, updateData)).rejects.toThrow('Event date must be in the future');
//     });
//   });

//   describe('deleteEvent', () => {
//     it('should delete event successfully', async () => {
//       mockedApiClient.delete.mockResolvedValue({});

//       await eventService.deleteEvent(1);

//       expect(mockedApiClient.delete).toHaveBeenCalledWith('/events/1/');
//     });
//   });

//   describe('permission methods', () => {
//     it('should check if user can create events', () => {
//       expect(eventService.canCreateEvents(mockUser)).toBe(true);
      
//       const memberUser = { ...mockUser, role: 'MEMBER' };
//       expect(eventService.canCreateEvents(memberUser)).toBe(false);
      
//       expect(eventService.canCreateEvents(null)).toBe(false);
//     });

//     it('should check if user can manage event', () => {
//       expect(eventService.canManageEvent(mockEvent, mockUser)).toBe(true);
      
//       const memberUser = { ...mockUser, role: 'MEMBER', id: '2' };
//       expect(eventService.canManageEvent(mockEvent, memberUser)).toBe(false);
//     });
//   });

//   describe('utility methods', () => {
//     it('should format event date', () => {
//       const formatted = eventService.formatEventDate('2025-12-01T10:00:00Z');
//       expect(formatted).toContain('2025');
//       expect(formatted).toContain('December');
//     });

//     it('should check if event is past', () => {
//       const pastDate = new Date();
//       pastDate.setDate(pastDate.getDate() - 1);
//       expect(eventService.isEventPast(pastDate.toISOString())).toBe(true);
      
//       const futureDate = new Date();
//       futureDate.setDate(futureDate.getDate() + 1);
//       expect(eventService.isEventPast(futureDate.toISOString())).toBe(false);
//     });

//     it('should check if event is upcoming', () => {
//       const tomorrow = new Date();
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       expect(eventService.isEventUpcoming(tomorrow.toISOString())).toBe(true);
      
//       const nextMonth = new Date();
//       nextMonth.setMonth(nextMonth.getMonth() + 1);
//       expect(eventService.isEventUpcoming(nextMonth.toISOString())).toBe(false);
//     });
//   });
// });