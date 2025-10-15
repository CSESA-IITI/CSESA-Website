import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          
          processQueue(null, access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          window.location.href = window.location.origin + window.location.pathname + '#/login';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        window.location.href = window.location.origin + window.location.pathname + '#/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
