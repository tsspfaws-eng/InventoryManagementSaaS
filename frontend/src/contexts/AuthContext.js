import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if token exists and is valid on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const tenantData = localStorage.getItem('tenant');
      const userData = localStorage.getItem('user');

      if (token && tenantData && userData) {
        try {
          // Check if token is expired
          const decoded = jwt_decode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token is expired
            await logout();
            return;
          }

          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Set user and tenant data
          setCurrentUser(JSON.parse(userData));
          setTenant(JSON.parse(tenantData));

          // Verify token with backend
          await axios.get('/api/auth/me');
        } catch (error) {
          console.error('Auth verification error:', error);
          await logout();
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, tenantId) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/api/auth/login', {
        email,
        password,
        tenantId
      });

      const { token, user, tenant } = response.data.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenant', JSON.stringify(tenant));

      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setTenant(tenant);

      toast.success('Login successful!');
      navigate('/dashboard');

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (tenantData, userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post('/api/auth/register-tenant', {
        tenant: tenantData,
        user: userData
      });

      const { token, user, tenant } = response.data.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenant', JSON.stringify(tenant));

      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update state
      setCurrentUser(user);
      setTenant(tenant);

      toast.success('Registration successful!');
      navigate('/dashboard');

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to logout from server
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');

      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];

      // Clear state
      setCurrentUser(null);
      setTenant(null);

      // Redirect to login
      navigate('/login');
    }
  };

  // Forgot password function
  const forgotPassword = async (email, tenantId) => {
    try {
      setError(null);
      setLoading(true);

      await axios.post('/api/auth/forgot-password', {
        email,
        tenantId
      });

      toast.success('If your email is registered, you will receive a password reset link');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to process request. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      setLoading(true);

      await axios.post('/api/auth/reset-password', {
        token,
        password
      });

      toast.success('Password has been reset successfully');
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);

      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.put(`/api/users/${currentUser._id}`, userData);
      const updatedUser = response.data.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setCurrentUser(updatedUser);

      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update tenant settings
  const updateTenantSettings = async (tenantData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.put(`/api/tenants/${tenant._id}/settings`, tenantData);
      const updatedTenant = response.data.data.tenant;

      // Update localStorage
      localStorage.setItem('tenant', JSON.stringify(updatedTenant));

      // Update state
      setTenant(updatedTenant);

      toast.success('Tenant settings updated successfully');
      return { success: true, tenant: updatedTenant };
    } catch (error) {
      console.error('Update tenant settings error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update tenant settings. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    tenant,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    updateTenantSettings,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isManager: currentUser?.role === 'manager' || currentUser?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};