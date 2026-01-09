import axios from "axios";
import { getAuthToken, clearAuth } from "./auth";
import type {
  UserFilterParams,
  SuspendUserFormData,
  RejectApplicationFormData,
  PaymentFilterParams,
  RefundPaymentInput,
  CreateGiftInput,
  UpdateGiftInput,
  CreateDiscountCodeInput,
  UpdateDiscountCodeInput,
  ContentFilterParams,
  ToggleVisibilityInput,
  DeleteContentInput,
  ReportFilterParams,
  ResolveReportInput,
  DismissReportInput,
  LogFilterParams,
  DateRangeParams,
} from "@/types";

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Clear auth and redirect to login if unauthorized
      clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const adminApi = {
  // Authentication
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  me: () => api.get("/api/auth/me"),
  register: (data: { email: string; username: string; password: string; name?: string; role?: string }) =>
    api.post("/api/auth/register", data),

  // Dashboard
  getDashboardStats: () => api.get("/api/admin/dashboard/stats"),

  // Users
  getUsers: (params?: UserFilterParams) => api.get("/api/admin/users", { params }),
  getUserById: (id: string) => api.get(`/api/admin/users/${id}`),
  suspendUser: (id: string, data: SuspendUserFormData) =>
    api.patch(`/api/admin/users/${id}/suspend`, data),
  unsuspendUser: (id: string, data: { note?: string }) =>
    api.patch(`/api/admin/users/${id}/unsuspend`, data),

  // Creator Applications
  getCreatorApplications: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get("/api/admin/creators/applications", { params }),
  approveCreatorApplication: (id: string, data: { note?: string }) =>
    api.patch(`/api/admin/creators/applications/${id}/approve`, data),
  rejectCreatorApplication: (id: string, data: RejectApplicationFormData) =>
    api.patch(`/api/admin/creators/applications/${id}/reject`, data),

  // Payments
  getPayments: (params?: PaymentFilterParams) => api.get("/api/admin/payments", { params }),
  getPaymentById: (id: string) => api.get(`/api/admin/payments/${id}`),
  refundPayment: (id: string, data: RefundPaymentInput) =>
    api.post(`/api/admin/payments/${id}/refund`, data),
  getPaymentStats: () => api.get("/api/admin/payments/stats"),

  // Gifts
  getGifts: (params?: { page?: number; limit?: number }) => api.get("/api/admin/gifts", { params }),
  getGiftById: (id: string) => api.get(`/api/admin/gifts/${id}`),
  createGift: (data: CreateGiftInput) => api.post("/api/admin/gifts", data),
  updateGift: (id: string, data: UpdateGiftInput) => api.patch(`/api/admin/gifts/${id}`, data),
  deleteGift: (id: string) => api.delete(`/api/admin/gifts/${id}`),
  getGiftTransactions: (params?: { page?: number; limit?: number }) =>
    api.get("/api/admin/gifts/transactions", { params }),

  // Discount Codes
  getDiscountCodes: (params?: { page?: number; limit?: number }) =>
    api.get("/api/admin/discounts", { params }),
  getDiscountCodeById: (id: string) => api.get(`/api/admin/discounts/${id}`),
  createDiscountCode: (data: CreateDiscountCodeInput) => api.post("/api/admin/discounts", data),
  updateDiscountCode: (id: string, data: UpdateDiscountCodeInput) =>
    api.patch(`/api/admin/discounts/${id}`, data),
  deleteDiscountCode: (id: string) => api.delete(`/api/admin/discounts/${id}`),
  getDiscountStats: () => api.get("/api/admin/discounts/stats"),

  // Content Moderation
  getPosts: (params?: ContentFilterParams) => api.get("/api/admin/content/posts", { params }),
  togglePostVisibility: (id: string, data: ToggleVisibilityInput) =>
    api.patch(`/api/admin/content/posts/${id}/visibility`, data),
  deletePost: (id: string, data: DeleteContentInput) =>
    api.delete(`/api/admin/content/posts/${id}`, { data }),
  getComments: (params?: ContentFilterParams) =>
    api.get("/api/admin/content/comments", { params }),
  deleteComment: (id: string, data: DeleteContentInput) =>
    api.delete(`/api/admin/content/comments/${id}`, { data }),
  getStreams: (params?: ContentFilterParams) => api.get("/api/admin/content/streams", { params }),
  endStream: (id: string, data: DeleteContentInput) =>
    api.post(`/api/admin/content/streams/${id}/end`, data),

  // Reports
  getReports: (params?: ReportFilterParams) => api.get("/api/admin/reports", { params }),
  getReportById: (id: string) => api.get(`/api/admin/reports/${id}`),
  reviewReport: (id: string) => api.patch(`/api/admin/reports/${id}/review`),
  resolveReport: (id: string, data: ResolveReportInput) =>
    api.patch(`/api/admin/reports/${id}/resolve`, data),
  dismissReport: (id: string, data: DismissReportInput) =>
    api.patch(`/api/admin/reports/${id}/dismiss`, data),
  getReportStats: (params?: DateRangeParams) => api.get("/api/admin/reports/stats", { params }),

  // Activity Logs
  getAdminLogs: (params?: LogFilterParams) => api.get("/api/admin/logs", { params }),
  getLogById: (id: string) => api.get(`/api/admin/logs/${id}`),
  getActivityStats: (params?: DateRangeParams) => api.get("/api/admin/logs/stats", { params }),
  getUserActivityTimeline: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/admin/logs/user/${userId}/timeline`, { params }),

  // Analytics
  getPlatformOverview: () => api.get("/api/admin/analytics/overview"),
  getRevenueAnalytics: (params?: DateRangeParams) =>
    api.get("/api/admin/analytics/revenue", { params }),
  getUserAnalytics: (params?: DateRangeParams) =>
    api.get("/api/admin/analytics/users", { params }),
  getContentAnalytics: (params?: DateRangeParams) =>
    api.get("/api/admin/analytics/content", { params }),
  getGiftAnalytics: (params?: DateRangeParams) =>
    api.get("/api/admin/analytics/gifts", { params }),
};

export default api;


