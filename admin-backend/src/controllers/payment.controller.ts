import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service.js";
import { z } from "zod";

// Validation schemas
const paymentFilterSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const refundSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  note: z.string().optional(),
});

// Get all payments
export const getPayments = async (req: Request, res: Response) => {
  try {
    const params = paymentFilterSchema.parse(req.query);
    const result = await paymentService.getPayments(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }
    const payment = await paymentService.getPaymentById(id);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error("Get payment error:", error);
    
    if (error.message === "Payment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
    });
  }
};

// Process refund
export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }
    const data = refundSchema.parse(req.body);
    const adminId = req.user!.userId;

    const refunded = await paymentService.refundPayment(id, adminId, data);

    res.json({
      success: true,
      message: "Payment refunded successfully",
      data: refunded,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Refund payment error:", error);
    
    if (error.message.includes("not found") || error.message.includes("can be refunded")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to process refund",
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);

    const stats = await paymentService.getPaymentStats(params);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get payment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
    });
  }
};
