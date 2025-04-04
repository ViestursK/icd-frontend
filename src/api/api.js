import axios from "axios";
import tokenService from "../services/tokenService";
import authService from "../services/authService";

// API URL from environment variables
const API_URL =
  import.meta.env.VITE_API_URL
// Create a centralized event emitter for auth state changes
export const authEvents = {
  listeners: {},
  subscribe: (event, callback) => {
    if (!authEvents.listeners[event]) {
      authEvents.listeners[event] = [];
    }
    authEvents.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      authEvents.listeners[event] = authEvents.listeners[event].filter(
        (cb) => cb !== callback
      );
    };
  },
  emit: (event, data) => {
    if (authEvents.listeners[event]) {
      authEvents.listeners[event].forEach((callback) => callback(data));
    }
  },
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers = [];

// Helper to add to retry queue
const subscribeToTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper to process retry queue
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Helper to reject all requests in the queue
const onTokenRefreshFailed = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

// Add a request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for token management and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors that weren't from a token refresh request
    // and weren't already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("token/refresh")
    ) {
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      // If a refresh is already in progress, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeToTokenRefresh((newToken, tokenError) => {
            if (tokenError) {
              return reject(tokenError);
            }

            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(axios(originalRequest));
            } else {
              // No new token means auth failed
              authEvents.emit("logout", { reason: "token_refresh_failed" });
              reject(new Error("Token refresh failed"));
            }
          });
        });
      }

      // Start token refresh process if not already in progress
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const newToken = await authService.refreshToken();
        isRefreshing = false;

        // Update request headers with new token
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Process queued requests
        onTokenRefreshed(newToken);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        isRefreshing = false;

        // Notify all queued requests about failure
        onTokenRefreshFailed(refreshError);

        // Emit logout event
        authEvents.emit("logout", { reason: "token_expired" });

        return Promise.reject(refreshError);
      }
    }

    // Return error for all other cases
    return Promise.reject(error);
  }
);

// Initialize token refresh schedule when the module loads
tokenService.initializeTokenRefresh();

// Set up token refresh listener
tokenService.addTokenListener("onRefresh", async () => {
  try {
    await authService.refreshToken();
    console.log("Token refreshed successfully");
  } catch (error) {
    console.error("Auto token refresh failed:", error);
    authEvents.emit("logout", { reason: "token_refresh_failed" });
  }
});

// Set up token expired listener
tokenService.addTokenListener("onExpired", async () => {
  try {
    await authService.refreshToken();
    console.log("Expired token refreshed successfully");
  } catch (error) {
    console.error("Expired token refresh failed:", error);
    authEvents.emit("logout", { reason: "token_expired" });
  }
});

export default api;
