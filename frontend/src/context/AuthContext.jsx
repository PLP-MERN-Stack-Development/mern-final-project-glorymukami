import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Verify token is still valid by fetching profile
        const response = await authAPI.getProfile();
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        // SIMPLE APPROACH: Store whatever the backend sends
        const responseData = response.data;
        
        // Extract token - try different possible locations
        const token = responseData.token || responseData.data?.token || responseData.accessToken;
        
        // Extract user data - try different possible locations
        const userData = responseData.user || responseData.data?.user || responseData.data || responseData;
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return response.data;
        } else {
          throw new Error('No token received from server');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        // Same simple approach as login
        const responseData = response.data;
        const token = responseData.token || responseData.data?.token || responseData.accessToken;
        const newUser = responseData.user || responseData.data?.user || responseData.data || responseData;
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          return response.data;
        } else {
          throw new Error('No token received from server');
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};