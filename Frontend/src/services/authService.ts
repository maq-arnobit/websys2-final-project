// src/services/authService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

export interface LoginCredentials {
  username: string;
  password: string;
  userType: 'customer' | 'dealer' | 'provider';
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  businessName?: string; // Only for provider
}

export interface LoginResponse {
  message: string;
  userType: string;
  userId: number;
  username: string;
  email: string;
}

export const authService = {
  register: async (userType: 'customer' | 'dealer' | 'provider', data: RegisterData): Promise<any> => {
    try {
      const endpoint = `${API_URL}/api/auth/register/${userType}`;
      const response = await axios.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  getProfile: async (): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/profile`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }
};