// src/services/tokenService.js - FIXED VERSION

import { decodeToken, getTokenExpirationTime } from "../utils/auth";

// Constants
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiration

// Token refresh timer
let refreshTimer = null;
let initializationPromise = null; // Prevent multiple initializations

// Listeners for token events
const listeners = {
  onRefresh: [],
  onExpired: [],
};

// Add event listeners
export const addTokenListener = (event, callback) => {
  if (listeners[event]) {
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter((cb) => cb !== callback);
    };
  }
  return () => {};
};

// Notify listeners
const notifyListeners = (event, data = {}) => {
  if (listeners[event]) {
    listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in token listener for ${event}:`, error);
      }
    });
  }
};

// Get tokens
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Set tokens and schedule refresh
export const setTokens = (accessToken, refreshToken = null) => {
  // Store the access token
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  // Store the refresh token if provided
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Schedule token refresh
  scheduleTokenRefresh(accessToken);
};

// Clear tokens and cancel refresh
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  // Clear the refresh timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Reset initialization promise
  initializationPromise = null;
};

// Calculate time until token needs refreshing
export const getTimeUntilRefresh = (token) => {
  if (!token) return 0;

  const expiryTime = getTokenExpirationTime(token);
  if (!expiryTime) return 0;

  // Time left until we should refresh (5 min before expiry)
  return Math.max(0, expiryTime - Date.now() - REFRESH_BEFORE_EXPIRY_MS);
};

// Get remaining valid time for token
export const getRemainingTokenTime = (token) => {
  if (!token) return 0;

  const expiryTime = getTokenExpirationTime(token);
  if (!expiryTime) return 0;

  return Math.max(0, expiryTime - Date.now());
};

// Schedule token refresh
export const scheduleTokenRefresh = (token) => {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!token) return;

  // Get time until we need to refresh
  const timeUntilRefresh = getTimeUntilRefresh(token);

  if (timeUntilRefresh <= 0) {
    // Token is already expired or close to expiry, don't schedule, let the app handle it
    console.log("Token is expired, not scheduling refresh");
    return;
  }

  // Set timer to refresh before token expires
  refreshTimer = setTimeout(() => {
    console.log("Scheduled token refresh triggered");
    notifyListeners("onRefresh");
  }, timeUntilRefresh);

  console.log(
    `Token refresh scheduled in ${Math.round(
      timeUntilRefresh / 1000 / 60
    )} minutes`
  );
};

// Check if token is valid (not expired)
export const isTokenValid = (token) => {
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  return getRemainingTokenTime(token) > 0;
};

// Initialize token management on app start - FIXED VERSION
export const initializeTokenRefresh = () => {
  // Prevent multiple simultaneous initializations
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise((resolve) => {
    try {
      const token = getAccessToken();

      if (!token) {
        console.log("No access token found");
        resolve(false);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded) {
        console.log("Invalid access token, clearing tokens");
        clearTokens();
        resolve(false);
        return;
      }

      const remainingTime = getRemainingTokenTime(token);
      const timeUntilRefresh = getTimeUntilRefresh(token);

      console.log(
        `Token expires in ${Math.round(remainingTime / 1000 / 60)} minutes`
      );

      if (remainingTime <= 0) {
        // Token is completely expired
        console.log("Token is expired");
        resolve(false);
        return;
      }

      if (timeUntilRefresh > 0) {
        // Token is valid and not close to expiry, schedule refresh
        scheduleTokenRefresh(token);
        resolve(true);
        return;
      } else {
        // Token is close to expiry but not expired, still valid
        console.log("Token is close to expiry but still valid");
        resolve(true);
        return;
      }
    } catch (error) {
      console.error("Error in token initialization:", error);
      clearTokens();
      resolve(false);
    }
  });

  return initializationPromise;
};

// Reset initialization state
export const resetInitialization = () => {
  initializationPromise = null;
};

// Create a default export object with all the functions
const tokenService = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  initializeTokenRefresh,
  addTokenListener,
  getTimeUntilRefresh,
  getRemainingTokenTime,
  scheduleTokenRefresh,
  isTokenValid,
  resetInitialization,
};

export default tokenService;
