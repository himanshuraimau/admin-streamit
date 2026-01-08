import type { Request, Response } from "express";
import { discountService } from "../services/discount.service.js";
import { z } from "zod";

// Validation schemas
const createDiscountSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_]+$/, "Code must contain only uppercase letters, numbers, and underscores"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(1, "Discount value must be at least 1"),
  maxRedemptions: z.number().min(1).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional(),
  description: z.string().optional(),
});

const updateDiscountSchema = z.object({
  discountValue: z.number().min(1).optional(),
  maxRedemptions: z.number().min(1).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

// Get all discount codes
export const getDiscountCodes = async (req: Request, res: Response) => {
  try {
    const { page, limit, codeType, isActive, search } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (codeType) params.codeType = codeType as string;
    if (isActive !== undefined) params.isActive = isActive === "true";
    if (search) params.search = search as string;

    const result = await discountService.getDiscountCodes(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get discount codes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount codes",
    });
  }
};

// Get discount code by ID
export const getDiscountCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const code = await discountService.getDiscountCodeById(id);

    res.json({
      success: true,
      data: code,
    });
  } catch (error: any) {
    console.error("Get discount code error:", error);
    
    if (error.message === "Discount code not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch discount code",
    });
  }
};

// Create discount code
export const createDiscountCode = async (req: Request, res: Response) => {
  try {
    const data = createDiscountSchema.parse(req.body);
    const adminId = req.user!.id;

    const discountData: any = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    };

    const code = await discountService.createDiscountCode(adminId, discountData);

    res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      data: code,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Create discount code error:", error);
    
    if (error.message === "Discount code already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create discount code",
    });
  }
};

// Update discount code
export const updateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateDiscountSchema.parse(req.body);
    const adminId = req.user!.id;

    const updateData: any = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    };

    const code = await discountService.updateDiscountCode(id, adminId, updateData);

    res.json({
      success: true,
      message: "Discount code updated successfully",
      data: code,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Update discount code error:", error);
    
    if (error.message === "Discount code not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update discount code",
    });
  }
};

// Delete discount code
export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    await discountService.deleteDiscountCode(id, adminId);

    res.json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete discount code error:", error);
    
    if (error.message === "Discount code not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete discount code",
    });
  }
};

// Get redemption statistics
export const getRedemptionStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const params: any = {};
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);

    const stats = await discountService.getRedemptionStats(params);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get redemption stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch redemption statistics",
    });
  }
};
