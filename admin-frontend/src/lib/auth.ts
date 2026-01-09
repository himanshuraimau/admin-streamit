/**
 * Auth utility functions for JWT token management
 */

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Save auth token to localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Save user data to localStorage
 */
export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
  removeAuthToken();
}

/**
 * Check if user has admin role
 */
export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

/**
 * Check if user has super admin role
 */
export function isSuperAdmin(): boolean {
  const user = getUser();
  return user?.role === "SUPER_ADMIN";
}

