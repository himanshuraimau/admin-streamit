import { Router } from 'express';
import { CreatorReviewController } from '../controllers/creator-review.controller.js';
import { requireAuth } from '../middleware/jwt-auth.middleware.js'; // Using new JWT auth middleware

const router = Router();

router.use(requireAuth);

router.get(
  '/pending',
  CreatorReviewController.getPendingApplications
);

router.get(
  '/applications/:applicationId',
  CreatorReviewController.getApplicationDetail
);

router.post(
  '/applications/:applicationId/review',
  CreatorReviewController.reviewApplication
);

export default router;
