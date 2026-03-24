import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { apiHelpers } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && !parsed._id && parsed.id) {
      return { ...parsed, _id: parsed.id };
    }
    return parsed;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = getStoredUser();

    if (token && storedUser) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const saveAuth = (userData, token) => {
    const normalizedUser = userData && !userData._id && userData.id
      ? { ...userData, _id: userData.id }
      : userData;

    setUser(normalizedUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const { user: userData, token } = res.data || {};
      if (!userData || !token) {
        throw new Error('Invalid login response from server');
      }

      saveAuth(userData, token);
      return { success: true, user: userData, token };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, inviteCode, username) => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        ...(inviteCode ? { inviteCode: inviteCode.trim() } : {}),
        ...(username ? { username: username.trim() } : {}),
      };

      const res = await api.post('/api/auth/register', payload);
      const { user: userData, token } = res.data || {};

      if (!userData || !token) {
        throw new Error('Invalid registration response from server');
      }

      saveAuth(userData, token);
      return { success: true, user: userData, token };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiHelpers.loginWithGoogle(credential);
      const { user: userData, token } = response || {};

      if (!userData || !token) {
        throw new Error('Invalid Google login response');
      }

      saveAuth(userData, token);
      return { success: true, user: userData, token };
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Google login failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    return { success: true };
  };

  const updateUser = (updatedUserData) => {
    try {
      const normalizedUser = updatedUserData && !updatedUserData._id && updatedUserData.id
        ? { ...updatedUserData, _id: updatedUserData.id }
        : updatedUserData;

      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
    isAuthenticated,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
