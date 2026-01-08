import type { Request, Response } from "express";
import { z } from "zod";
import { reportService } from "../services/report.service.js";

// Validation schemas
const reportFilterSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  status: z.enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
  reason: z
    .enum([
      "SPAM",
      "HARASSMENT",
      "HATE_SPEECH",
      "NUDITY",
      "VIOLENCE",
      "COPYRIGHT",
      "MISINFORMATION",
      "SELF_HARM",
      "OTHER",
    ])
    .optional(),
  reporterId: z.string().optional(),
  reportedUserId: z.string().optional(),
});

const resolveReportSchema = z.object({
  resolution: z.string().min(10, "Resolution must be at least 10 characters"),
  action: z.string().optional(),
});

const dismissReportSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export class ReportController {
  // GET /api/admin/reports - Get all reports
  static async getReports(req: Request, res: Response) {
    try {
      const params = reportFilterSchema.parse(req.query);
      const result = await reportService.getReports(params);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/reports/:id - Get report by ID
  static async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await reportService.getReportById(id);
      res.json(report);
    } catch (error: any) {
      if (error.message === "Report not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // PATCH /api/admin/reports/:id/review - Mark report as under review
  static async reviewReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const report = await reportService.reviewReport(id, adminId);
      res.json(report);
    } catch (error: any) {
      if (error.message === "Report not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // PATCH /api/admin/reports/:id/resolve - Resolve report
  static async resolveReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const data = resolveReportSchema.parse(req.body);

      const report = await reportService.resolveReport(id, adminId, data);
      res.json(report);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else if (error.message === "Report not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // PATCH /api/admin/reports/:id/dismiss - Dismiss report
  static async dismissReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { reason } = dismissReportSchema.parse(req.body);

      const report = await reportService.dismissReport(id, adminId, reason);
      res.json(report);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.errors });
      } else if (error.message === "Report not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // GET /api/admin/reports/stats - Get report statistics
  static async getReportStats(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await reportService.getReportStats({ startDate, endDate });
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
