import apiClient from '../apiClient';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  domain: string;
  year: string;
  bio: string;
  image_url: string;
  skills: { name: string }[];
  github_link: string;
  linkedin_link: string;
  is_onboarded: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/token/', {
      email,
      password,
    });
    const { access, refresh, user } = response.data;
    this.setAuthTokens(access, refresh);
    this.setUser(user);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  async updateProfile(profileData: FormData | any): Promise<User> {
    const config = profileData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    
    const response = await apiClient.patch('/profile/', profileData, config);
    this.setUser(response.data);
    return response.data;
  }

  async refreshUserData(): Promise<User | null> {
    try {
      const response = await apiClient.get('/profile/');
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    role: string;
    domain: string;
    year: string;
  }): Promise<User> {
    // Use the standard ViewSet POST endpoint for creating users
    const response = await apiClient.post('/admin/users/', userData);
    return response.data;
  }

  async getAllUsers(): Promise<{ data: User[] }> {
    return apiClient.get('/admin/users/');
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post('/token/refresh/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      return access;
    } catch (error) {
      // Refresh failed, clear tokens
      this.logout();
      return null;
    }
  }

  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }

    try {
      // Try to make a simple authenticated request
      await apiClient.get('/profile/');
      return true;
    } catch (error) {
      // Token is invalid, try to refresh
      const newToken = await this.refreshToken();
      return !!newToken;
    }
  }

  // Decode JWT token to check expiration
  isTokenExpired(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

export default new AuthService();
