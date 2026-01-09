import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/db.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify the user is authenticated via JWT
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
      return;
    }

    // Fetch user from database to ensure they still exist and aren't suspended
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({
        success: false,
        message: "Account suspended",
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Middleware to verify the user has admin role (ADMIN or SUPER_ADMIN)
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // requireAuth must be called before this middleware
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - Please login",
    });
    return;
  }

  // Check if user has admin role
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden - Admin access required",
    });
    return;
  }

  next();
}

/**
 * Middleware to verify the user has super admin role
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // requireAuth must be called before this middleware
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - Please login",
    });
    return;
  }

  // Check if user has super admin role
  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden - Super admin access required",
    });
    return;
  }

  next();
}
