import axios, { AxiosError } from 'axios';

// Create a new axios instance with a base URL
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Your Django backend URL
});

// === Request Interceptor ===
// This runs before every request is sent
apiClient.interceptors.request.use(
  (config) => {
    // Get the access token from local storage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// === Response Interceptor ===
// This runs after a response is received
apiClient.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error: AxiosError) => {
    // --- High-level error handling ---
    const { response } = error;

    if (response) {
      // The server responded with a status code outside the 2xx range
      switch (response.status) {
        case 401:
          // Unauthorized: e.g., token expired.
          // You could add logic here to refresh the token or redirect to login.
          console.error('Unauthorized, logging out...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden: User does not have permission
          console.error('Forbidden access:', response.data);
          break;
        case 404:
          // Not Found
          console.error('Resource not found:', response.data);
          break;
        case 500:
          // Internal Server Error
          console.error('Server error:', response.data);
          break;
        default:
          // Other errors
          console.error(`Error ${response.status}:`, response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      console.error('Network error or server is not responding.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }

    // Return a rejected promise with the error to be caught by the component
    return Promise.reject(error);
  }
);

// === API Service Functions ===
// We define a function for each API call, abstracting the endpoint details
export const apiService = {
  // --- Auth ---
  login: (data: any) => {
    return apiClient.post('/token/', data);
  },
  register: (data: any) => {
    return apiClient.post('/register/', data);
  },

  // --- Profile ---
  getProfile: () => {
    return apiClient.get('/profile/');
  },
  updateProfile: (data: any) => {
    return apiClient.patch('/profile/', data);
  },
  
  // --- Events ---
  getEvents: () => {
    return apiClient.get('/events/');
  },
  getEventById: (id: number) => {
    return apiClient.get(`/events/${id}/`);
  },

  // --- Projects ---
  getProjects: () => {
    return apiClient.get('/projects/');
  },
};