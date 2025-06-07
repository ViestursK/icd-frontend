// src/services/authService.js - FIXED VERSION

import axios from "axios";
import tokenService from "./tokenService";
import { isTokenExpired } from "../utils/auth";

// Get API base URL from environment variables
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://icd-backend-production-api.onrender.com/";

// Create a base axios instance without interceptors
const baseAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout for auth requests
});

// Flag to track when a refresh is in progress to prevent multiple simultaneous refreshes
let refreshInProgress = false;
let refreshPromise = null;

// Login user
export const login = async (credentials) => {
  try {
    console.log("Attempting login...");
    const response = await baseAxios.post("/api/users/token/", credentials);
    const { access, refresh } = response.data;

    if (!access || !refresh) {
      throw new Error("Invalid response: missing tokens");
    }

    // Store tokens
    tokenService.setTokens(access, refresh);

    console.log("Login successful");
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    console.log("Attempting registration...");
    const response = await baseAxios.post("/api/users/register/", userData);
    console.log("Registration successful");
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

// Refresh access token
export const refreshToken = async () => {
  // If a refresh is already in progress, return the existing promise
  if (refreshInProgress && refreshPromise) {
    console.log("Refresh already in progress, waiting...");
    return refreshPromise;
  }

  const refreshTokenValue = tokenService.getRefreshToken();

  if (!refreshTokenValue) {
    const error = new Error("No refresh token available");
    console.error("Refresh failed: No refresh token");
    throw error;
  }

  // Set the flag and create a promise
  refreshInProgress = true;

  refreshPromise = (async () => {
    try {
      console.log("Attempting token refresh...");

      const response = await baseAxios.post("/api/users/token/refresh/", {
        refresh: refreshTokenValue,
      });

      if (!response.data.access) {
        throw new Error("Invalid refresh response: missing access token");
      }

      // Update access token (keep existing refresh token)
      tokenService.setTokens(response.data.access);

      console.log("Token refresh successful");
      return response.data.access;
    } catch (error) {
      console.error("Token refresh failed:", error);

      // If refresh fails, clear all tokens
      tokenService.clearTokens();

      // Re-throw the error for proper handling upstream
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
  console.log("Logging out user");
  tokenService.clearTokens();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = tokenService.getAccessToken();
  const isValid = !!token && !isTokenExpired(token);
  console.log("Authentication check:", isValid);
  return isValid;
};

// Export a default object with all the functions
const authService = {
  login,
  register,
  refreshToken,
  logout,
  isAuthenticated,
  isTokenExpired,
};

export default authService;
