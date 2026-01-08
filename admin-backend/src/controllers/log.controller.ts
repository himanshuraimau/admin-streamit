import type { Request, Response } from "express";
import { z } from "zod";
import { logService } from "../services/log.service.js";

// Validation schemas
const logFilterSchema = z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
    adminId: z.string().optional(),
    affectedUserId: z.string().optional(),
    action: z.string().optional(),
    targetType: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

const activityStatsSchema = z.object({
    adminId: z.string().optional(),
    startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export class LogController {
    // GET /api/admin/logs - Get admin activity logs
    static async getAdminLogs(req: Request, res: Response) {
        try {
            const params = logFilterSchema.parse(req.query);
            const result = await logService.getAdminLogs(params);
            res.json(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // GET /api/admin/logs/:id - Get log by ID
    static async getLogById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Log ID is required",
                });
            }
            const log = await logService.getLogById(id);
            res.json(log);
        } catch (error: any) {
            if (error.message === "Log not found") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // GET /api/admin/logs/stats - Get admin activity statistics
    static async getActivityStats(req: Request, res: Response) {
        try {
            const params = activityStatsSchema.parse(req.query);
            const stats = await logService.getAdminActivityStats(params);
            res.json(stats);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: "Validation failed", details: error.issues });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // GET /api/admin/logs/user/:userId/timeline - Get activity timeline for a specific user
    static async getUserActivityTimeline(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const result = await logService.getUserActivityTimeline(userId, { page, limit });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
