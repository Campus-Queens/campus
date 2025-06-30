import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Logging in with:', { email: credentials.email });
      const response = await API.post('/appuser/sign-in/', credentials);
      console.log('Login response:', response.data);
      
      // Properly destructure the response data - Django uses access_token and refresh_token
      const { access_token, refresh_token, user } = response.data;
      
      console.log("🧪 Tokens:", { access_token, refresh_token });
      console.log("🧪 User:", user);
      
      // Validate that we have the required tokens
      if (!access_token || !refresh_token) {
        throw new Error('Missing tokens from login response');
      }
      
      if (!user) {
        throw new Error('Missing user data from login response');
      }
      
      // Store tokens with proper key names
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Tokens and user data stored successfully');
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('Registering user:', { email: credentials.email, first_name: credentials.first_name });
      const response = await API.post('/appuser/create-user/', credentials);
      console.log('Register response:', response.data);
      
      // Note: Registration doesn't return tokens, user needs to verify email first
      const { user } = response.data;
      
      console.log("🧪 User:", user);
      
      if (!user) {
        throw new Error('Missing user data from registration response');
      }
      
      // For registration, we don't store tokens since user needs to verify email first
      console.log('✅ User data received, email verification required');
      
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('Logging out...');
      // Clear stored data
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local storage
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
  },

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      console.log('Refreshing token...');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.log('No refresh token found');
        return null;
      }

      const response = await API.post('/appuser/refresh-token/', {
        refresh: refreshToken
      });
      
      console.log('Token refresh successful');
      const newAccessToken = response.data.access;
      
      // Update stored access token
      await AsyncStorage.setItem('access_token', newAccessToken);
      
      return newAccessToken;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear all tokens on refresh failure
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const user = await AsyncStorage.getItem('user');
      
      if (!token || !user) {
        console.log('No access token or user data found');
        return false;
      }

      console.log('✅ User has valid token and stored user data');
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('Requesting password reset for:', email);
      await API.post('/appuser/request-password-reset/', { email });
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('Resetting password with token');
      await API.post('/appuser/reset-password/', {
        token,
        new_password: newPassword
      });
      console.log('Password reset successful');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      console.log('Verifying email with token');
      await API.post('/appuser/verify-email/', { token });
      console.log('Email verification successful');
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify email');
    }
  },

  // Update profile
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      console.log('Updating profile:', profileData);
      const response = await API.put('/appuser/profile/', profileData);
      console.log('Profile update response:', response.data);
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      console.log('Changing password');
      await API.post('/appuser/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      console.log('Password change successful');
    } catch (error: any) {
      console.error('Password change error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }
}; 