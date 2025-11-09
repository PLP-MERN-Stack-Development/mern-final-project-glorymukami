import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('✅ Raw login response:', response.data);
      
      if (response.data.success) {
        const responseData = response.data;
        
        // DEBUG: Log the entire response structure
        console.log('📋 Full response data:', JSON.stringify(responseData, null, 2));
        
        // Extract token - check multiple possible locations
        const token = responseData.token || responseData.data?.token;
        console.log('🔑 Extracted token:', token ? 'Found' : 'Not found');
        
        // Extract user data - check ALL possible locations systematically
        let userData = null;
        
        if (responseData.data?.user) {
          userData = responseData.data.user;
          console.log('👤 User from: response.data.data.user');
        } else if (responseData.user) {
          userData = responseData.user;
          console.log('👤 User from: response.data.user');
        } else if (responseData.data) {
          userData = responseData.data;
          console.log('👤 User from: response.data.data');
        } else {
          userData = responseData;
          console.log('👤 User from: response.data');
        }
        
        console.log('🎯 Final user data to store:', userData);
        console.log('👑 User role:', userData?.role);
        
        if (token && userData) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return response.data;
        } else {
          console.error('❌ Missing token or user data');
        }
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await authAPI.register(userData);
      console.log('✅ Raw registration response:', response.data);
      
      if (response.data.success) {
        const responseData = response.data;
        
        // DEBUG: Log the entire response structure
        console.log('📋 Full response data:', JSON.stringify(responseData, null, 2));
        
        // Extract token
        const token = responseData.token || responseData.data?.token;
        console.log('🔑 Extracted token:', token ? 'Found' : 'Not found');
        
        // Extract user data - same systematic approach as login
        let newUser = null;
        
        if (responseData.data?.user) {
          newUser = responseData.data.user;
          console.log('👤 User from: response.data.data.user');
        } else if (responseData.user) {
          newUser = responseData.user;
          console.log('👤 User from: response.data.user');
        } else if (responseData.data) {
          newUser = responseData.data;
          console.log('👤 User from: response.data.data');
        } else {
          newUser = responseData;
          console.log('👤 User from: response.data');
        }
        
        console.log('🎯 Final user data to store:', newUser);
        console.log('👑 User role:', newUser?.role);
        
        if (token && newUser) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          return response.data;
        } else {
          console.error('❌ Missing token or user data');
        }
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      console.error('❌ Registration error:', error);
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