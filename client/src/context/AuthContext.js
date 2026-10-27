import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('apex_wash_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('apex_wash_auth_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Verify and refresh current user profile on initial mount
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('apex_wash_auth_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('apex_wash_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.warn('Session expired or invalid, logging out:', err.response?.data?.message || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Log in user
  const login = async (identifier, password) => {
    const res = await apiClient.post('/auth/login', { identifier, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('apex_wash_auth_token', receivedToken);
    localStorage.setItem('apex_wash_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  // Register a new user
  const register = async (formData) => {
    const res = await apiClient.post('/auth/register', formData);
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('apex_wash_auth_token', receivedToken);
    localStorage.setItem('apex_wash_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  // Log out user
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('apex_wash_auth_token');
    localStorage.removeItem('apex_wash_user');
  };

  // Update current user profile
  const updateProfile = async (profileData) => {
    const res = await apiClient.put('/auth/profile', profileData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem('apex_wash_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Change password
  const changePassword = async (passwordData) => {
    const res = await apiClient.post('/auth/change-password', passwordData);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
