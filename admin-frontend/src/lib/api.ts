import axios from "axios";
import type {
  UserFilterParams,
  SuspendUserFormData,
  RejectApplicationFormData,
} from "@/types";

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or custom headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const adminApi = {
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
};

export default api;
