import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/db.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to verify the user is authenticated
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized - Please login",
      });
      return;
    }

    // Fetch full user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuspended: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({
        success: false,
        error: "Account suspended",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Middleware to verify the user has admin role (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First check if user is authenticated
    await requireAuth(req, res, () => {});

    if (!req.user) {
      // requireAuth already sent response
      return;
    }

    // Check if user has admin role
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        error: "Forbidden - Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Middleware to verify the user has super admin role
 */
export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First check if user is authenticated
    await requireAuth(req, res, () => {});

    if (!req.user) {
      // requireAuth already sent response
      return;
    }

    // Check if user has super admin role
    if (req.user.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        error: "Forbidden - Super admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
