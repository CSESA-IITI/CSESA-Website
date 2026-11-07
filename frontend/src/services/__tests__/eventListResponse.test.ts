import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../apiClient';
import eventService, { EventAPIError } from '../eventService';

vi.mock('../../apiClient', () => ({ default: { get: vi.fn() } }));

describe.each(['getAllEvents', 'getMyEvents'] as const)('%s response handling', (method) => {
  beforeEach(() => vi.clearAllMocks());

  it.each([{ events: [] }, { events: [{ id: 1 }] }])('accepts an event array: $events', async ({ events }) => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: events });
    await expect(eventService[method]()).resolves.toEqual(events);
  });

  it('unwraps a paginated event list', async () => {
    const events = [{ id: 1 }];
    vi.mocked(apiClient.get).mockResolvedValue({ data: { results: events } });
    await expect(eventService[method]()).resolves.toEqual(events);
  });

  it('accepts an empty paginated list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { results: [] } });
    await expect(eventService[method]()).resolves.toEqual([]);
  });

  it.each([null, undefined, {}, { results: {} }, '<!doctype html>'])('rejects an invalid response: %j', async (data) => {
    vi.mocked(apiClient.get).mockResolvedValue({ data });
    await expect(eventService[method]()).rejects.toThrow(EventAPIError);
  });
});
