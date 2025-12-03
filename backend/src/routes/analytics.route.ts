import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/jwt-auth.middleware.js'; // Using new JWT auth middleware

const router = Router();

router.use(requireAuth);

router.get(
  '/dashboard',
  AnalyticsController.getDashboardStats
);

router.get(
  '/users/growth',
  AnalyticsController.getUserGrowth
);

router.get(
  '/creators/stats',
  AnalyticsController.getCreatorStats
);

router.get(
  '/content/stats',
  AnalyticsController.getContentStats
);

export default router;
