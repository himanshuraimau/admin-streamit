import { z } from "zod";

// User Management Validations
export const suspendUserSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  duration: z.enum(["TEMPORARY", "PERMANENT"]).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const unsuspendUserSchema = z.object({
  note: z.string().optional(),
});

export const updateUserNotesSchema = z.object({
  adminNotes: z.string(),
});

// Creator Application Validations
export const approveCreatorSchema = z.object({
  note: z.string().optional(),
});

export const rejectCreatorSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

// Pagination & Filtering Validations
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const userFilterSchema = paginationSchema.extend({
  role: z.enum(["USER", "CREATOR", "ADMIN", "SUPER_ADMIN"]).optional(),
  isSuspended: z.coerce.boolean().optional(),
});

export const creatorApplicationFilterSchema = paginationSchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

// Types
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type UnsuspendUserInput = z.infer<typeof unsuspendUserSchema>;
export type UpdateUserNotesInput = z.infer<typeof updateUserNotesSchema>;
export type ApproveCreatorInput = z.infer<typeof approveCreatorSchema>;
export type RejectCreatorInput = z.infer<typeof rejectCreatorSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type CreatorApplicationFilterInput = z.infer<typeof creatorApplicationFilterSchema>;
