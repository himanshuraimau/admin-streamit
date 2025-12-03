import { Router } from 'express';
import { UserManagementController } from '../controllers/user-management.controller.js';
import { requireAuth } from '../middleware/jwt-auth.middleware.js'; // Using new JWT auth middleware

const router = Router();

// All routes require admin authentication
router.use(requireAuth);

// User management routes
router.get(
    '/',
    UserManagementController.getAllUsers
);

router.get(
    '/:userId',
    UserManagementController.getUserDetail
);

router.post(
    '/:userId/ban',
    UserManagementController.banUser
);

router.post(
    '/:userId/unban',
    UserManagementController.unbanUser
);

router.delete(
    '/:userId',
    UserManagementController.deleteUser
);

export default router;
