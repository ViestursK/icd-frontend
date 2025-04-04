import { decodeToken, getTokenExpirationTime } from "../utils/auth";

// Constants
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiration

// Token refresh timer
let refreshTimer = null;

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
    listeners[event].forEach((callback) => callback(data));
  }
};

// Get tokens
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Set tokens and schedule refresh
export const setTokens = (accessToken, refreshToken = null) => {
  // Store the access token
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

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
};

// Calculate time until token needs refreshing
export const getTimeUntilRefresh = (token) => {
  if (!token) return 0;

  const expiryTime = getTokenExpirationTime(token);
  // Time left until we should refresh (5 min before expiry)
  return Math.max(0, expiryTime - Date.now() - REFRESH_BEFORE_EXPIRY_MS);
};

// Get remaining valid time for token
export const getRemainingTokenTime = (token) => {
  if (!token) return 0;

  const expiryTime = getTokenExpirationTime(token);
  return Math.max(0, expiryTime - Date.now());
};

// Schedule token refresh
export const scheduleTokenRefresh = (token) => {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Get time until we need to refresh
  const timeUntilRefresh = getTimeUntilRefresh(token);

  if (timeUntilRefresh <= 0) {
    // Token is already expired or close to expiry, refresh now
    notifyListeners("onExpired");
    return;
  }

  // Set timer to refresh before token expires
  refreshTimer = setTimeout(() => {
    notifyListeners("onRefresh");
  }, timeUntilRefresh);

  // Log when the token will be refreshed
  console.log(
    `Token refresh scheduled in ${Math.floor(timeUntilRefresh / 60000)} minutes`
  );
};

// Initialize token management on app start
export const initializeTokenRefresh = () => {
  const token = getAccessToken();
  if (token) {
    const decoded = decodeToken(token);

    if (decoded) {
      // Check if token is valid
      if (getTimeUntilRefresh(token) > 0) {
        // Schedule refresh
        scheduleTokenRefresh(token);
        return true;
      } else {
        // Token is expired or about to expire, trigger refresh now
        notifyListeners("onExpired");
      }
    } else {
      // Invalid token, clear it
      clearTokens();
    }
  }
  return false;
};

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  initializeTokenRefresh,
  addTokenListener,
};
