import axios from "axios";
import tokenService from "./tokenService";
import { isTokenExpired } from "../utils/auth";

// Get API base URL from environment variables
const API_URL =
  import.meta.env.VITE_API_URL 

// Create a base axios instance without interceptors
const baseAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track when a refresh is in progress to prevent multiple simultaneous refreshes
let refreshInProgress = false;
let refreshPromise = null;

// Login user
export const login = async (credentials) => {
  try {
    const response = await baseAxios.post("/api/users/token/", credentials);
    const { access, refresh } = response.data;

    // Store tokens
    tokenService.setTokens(access, refresh);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await baseAxios.post("/api/users/register/", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Refresh access token
export const refreshToken = async () => {
  // If a refresh is already in progress, return the existing promise
  if (refreshInProgress && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Set the flag and create a promise
  refreshInProgress = true;
  refreshPromise = (async () => {
    try {
      const response = await baseAxios.post("/api/users/token/refresh/", {
        refresh: refreshToken,
      });

      // Update access token
      tokenService.setTokens(response.data.access);

      return response.data.access;
    } catch (error) {
      // If refresh fails, clear tokens
      tokenService.clearTokens();
      throw error;
    } finally {
      // Reset the flags
      refreshInProgress = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Logout user
export const logout = () => {
  tokenService.clearTokens();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = tokenService.getAccessToken();
  return !!token && !isTokenExpired(token);
};

export default {
  login,
  register,
  refreshToken,
  logout,
  isAuthenticated,
  isTokenExpired,
};
