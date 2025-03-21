// utils/auth.js

export function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.sub;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
