import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as adminController from "../controllers/admin.controller.js";
import * as paymentController from "../controllers/payment.controller.js";
import * as giftController from "../controllers/gift.controller.js";
import * as discountController from "../controllers/discount.controller.js";
import * as contentController from "../controllers/content.controller.js";
import { ReportController } from "../controllers/report.controller.js";
import { LogController } from "../controllers/log.controller.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();

// Apply auth middleware first, then admin check to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard routes
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management routes
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/suspend", adminController.suspendUser);
router.patch("/users/:id/unsuspend", adminController.unsuspendUser);

// Creator application routes
router.get("/creators/applications", adminController.getCreatorApplications);
router.patch("/creators/applications/:id/approve", adminController.approveCreatorApplication);
router.patch("/creators/applications/:id/reject", adminController.rejectCreatorApplication);

// Payment management routes
router.get("/payments", paymentController.getPayments);
router.get("/payments/stats", paymentController.getPaymentStats);
router.get("/payments/:id", paymentController.getPaymentById);
router.post("/payments/:id/refund", paymentController.refundPayment);

// Virtual gift management routes
router.get("/gifts", giftController.getGifts);
router.get("/gifts/transactions", giftController.getGiftTransactions);
router.post("/gifts", giftController.createGift);
router.get("/gifts/:id", giftController.getGiftById);
router.patch("/gifts/:id", giftController.updateGift);
router.delete("/gifts/:id", giftController.deleteGift);

// Discount code management routes
router.get("/discounts", discountController.getDiscountCodes);
router.get("/discounts/stats", discountController.getRedemptionStats);
router.post("/discounts", discountController.createDiscountCode);
router.get("/discounts/:id", discountController.getDiscountCodeById);
router.patch("/discounts/:id", discountController.updateDiscountCode);
router.delete("/discounts/:id", discountController.deleteDiscountCode);

// Content moderation routes
router.get("/content/posts", contentController.getPosts);
router.patch("/content/posts/:id/visibility", contentController.togglePostVisibility);
router.delete("/content/posts/:id", contentController.deletePost);

router.get("/content/comments", contentController.getComments);
router.delete("/content/comments/:id", contentController.deleteComment);

router.get("/content/streams", contentController.getStreams);
router.post("/content/streams/:id/end", contentController.endStream);

// Reports management routes
router.get("/reports", ReportController.getReports);
router.get("/reports/stats", ReportController.getReportStats);
router.get("/reports/:id", ReportController.getReportById);
router.patch("/reports/:id/review", ReportController.reviewReport);
router.patch("/reports/:id/resolve", ReportController.resolveReport);
router.patch("/reports/:id/dismiss", ReportController.dismissReport);

// Admin activity logs routes
router.get("/logs", LogController.getAdminLogs);
router.get("/logs/stats", LogController.getActivityStats);
router.get("/logs/:id", LogController.getLogById);
router.get("/logs/user/:userId/timeline", LogController.getUserActivityTimeline);

// Analytics and reports routes
router.get("/analytics/overview", AnalyticsController.getPlatformOverview);
router.get("/analytics/revenue", AnalyticsController.getRevenueAnalytics);
router.get("/analytics/users", AnalyticsController.getUserAnalytics);
router.get("/analytics/content", AnalyticsController.getContentAnalytics);
router.get("/analytics/gifts", AnalyticsController.getGiftAnalytics);

export default router;
