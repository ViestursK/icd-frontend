import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authEvents } from '../api/api';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import { getUserIdFromToken } from '../utils/auth';
import { cacheService } from '../services/walletService';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // Initialize state
  const [authState, setAuthState] = useState({
    isAuthenticated: authService.isAuthenticated(),
    userId: authService.isAuthenticated() ? getUserIdFromToken(tokenService.getAccessToken()) : null,
    loading: false,
    error: null
  });

  // Handle auth events
  useEffect(() => {
    // Listen for auth events (like token expiration)
    const unsubscribe = authEvents.subscribe('logout', handleLogout);
    
    // Initialize token refresh when component mounts
    tokenService.initializeTokenRefresh();
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle login
  const login = useCallback(async (credentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await authService.login(credentials);
      const userId = getUserIdFromToken(data.access);
      
      // Update auth state
      setAuthState({
        isAuthenticated: true,
        userId,
        loading: false,
        error: null
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        loading: false,
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      }));
      
      return false;
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = useCallback(({ reason = 'user_initiated' } = {}) => {
    // Clear auth tokens
    authService.logout();
    
    // Clear user-specific cached data
    cacheService.clearUserCache();
    
    // Update auth state
    setAuthState({
      isAuthenticated: false,
      userId: null,
      loading: false,
      error: reason === 'token_expired' || reason === 'token_refresh_failed' 
        ? 'Your session expired. Please login again.' 
        : null
    });
    
    // Redirect to login page
    navigate('/login', { 
      state: { 
        from: window.location.pathname,
        message: reason === 'token_expired' || reason === 'token_refresh_failed'
          ? 'Your session expired. Please login again.' 
          : null
      } 
    });
  }, [navigate]);

  // Manual logout
  const logout = useCallback(() => {
    handleLogout({ reason: 'user_initiated' });
  }, [handleLogout]);

  // Handle register
  const register = useCallback(async (userData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.register(userData);
      
      // Don't automatically log in after registration
      setAuthState(prev => ({ ...prev, loading: false }));
      
      // Redirect to login page
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in with your new account.' 
        } 
      });
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev,
        loading: false,
        error: error.response?.data?.detail || 'Registration failed. Please try again.' 
      }));
      
      return false;
    }
  }, [navigate]);

  // Clear any auth errors
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Provide auth context value
  const contextValue = {
    ...authState,
    login,
    logout,
    register,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;