// Enums from Prisma schema
export enum UserRole {
  USER = "USER",
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum ReportStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum ReportReason {
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  NUDITY = "NUDITY",
  VIOLENCE = "VIOLENCE",
  COPYRIGHT = "COPYRIGHT",
  MISINFORMATION = "MISINFORMATION",
  SELF_HARM = "SELF_HARM",
  OTHER = "OTHER",
}

export enum AdminAction {
  USER_SUSPENDED = "USER_SUSPENDED",
  USER_UNSUSPENDED = "USER_UNSUSPENDED",
  USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
  USER_DELETED = "USER_DELETED",
  POST_HIDDEN = "POST_HIDDEN",
  POST_UNHIDDEN = "POST_UNHIDDEN",
  POST_DELETED = "POST_DELETED",
  COMMENT_HIDDEN = "COMMENT_HIDDEN",
  COMMENT_DELETED = "COMMENT_DELETED",
  CREATOR_APPLICATION_APPROVED = "CREATOR_APPLICATION_APPROVED",
  CREATOR_APPLICATION_REJECTED = "CREATOR_APPLICATION_REJECTED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  DISCOUNT_CODE_CREATED = "DISCOUNT_CODE_CREATED",
  DISCOUNT_CODE_UPDATED = "DISCOUNT_CODE_UPDATED",
  DISCOUNT_CODE_DELETED = "DISCOUNT_CODE_DELETED",
  GIFT_CREATED = "GIFT_CREATED",
  GIFT_UPDATED = "GIFT_UPDATED",
  GIFT_DELETED = "GIFT_DELETED",
  REPORT_REVIEWED = "REPORT_REVIEWED",
  REPORT_DISMISSED = "REPORT_DISMISSED",
  STREAM_ENDED = "STREAM_ENDED",
  SETTING_UPDATED = "SETTING_UPDATED",
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum PostType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  POLL = "POLL",
}

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

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

// User types
export interface UserBasic {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
}

export interface UserDetail extends UserBasic {
  role: UserRole;
  phone: string | null;
  bio: string | null;
  isSuspended: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFilterParams extends PaginationParams {
  search?: string;
  role?: UserRole;
  isSuspended?: boolean;
}

// Report types
export interface ReportBasic {
  id: string;
  reason: ReportReason;
  status: ReportStatus;
  description: string | null;
  createdAt: Date;
}

export interface ReportDetail extends ReportBasic {
  reporterId: string;
  reportedUserId: string;
  postId: string | null;
  commentId: string | null;
  streamId: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  resolution: string | null;
  reporter: UserBasic;
  reportedUser: UserBasic;
  post?: any;
  comment?: any;
}

export interface ReportFilterParams extends PaginationParams {
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

// Admin Activity Log types
export interface AdminActivityLog {
  id: string;
  action: AdminAction;
  adminUserId: string;
  affectedUserId: string | null;
  targetType: string | null;
  targetId: string | null;
  description: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
  admin?: UserBasic;
  affectedUser?: UserBasic;
}

export interface LogFilterParams extends PaginationParams {
  adminId?: string;
  affectedUserId?: string;
  action?: AdminAction;
  targetType?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
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
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: Date;
  user?: UserBasic;
  package?: CoinPackage;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  isActive: boolean;
}

export interface PaymentFilterParams extends PaginationParams {
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

// Gift types
export interface Gift {
  id: string;
  name: string;
  imageUrl: string;
  animationUrl: string | null;
  coinPrice: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  senderId: string;
  receiverId: string;
  coinAmount: number;
  postId: string | null;
  streamId: string | null;
  createdAt: Date;
  gift?: Gift;
  sender?: UserBasic;
  receiver?: UserBasic;
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
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountCodeInput {
  code: string;
  type: DiscountType;
  value: number;
  maxRedemptions?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface UpdateDiscountCodeInput {
  type?: DiscountType;
  value?: number;
  maxRedemptions?: number;
  startsAt?: Date;
  expiresAt?: Date;
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
  createdAt: Date;
  author?: UserBasic;
  media?: any[];
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
  createdAt: Date;
  user?: UserBasic;
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
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  streamer?: UserBasic;
  _count?: {
    viewers: number;
  };
}

export interface ContentFilterParams extends PaginationParams {
  search?: string;
  isHidden?: boolean;
  isFlagged?: boolean;
  authorId?: string;
}

// Analytics types
export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
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
    date: Date;
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
    date: Date;
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
    date: Date;
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
    user: UserBasic | null;
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
  totalRevenue: number;
  activeCreators: number;
  pendingReports: number;
  newUsersToday: number;
  revenueToday: number;
  suspendedUsers: number;
  pendingApplications: number;
}

// Creator Application types
export interface CreatorApplication {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user?: UserDetail;
}
