import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const storedUser = await authService.getStoredUser();
        if (storedUser) {
          console.log('User authenticated:', storedUser.email);
          setUser(storedUser);
        } else {
          console.log('No stored user data found, clearing auth state');
          await authService.logout();
        }
      } else {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear auth state on error
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Logging in user:', credentials.email);
      const response = await authService.login(credentials);
      console.log('Login successful for:', response.user.email);
      setUser(response.user);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      console.log('Registering user:', credentials.email);
      const response = await authService.register(credentials);
      console.log('Registration successful for:', response.user.email);
      // Note: Don't set user here since they need to verify email first
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await authService.logout();
      setUser(null);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear user state even if logout fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data');
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        console.log('User data refreshed:', storedUser.email);
        setUser(storedUser);
      } else {
        console.log('No user data found, logging out');
        await logout();
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      // If refresh fails, try to logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 