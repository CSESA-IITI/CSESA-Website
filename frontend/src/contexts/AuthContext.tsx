import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectPath?: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  handleGoogleCallback: (code: string, state: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (redirectPath: string = '/') => {
    authService.initiateGoogleLogin(redirectPath);
  };

  const handleGoogleCallback = async (code: string, state: string) => {
    console.log('=== AuthContext: Handling Google callback ===');
    console.log('Code:', code);
    console.log('State:', state);
    
    try {
      console.log('Calling authService.handleGoogleCallback...');
      const response: AuthResponse = await authService.handleGoogleCallback(code, state);
      console.log('Auth response received:', response);
      
      if (response && response.user) {
        console.log('Setting user in context:', response.user);
        setUser(response.user);
      } else {
        console.error('No user data in auth response');
      }
      
      // Redirect to the specified URL after successful login
      if (response.redirect_uri) {
        window.location.href = response.redirect_uri;
      }
      
      return response;
    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    hasRole,
    handleGoogleCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};