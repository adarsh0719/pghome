import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

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

  // Set up axios interceptor for auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, data } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // ✅ Set user state including token
    const loggedInUser = { ...data.user, token };
    setUser(loggedInUser);

    toast.success('Login successful!');
    // ✅ Return user along with success
    return { success: true, user: loggedInUser };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    toast.error(message);
    return { success: false, message };
  }
};
const register = async (userData) => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    const { token, data } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // ✅ Include token in user state
    setUser({ ...data.user, token });

    toast.success('Registration successful!');
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    toast.error(message);
    return { success: false, message };
  }
};

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      toast.success('Logged out successfully!');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};