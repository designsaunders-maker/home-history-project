import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  verificationLevel: 'basic' | 'enhanced';
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthError extends Error {
  code?: string;
  details?: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage on initial load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // Persist user data to localStorage when it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleAuthResponse = (data: any) => {
    // Store the token if it's in the response
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const data = handleAuthResponse(response.data);
      // Optionally auto-login after registration
      // setUser(data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = handleAuthResponse(response.data);
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint if you have one
      // await fetch('/api/auth/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  // Optional: Add a token interceptor for authenticated requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register,
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Optional: Add an authenticated API request utility
export const authApi = async (method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await api({
      method,
      url,
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    throw error;
  }
};