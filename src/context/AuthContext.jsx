// src/context/AuthContext.jsx - FIXED VERSION

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { authEvents } from "../api/api";
import authService from "../services/authService";
import tokenService from "../services/tokenService";
import { getUserIdFromToken } from "../utils/auth";
import { cacheService } from "../services/walletService";

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const initializationRef = useRef(false);

  // Initialize state more safely
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userId: null,
    loading: false,
    initialChecking: true,
    error: null,
  });

  // Safe token validation
  const validateCurrentToken = useCallback(() => {
    try {
      const token = tokenService.getAccessToken();
      if (!token) return false;

      return tokenService.isTokenValid(token);
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }, []);

  // Handle logout with improved error handling
  const handleLogout = useCallback(
    ({ reason = "user_initiated" } = {}) => {
      try {
        console.log("Logout triggered:", reason);

        // Clear auth tokens
        authService.logout();

        // Clear user-specific cached data
        cacheService.clearUserCache();

        // Update auth state
        setAuthState({
          isAuthenticated: false,
          userId: null,
          loading: false,
          initialChecking: false,
          error:
            reason === "token_expired" || reason === "token_refresh_failed"
              ? "Your session expired. Please login again."
              : null,
        });

        // Reset token service initialization
        tokenService.resetInitialization();

        // Navigate to login page
        navigate("/login", {
          state: {
            from: window.location.pathname,
            message:
              reason === "token_expired" || reason === "token_refresh_failed"
                ? "Your session expired. Please login again."
                : null,
          },
        });
      } catch (error) {
        console.error("Error during logout:", error);
        // Force navigation even if logout fails
        navigate("/login");
      }
    },
    [navigate]
  );

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      console.log("Initializing authentication...");

      setAuthState((prev) => ({ ...prev, initialChecking: true, error: null }));

      // Check if we have a valid token
      const isValidToken = validateCurrentToken();

      if (isValidToken) {
        // Initialize token refresh system
        const initResult = await tokenService.initializeTokenRefresh();

        if (initResult) {
          const token = tokenService.getAccessToken();
          const userId = getUserIdFromToken(token);

          setAuthState({
            isAuthenticated: true,
            userId,
            loading: false,
            initialChecking: false,
            error: null,
          });

          console.log("Authentication initialized successfully");
        } else {
          // Token initialization failed, user needs to login
          setAuthState({
            isAuthenticated: false,
            userId: null,
            loading: false,
            initialChecking: false,
            error: null,
          });

          console.log("Token initialization failed");
        }
      } else {
        // No valid token, user needs to login
        tokenService.clearTokens();

        setAuthState({
          isAuthenticated: false,
          userId: null,
          loading: false,
          initialChecking: false,
          error: null,
        });

        console.log("No valid token found");
      }
    } catch (error) {
      console.error("Error during auth initialization:", error);

      // Clear potentially corrupted tokens
      tokenService.clearTokens();

      setAuthState({
        isAuthenticated: false,
        userId: null,
        loading: false,
        initialChecking: false,
        error:
          "Authentication initialization failed. Please try refreshing the page.",
      });
    }
  }, [validateCurrentToken]);

  // One-time initialization on component mount
  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      if (!mounted) return;

      // Set up logout event listener first
      const unsubscribeLogout = authEvents.subscribe("logout", handleLogout);

      // Set up token refresh listener
      const unsubscribeRefresh = tokenService.addTokenListener(
        "onRefresh",
        async () => {
          if (!mounted) return;

          try {
            console.log("Token refresh triggered");
            await authService.refreshToken();
          } catch (error) {
            console.error("Token refresh failed:", error);
            if (mounted) {
              handleLogout({ reason: "token_refresh_failed" });
            }
          }
        }
      );

      // Set up token expired listener
      const unsubscribeExpired = tokenService.addTokenListener(
        "onExpired",
        async () => {
          if (!mounted) return;

          try {
            console.log("Token expired event triggered");
            await authService.refreshToken();
          } catch (error) {
            console.error("Token refresh after expiry failed:", error);
            if (mounted) {
              handleLogout({ reason: "token_expired" });
            }
          }
        }
      );

      // Initialize authentication state
      await initializeAuth();

      return () => {
        unsubscribeLogout();
        unsubscribeRefresh();
        unsubscribeExpired();
      };
    };

    setupAuth().then((cleanup) => {
      if (!mounted && cleanup) cleanup();
    });

    return () => {
      mounted = false;
    };
  }, [handleLogout, initializeAuth]);

  // Handle login with improved error handling
  const login = useCallback(
    async (credentials) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await authService.login(credentials);
        const userId = getUserIdFromToken(data.access);

        // Reset initialization flag
        initializationRef.current = false;

        // Update auth state
        setAuthState({
          isAuthenticated: true,
          userId,
          loading: false,
          initialChecking: false,
          error: null,
        });

        // Initialize token refresh for the new tokens
        await tokenService.initializeTokenRefresh();

        // Redirect to dashboard
        navigate("/dashboard");

        return true;
      } catch (error) {
        console.error("Login failed:", error);
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
          initialChecking: false,
          error:
            error.response?.data?.detail ||
            "Login failed. Please check your credentials.",
        }));

        return false;
      }
    },
    [navigate]
  );

  // Manual logout
  const logout = useCallback(() => {
    handleLogout({ reason: "user_initiated" });
  }, [handleLogout]);

  // Handle register
  const register = useCallback(
    async (userData) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await authService.register(userData);

        setAuthState((prev) => ({
          ...prev,
          loading: false,
          initialChecking: false,
        }));

        // Redirect to login page
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please log in with your new account.",
          },
        });

        return true;
      } catch (error) {
        console.error("Registration failed:", error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          initialChecking: false,
          error:
            error.response?.data?.detail ||
            "Registration failed. Please try again.",
        }));

        return false;
      }
    },
    [navigate]
  );

  // Clear any auth errors
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Provide auth context value
  const contextValue = {
    ...authState,
    login,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
