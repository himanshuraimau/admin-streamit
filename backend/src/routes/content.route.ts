import { Router } from 'express';
import { ContentModerationController } from '../controllers/content-moderation.controller.js';
import { requireAuth } from '../middleware/jwt-auth.middleware.js'; // Using new JWT auth middleware

const router = Router();

router.use(requireAuth);

// Content reports
router.get(
  '/reports',
  ContentModerationController.getReports
);

router.get(
  '/reports/:reportId',
  ContentModerationController.getReportDetail
);

router.post(
  '/reports/:reportId/review',
  ContentModerationController.reviewReport
);

// Content management
router.get(
  '/posts',
  ContentModerationController.getAllPosts
);

router.delete(
  '/posts/:postId',
  ContentModerationController.deletePost
);

router.patch(
  '/posts/:postId/hide',
  ContentModerationController.hidePost
);

export default router;
