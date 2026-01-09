/**
 * Authentication utilities
 * This file exports JWT-based authentication functions
 */

export { generateToken, verifyToken, decodeToken } from "./jwt.js";
export type { JWTPayload } from "./jwt.js";
