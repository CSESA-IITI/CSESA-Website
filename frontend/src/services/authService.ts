// src/services/authService.ts

import apiClient from '../apiClient';

export interface User {
  id: string;
  email: string;
  // This should match the UserSerializer fields from your backend
  first_name?: string;
  last_name?: string;
  role?: string;
  branch?: string;
  admission_year?: string;
  skills?: string;
  github_link?: string;
  linkedin_link?: string;
  instagram_link?: string;
  picture?: string;
}

// This response is expected from your /token/ endpoint
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

class AuthService {
  // Login with email and password
  async login(email: string, password: string): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/users/token/', {
      email,
      password,
    });

    const { access, refresh, user } = response.data;
    if (access && refresh && user) {
      this.setAuthTokens(access, refresh);
      this.setUser(user);
      return user;
    }
    
    throw new Error('Invalid login response from server.');
  }

  // Logout the user
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const loginUrl = '/CSESA-Website/#/login';

    if (window.location.hash !== '#/login') {
      window.location.replace(loginUrl);
    }
  }



  // Refresh the access token
  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available.');
    }

    const response = await apiClient.post<{ access: string }>('/users/token/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  }
  
  // Store authentication tokens
  private setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Store user data
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if a user is currently authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

// Export a singleton instance
export default new AuthService();