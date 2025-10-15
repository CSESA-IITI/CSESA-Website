import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          if (authService.isTokenExpired()) {
            console.log('Token expired, attempting refresh...');
            const isValid = await authService.validateToken();
            if (isValid) {
              const refreshedUser = await authService.refreshUserData();
              setUser(refreshedUser || currentUser);
            } else {
              console.log('Token refresh failed, logging out...');
              authService.logout();
              setUser(null);
            }
          } else {
            const refreshedUser = await authService.refreshUserData();
            setUser(refreshedUser || currentUser);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const refreshedUser = await authService.refreshUserData();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
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