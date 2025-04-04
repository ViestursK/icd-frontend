import axios from "axios";
import tokenService from "./tokenService";

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
});

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
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await baseAxios.post("/api/users/token/refresh/", {
      refresh: refreshToken,
    });

    // Update access token
    tokenService.setTokens(response.data.access);

    return response.data.access;
  } catch (error) {
    // If refresh fails, clear tokens and throw error
    tokenService.clearTokens();
    throw error;
  }
};

// Logout user
export const logout = () => {
  tokenService.clearTokens();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = tokenService.getAccessToken();
  return !!token;
};

export default {
  login,
  register,
  refreshToken,
  logout,
  isAuthenticated,
};
