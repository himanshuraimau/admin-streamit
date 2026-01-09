import type { Request, Response } from "express";
import { adminService } from "../services/admin.service.js";
import {
  suspendUserSchema,
  unsuspendUserSchema,
  userFilterSchema,
  approveCreatorSchema,
  rejectCreatorSchema,
  creatorApplicationFilterSchema,
} from "../lib/validations/admin.validation.js";
import { ZodError } from "zod";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard statistics",
    });
  }
}

/**
 * Get users list with pagination and filters
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const filters = userFilterSchema.parse(req.query);
    const result = await adminService.getUsers(filters);

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues,
      });
      return;
    }

    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
}

/**
 * Get single user details
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }
    const user = await adminService.getUserById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    console.error("Get user by id error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
}

/**
 * Suspend a user
 */
export async function suspendUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }
    const adminId = req.user!.userId;
    const input = suspendUserSchema.parse(req.body);

    const user = await adminService.suspendUser(id, adminId, input);

    res.json({
      success: true,
      message: "User suspended successfully",
      data: user,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: error.issues,
      });
      return;
    }

    if (error.message === "User not found") {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    if (error.message === "Cannot suspend super admin") {
      res.status(403).json({
        success: false,
        error: "Cannot suspend super admin",
      });
      return;
    }

    console.error("Suspend user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to suspend user",
    });
  }
}

/**
 * Unsuspend a user
 */
export async function unsuspendUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }
    const adminId = req.user!.userId;
    const input = unsuspendUserSchema.parse(req.body);

    const user = await adminService.unsuspendUser(id, adminId, input);

    res.json({
      success: true,
      message: "User unsuspended successfully",
      data: user,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: error.issues,
      });
      return;
    }

    if (error.message === "User not found") {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    if (error.message === "User is not suspended") {
      res.status(400).json({
        success: false,
        error: "User is not suspended",
      });
      return;
    }

    console.error("Unsuspend user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unsuspend user",
    });
  }
}

/**
 * Get creator applications
 */
export async function getCreatorApplications(req: Request, res: Response) {
  try {
    const filters = creatorApplicationFilterSchema.parse(req.query);
    const result = await adminService.getCreatorApplications(filters);

    res.json({
      success: true,
      data: result.applications,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues,
      });
      return;
    }

    console.error("Get creator applications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch creator applications",
    });
  }
}

/**
 * Approve creator application
 */
export async function approveCreatorApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
      return;
    }
    const adminId = req.user!.userId;
    const input = approveCreatorSchema.parse(req.body);

    const application = await adminService.approveCreatorApplication(id, adminId, input);

    res.json({
      success: true,
      message: "Creator application approved successfully",
      data: application,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: error.issues,
      });
      return;
    }

    if (error.message === "Application not found") {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    if (error.message === "Application is not pending") {
      res.status(400).json({
        success: false,
        error: "Application is not pending",
      });
      return;
    }

    console.error("Approve creator application error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve creator application",
    });
  }
}

/**
 * Reject creator application
 */
export async function rejectCreatorApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
      return;
    }
    const adminId = req.user!.userId;
    const input = rejectCreatorSchema.parse(req.body);

    const application = await adminService.rejectCreatorApplication(id, adminId, input);

    res.json({
      success: true,
      message: "Creator application rejected successfully",
      data: application,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: error.issues,
      });
      return;
    }

    if (error.message === "Application not found") {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    if (error.message === "Application is not pending") {
      res.status(400).json({
        success: false,
        error: "Application is not pending",
      });
      return;
    }

    console.error("Reject creator application error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reject creator application",
    });
  }
}
