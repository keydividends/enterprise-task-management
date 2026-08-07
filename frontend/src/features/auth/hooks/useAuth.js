import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const storageKeys = {
  token: 'etms_access_token',
  user: 'etms_user',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(storageKeys.user);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(storageKeys.token, token);
    } else {
      localStorage.removeItem(storageKeys.token);
    }
  }, [token]);

useEffect(() => {
    const bootstrapCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const currentUser = await authService.getCurrentUser();
        // Always refresh the stored user from the backend so the UI reflects
        // the latest role and permissions (avoids stale-session bugs where
        // action buttons such as Create team / Manage members are hidden).
        setUser(currentUser);
      } catch (error) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKeys.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKeys.user);
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.accessToken);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin({ credential });
      setToken(response.accessToken);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const loginWithMicrosoft = async (accessToken) => {
    setLoading(true);
    try {
      const response = await authService.microsoftLogin({ accessToken });
      setToken(response.accessToken);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await authService.register(payload);
      setToken(response.accessToken);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) return null;

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    register,
    logout,
    refreshUser,
    setUser,
    setToken,
  }), [user, token, loading]);

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export default useAuth;
