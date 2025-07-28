import apiClient from '../apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string; // Add role field to match your backend
}

export interface AuthResponse {
  access: string;  // Changed from access_token to match your backend
  refresh: string; // Changed from refresh_token to match your backend
  user: User;
  redirect_uri?: string; // Optional redirect URI after successful authentication
}

class AuthService {
  // Initialize Google login
  async initiateGoogleLogin(redirectPath: string = '/'): Promise<void> {
    try {
      // Generate a random state parameter for CSRF protection
      const state = window.crypto.randomUUID();
      localStorage.setItem('oauth_state', state);

      const redirectUri = `${window.location.origin}/auth/callback`;
      const stateData = {
        state,
        from: redirectPath,
        redirect_uri: redirectUri
      };

      // Get the Google OAuth URL from the backend
      const response = await apiClient.get('/api/auth/google/', {
        params: {
          redirect_uri: redirectUri,
          state: JSON.stringify(stateData)
        }
      });

      const { auth_url } = response.data;
      // Redirect to Google's OAuth consent screen
      window.location.href = auth_url;
    } catch (error) {
      console.error('Login initiation error:', error);
      throw error;
    }
  }

  // Handle the OAuth callback with the authorization code
  async handleGoogleCallback(code: string, stateStr: string): Promise<AuthResponse> {
    try {
      const state = JSON.parse(stateStr);
      // Get the stored state from localStorage
      const storedState = localStorage.getItem('oauth_state');

      // Verify the state parameter to prevent CSRF attacks
      if (!storedState || state.state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Clean up the stored state
      localStorage.removeItem('oauth_state');

      // Prepare the request data
      const requestData = {
        code,
        state: stateStr
      };

      // Send the authorization code to the backend to exchange for tokens
      const response = await apiClient.post('/api/auth/google/callback/', requestData);

      const { access_token, refresh_token, user, redirect_uri } = response.data;

      if (!access_token || !user) {
        throw new Error('Invalid response from server: missing access token or user data');
      }

      // Store the tokens and user data
      this.setAuthTokens(access_token, refresh_token);
      this.setUser(user);

      // Return the response with the redirect URI
      return { ...response.data, redirect_uri };
    } catch (error) {
      console.error('Google callback error:', error);
      this.logout();
      throw error;
    }
  }

  // Store authentication tokens
  private setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  // Store user data
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Check if user has required role
  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === requiredRole;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Optional: Redirect to login page or home
    window.location.href = '/login';
  }

  // Get auth header for API requests
  getAuthHeader(): { Authorization: string } | {} {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Refresh access token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await apiClient.post('/api/token/refresh/', {
        refresh: refreshToken
      });

      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      return access;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return null;
    }
  }
}

export default new AuthService();