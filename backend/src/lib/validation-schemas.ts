import { z } from 'zod';

// ============================================
// Admin Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const createAdminSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const logoutSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

// ============================================
// User Management Schemas
// ============================================

export const userIdParamSchema = z.object({
    userId: z.string().cuid('Invalid user ID format'),
});

export const banUserSchema = z.object({
    reason: z.string().min(5, 'Ban reason must be at least 5 characters'),
    banType: z.enum(['TEMPORARY', 'PERMANENT'], {
        errorMap: () => ({ message: 'Ban type must be TEMPORARY or PERMANENT' }),
    }),
    expiresAt: z.string().datetime().optional(),
}).refine(
    (data) => {
        if (data.banType === 'TEMPORARY' && !data.expiresAt) {
            return false;
        }
        return true;
    },
    {
        message: 'expiresAt is required for temporary bans',
        path: ['expiresAt'],
    }
).refine(
    (data) => {
        if (data.expiresAt) {
            const expirationDate = new Date(data.expiresAt);
            return expirationDate > new Date();
        }
        return true;
    },
    {
        message: 'expiresAt must be in the future',
        path: ['expiresAt'],
    }
);

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export const userFiltersSchema = paginationSchema.extend({
    search: z.string().optional(),
    isBanned: z.enum(['true', 'false']).optional(),
    hasCreatorApp: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Creator Review Schemas
// ============================================

export const applicationIdParamSchema = z.object({
    applicationId: z.string().cuid('Invalid application ID format'),
});

export const reviewApplicationSchema = z.object({
    action: z.enum(['approve', 'reject'], {
        errorMap: () => ({ message: 'Action must be either "approve" or "reject"' }),
    }),
    notes: z.string().optional(),
}).refine(
    (data) => {
        if (data.action === 'reject' && (!data.notes || data.notes.trim().length === 0)) {
            return false;
        }
        return true;
    },
    {
        message: 'Notes are required when rejecting an application',
        path: ['notes'],
    }
);

// ============================================
// Content Moderation Schemas
// ============================================

export const reportIdParamSchema = z.object({
    reportId: z.string().cuid('Invalid report ID format'),
});

export const postIdParamSchema = z.object({
    postId: z.string().cuid('Invalid post ID format'),
});

export const reviewReportSchema = z.object({
    action: z.enum([
        'NO_ACTION',
        'WARNING_SENT',
        'CONTENT_REMOVED',
        'USER_SUSPENDED',
        'USER_BANNED',
    ], {
        errorMap: () => ({ message: 'Invalid moderation action' }),
    }),
    reviewNotes: z.string().min(5, 'Review notes must be at least 5 characters'),
});

export const contentFiltersSchema = paginationSchema.extend({
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']).optional(),
    contentType: z.enum(['POST', 'COMMENT', 'STREAM', 'USER_PROFILE']).optional(),
});

export const deletePostSchema = z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const hidePostSchema = z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

// ============================================
// Analytics Schemas
// ============================================

export const userGrowthQuerySchema = z.object({
    days: z.coerce.number().min(1).max(365).default(30),
});

// ============================================
// Helper function to validate and parse
// ============================================

export function validateSchema<T>(
    schema: z.ZodSchema<T>,
    data: any
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
