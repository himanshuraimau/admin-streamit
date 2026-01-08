import type { Request, Response } from "express";
import { giftService } from "../services/gift.service.js";
import { z } from "zod";

// Validation schemas
const createGiftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  coinPrice: z.number().min(1, "Coin price must be at least 1"),
  imageUrl: z.url("Valid image URL required"),
  animationUrl: z.url().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const updateGiftSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  coinPrice: z.number().min(1).optional(),
  imageUrl: z.url().optional(),
  animationUrl: z.url().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// Get all gifts
export const getGifts = async (req: Request, res: Response) => {
  try {
    const { page, limit, isActive } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (isActive !== undefined) params.isActive = isActive === "true";

    const result = await giftService.getGifts(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get gifts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gifts",
    });
  }
};

// Get gift by ID
export const getGiftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id) {
      return res.status(400).json({
        success: false,
        message: "Gift ID is required",
      });
    }
    const gift = await giftService.getGiftById(id);

    res.json({
      success: true,
      data: gift,
    });
  } catch (error: any) {
    console.error("Get gift error:", error);
    
    if (error.message === "Gift not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch gift",
    });
  }
};

// Create new gift
export const createGift = async (req: Request, res: Response) => {
  try {
    const data = createGiftSchema.parse(req.body);
    const adminId = req.user!.id;

    const gift = await giftService.createGift(adminId, data);

    res.status(201).json({
      success: true,
      message: "Gift created successfully",
      data: gift,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Create gift error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create gift",
    });
  }
};

// Update gift
export const updateGift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateGiftSchema.parse(req.body);
    const adminId = req.user!.id;
    if(!id) {
      return res.status(400).json({
        success: false,
        message: "Gift ID is required",
      });
    }
    const gift = await giftService.updateGift(id, adminId, data);

    res.json({
      success: true,
      message: "Gift updated successfully",
      data: gift,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Update gift error:", error);
    
    if (error.message === "Gift not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update gift",
    });
  }
};

// Delete gift
export const deleteGift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if(!id) {
      return res.status(400).json({
        success: false,
        message: "Gift ID is required",
      });
    }
    const adminId = req.user!.id;

    await giftService.deleteGift(id, adminId);

    res.json({
      success: true,
      message: "Gift deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete gift error:", error);
    
    if (error.message === "Gift not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete gift",
    });
  }
};

// Get gift transactions
export const getGiftTransactions = async (req: Request, res: Response) => {
  try {
    const { page, limit, giftId, senderId, receiverId } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (giftId) params.giftId = giftId as string;
    if (senderId) params.senderId = senderId as string;
    if (receiverId) params.receiverId = receiverId as string;

    const result = await giftService.getGiftTransactions(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get gift transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gift transactions",
    });
  }
};
