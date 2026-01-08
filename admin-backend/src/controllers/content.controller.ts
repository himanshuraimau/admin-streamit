import type { Request, Response } from "express";
import { contentService } from "../services/content.service.js";
import { z } from "zod";

// Validation schemas
const toggleVisibilitySchema = z.object({
  isHidden: z.boolean(),
  reason: z.string().min(10).optional(),
});

const deleteContentSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

// Get posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page, limit, isHidden, isFlagged, authorId, search } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (isHidden !== undefined) params.isHidden = isHidden === "true";
    if (isFlagged !== undefined) params.isFlagged = isFlagged === "true";
    if (authorId) params.authorId = authorId as string;
    if (search) params.search = search as string;

    const result = await contentService.getPosts(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// Toggle post visibility
export const togglePostVisibility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = toggleVisibilitySchema.parse(req.body);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    
    const adminId: string = req.user.id;

    const post = await contentService.togglePostVisibility(id, adminId, data);

    res.json({
      success: true,
      message: data.isHidden ? "Post hidden successfully" : "Post unhidden successfully",
      data: post,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Toggle post visibility error:", error);
    
    if (error.message === "Post not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update post visibility",
    });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = deleteContentSchema.parse(req.body);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    
    const adminId: string = req.user.id;

    await contentService.deletePost(id, adminId, reason);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Delete post error:", error);
    
    if (error.message === "Post not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

// Get comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { page, limit, postId, userId, search } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (postId) params.postId = postId as string;
    if (userId) params.userId = userId as string;
    if (search) params.search = search as string;

    const result = await contentService.getComments(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = deleteContentSchema.parse(req.body);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    
    const adminId: string = req.user.id;

    await contentService.deleteComment(id, adminId, reason);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("Delete comment error:", error);
    
    if (error.message === "Comment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

// Get streams
export const getStreams = async (req: Request, res: Response) => {
  try {
    const { page, limit, isLive, userId, search } = req.query;

    const params: any = {};
    if (page) params.page = parseInt(page as string);
    if (limit) params.limit = parseInt(limit as string);
    if (isLive !== undefined) params.isLive = isLive === "true";
    if (userId) params.userId = userId as string;
    if (search) params.search = search as string;

    const result = await contentService.getStreams(params);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get streams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch streams",
    });
  }
};

// End stream (force stop)
export const endStream = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = deleteContentSchema.parse(req.body);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Stream ID is required",
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    
    const adminId: string = req.user.id;

    const stream = await contentService.endStream(id, adminId, reason);

    res.json({
      success: true,
      message: "Stream ended successfully",
      data: stream,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    console.error("End stream error:", error);
    
    if (error.message === "Stream not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to end stream",
    });
  }
};
