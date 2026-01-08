import type { Request, Response } from "express";
import { z } from "zod";
import { analyticsService } from "../services/analytics.service.js";

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

export class AnalyticsController {
  // GET /api/admin/analytics/revenue - Get revenue analytics
  static async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const params = dateRangeSchema.parse(req.query);
      const analytics = await analyticsService.getRevenueAnalytics(params);
      res.json(analytics);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/analytics/users - Get user analytics
  static async getUserAnalytics(req: Request, res: Response) {
    try {
      const params = dateRangeSchema.parse(req.query);
      const analytics = await analyticsService.getUserAnalytics(params);
      res.json(analytics);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/analytics/content - Get content analytics
  static async getContentAnalytics(req: Request, res: Response) {
    try {
      const params = dateRangeSchema.parse(req.query);
      const analytics = await analyticsService.getContentAnalytics(params);
      res.json(analytics);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/analytics/gifts - Get gift analytics
  static async getGiftAnalytics(req: Request, res: Response) {
    try {
      const params = dateRangeSchema.parse(req.query);
      const analytics = await analyticsService.getGiftAnalytics(params);
      res.json(analytics);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/analytics/overview - Get platform overview
  static async getPlatformOverview(req: Request, res: Response) {
    try {
      const overview = await analyticsService.getPlatformOverview();
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
