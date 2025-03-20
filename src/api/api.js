import axios from "axios";

const API_URL = "https://iscryptodead.loca.lt/";  // Backend API base URL

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the access token to the headers
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Attempt to refresh the token
        const refreshResponse = await axios.post(`${API_URL}/api/users/token/refresh/`);
        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem("access_token", newAccessToken);
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // Clear token and redirect to login on failure
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
