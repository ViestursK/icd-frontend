
// Helper to safely decode JWT tokens
export function decodeToken(token) {
  if (!token) return null;

  try {
    // Split the token and get the payload part (second part)
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

// Extract user ID from JWT token
export function getUserIdFromToken(token) {
  if (!token) return null;

  const payload = decodeToken(token);
  return payload ? payload.user_id || payload.sub : null;
}

// Check if token is expired
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
}

// Get token expiration time in milliseconds
export function getTokenExpirationTime(token) {
  if (!token) return 0;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return 0;

  return payload.exp * 1000; // Convert seconds to milliseconds
}

// Get time remaining before token expires (in seconds)
export function getTokenTimeRemaining(token) {
  if (!token) return 0;

  const expirationTime = getTokenExpirationTime(token);
  const timeRemaining = expirationTime - Date.now();

  return Math.max(0, Math.floor(timeRemaining / 1000));
}

// Create and manage authentication state
export const createAuthState = () => {
  // Initialize auth state
  const getInitialState = () => {
    const token = localStorage.getItem("access_token");
    const isAuthenticated = !!token && !isTokenExpired(token);

    return {
      isAuthenticated,
      userId: isAuthenticated ? getUserIdFromToken(token) : null,
      loading: false,
      error: null,
    };
  };

  // Return the initial state
  return getInitialState();
};
