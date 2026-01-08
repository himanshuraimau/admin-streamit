// Const enum values (compile-time only, no runtime overhead)
export const UserRole = {
  USER: "USER",
  CREATOR: "CREATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ReportStatus = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ReportReason = {
  SPAM: "SPAM",
  HARASSMENT: "HARASSMENT",
  HATE_SPEECH: "HATE_SPEECH",
  NUDITY: "NUDITY",
  VIOLENCE: "VIOLENCE",
  COPYRIGHT: "COPYRIGHT",
  MISINFORMATION: "MISINFORMATION",
  SELF_HARM: "SELF_HARM",
  OTHER: "OTHER",
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export const AdminAction = {
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_UNSUSPENDED: "USER_UNSUSPENDED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_DELETED: "USER_DELETED",
  POST_HIDDEN: "POST_HIDDEN",
  POST_UNHIDDEN: "POST_UNHIDDEN",
  POST_DELETED: "POST_DELETED",
  COMMENT_HIDDEN: "COMMENT_HIDDEN",
  COMMENT_DELETED: "COMMENT_DELETED",
  CREATOR_APPLICATION_APPROVED: "CREATOR_APPLICATION_APPROVED",
  CREATOR_APPLICATION_REJECTED: "CREATOR_APPLICATION_REJECTED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  DISCOUNT_CODE_CREATED: "DISCOUNT_CODE_CREATED",
  DISCOUNT_CODE_UPDATED: "DISCOUNT_CODE_UPDATED",
  DISCOUNT_CODE_DELETED: "DISCOUNT_CODE_DELETED",
  GIFT_CREATED: "GIFT_CREATED",
  GIFT_UPDATED: "GIFT_UPDATED",
  GIFT_DELETED: "GIFT_DELETED",
  REPORT_REVIEWED: "REPORT_REVIEWED",
  REPORT_DISMISSED: "REPORT_DISMISSED",
  STREAM_ENDED: "STREAM_ENDED",
  SETTING_UPDATED: "SETTING_UPDATED",
} as const;
export type AdminAction = (typeof AdminAction)[keyof typeof AdminAction];

export const PurchaseStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const PostType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  POLL: "POLL",
} as const;
export type PostType = (typeof PostType)[keyof typeof PostType];

// API Response types
export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationResult;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// User types
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  isSuspended: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isSuspended?: boolean;
}

// Report types
export interface Report {
  reported: unknown;
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  description: string | null;
  postId: string | null;
  commentId: string | null;
  streamId: string | null;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolution: string | null;
  createdAt: string;
  reporter?: User;
  reportedUser?: User;
  post?: Post;
  comment?: Comment;
}

export interface ReportFilterParams {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  reason?: ReportReason;
  reporterId?: string;
  reportedUserId?: string;
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  underReviewReports: number;
  reportsByReason: Array<{
    reason: ReportReason;
    count: number;
  }>;
}

export interface ResolveReportInput {
  resolution: string;
  action?: string;
}

export interface DismissReportInput {
  reason: string;
}

// Admin Activity Log types
export interface AdminActivityLog {
  id: string;
  action: AdminAction;
  adminUserId: string;
  affectedUserId: string | null;
  targetType: string | null;
  targetId: string | null;
  description: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  admin?: User;
  affectedUser?: User;
}

export interface LogFilterParams {
  page?: number;
  limit?: number;
  adminId?: string;
  affectedUserId?: string;
  action?: AdminAction;
  targetType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminActivityStats {
  totalActions: number;
  actionsByType: Array<{
    action: AdminAction;
    count: number;
  }>;
  actionsByAdmin: Array<{
    adminId: string;
    count: number;
  }>;
  recentActions: AdminActivityLog[];
}

// Payment types
export interface Payment {
  buyer: unknown;
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: string;
  user?: User;
  package?: CoinPackage;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  isActive: boolean;
}

export interface PaymentFilterParams {
  page?: number;
  limit?: number;
  status?: PurchaseStatus;
  userId?: string;
  search?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  refundedTransactions: number;
}

export interface RefundPaymentInput {
  reason: string;
}

// Gift types
export interface Gift {
  id: string;
  name: string;
  imageUrl: string;
  animationUrl: string | null;
  coinPrice: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  senderId: string;
  receiverId: string;
  coinAmount: number;
  postId: string | null;
  streamId: string | null;
  createdAt: string;
  gift?: Gift;
  sender?: User;
  receiver?: User;
}

export interface CreateGiftInput {
  name: string;
  imageUrl: string;
  animationUrl?: string;
  coinPrice: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateGiftInput {
  name?: string;
  imageUrl?: string;
  animationUrl?: string;
  coinPrice?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// Discount code types
export interface DiscountCode {
  maxUses: number | null;
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeInput {
  code: string;
  type: DiscountType;
  value: number;
  maxRedemptions?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateDiscountCodeInput {
  type?: DiscountType;
  value?: number;
  maxRedemptions?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface DiscountRedemptionStats {
  totalRedemptions: number;
  activeCodes: number;
  expiredCodes: number;
  topCodes: Array<{
    code: DiscountCode;
    redemptions: number;
  }>;
}

// Content types
export interface Post {
  id: string;
  content: string;
  type: PostType;
  authorId: string;
  isHidden: boolean;
  isFlagged: boolean;
  createdAt: string;
  author?: User;
  media?: Array<{ id: string; url: string; type: string }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  isHidden: boolean;
  createdAt: string;
  author?: User;
  user?: User;
  post?: {
    id: string;
    content: string;
  };
}

export interface Stream {
  id: string;
  title: string;
  streamerId: string;
  isLive: boolean;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  streamer?: User;
  _count?: {
    viewers: number;
  };
}

export interface ContentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  isHidden?: boolean;
  isFlagged?: boolean;
  authorId?: string;
}

export interface ToggleVisibilityInput {
  reason: string;
}

export interface DeleteContentInput {
  reason: string;
}

// Analytics types
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  revenueBreakdown: Array<{
    package: CoinPackage | null;
    revenue: number;
    transactions: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
  dailySignups: Array<{
    date: string;
    signups: number;
  }>;
  suspendedUsers: number;
}

export interface ContentAnalytics {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  postsByType: Array<{
    type: PostType;
    count: number;
  }>;
  hiddenPosts: number;
  flaggedPosts: number;
  dailyPosts: Array<{
    date: string;
    posts: number;
  }>;
}

export interface GiftAnalytics {
  totalGiftsSent: number;
  totalCoinsSpent: number;
  giftBreakdown: Array<{
    gift: Gift | null;
    count: number;
    totalCoins: number;
  }>;
  topReceivers: Array<{
    user: User | null;
    giftsReceived: number;
    coinsEarned: number;
  }>;
}

export interface PlatformOverview {
  totalUsers: number;
  activeCreators: number;
  totalRevenue: number;
  pendingReports: number;
  recentActivity: AdminActivityLog[];
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalCreators: number;
  activeStreams: number;
  totalRevenue: number;
  pendingApplications: number;
  suspendedUsers: number;
  timestamp: string;
}

// Creator Application types
export interface CreatorApplication {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user?: User;
}

// Form types for frontend
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SuspendUserFormData {
  reason: string;
  duration?: number;
}

export interface RejectApplicationFormData {
  reason: string;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
