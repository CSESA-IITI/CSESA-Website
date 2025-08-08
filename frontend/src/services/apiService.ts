// src/services/apiService.ts

import apiClient from "../apiClient";
import axios from "axios";

// Define interfaces for your data models
export interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  link: string;
}

export const apiService = {
  // Profile
  getProfile: () => {

    return apiClient.get('/profile/');
  },
  updateProfile: (data: any) => {
    return apiClient.patch('/profile/', data);
  },

  // Events
  getEvents: () => {
    return apiClient.get<Event[]>('/events/');
  },
  getEventById: (id: number) => {
    return apiClient.get<Event>(`/events/${id}/`);
  },

  // Projects
  getProjects: () => {
    return apiClient.get<Project[]>('/projects/');
  },
  getUsers: () => {
    return apiClient.get('/users/list/');
  },
  
};