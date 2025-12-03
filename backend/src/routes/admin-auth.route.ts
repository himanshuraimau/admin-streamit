import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller.js';
import { requireAuth } from '../middleware/jwt-auth.middleware.js';

const router = Router();

// Admin login route (public)
router.post('/login', AdminAuthController.login);

// Admin profile route (protected)
router.get('/me', requireAuth, AdminAuthController.getAdminProfile);

// Admin logout route (protected)
router.post('/logout', requireAuth, AdminAuthController.logout);

// Create new admin (protected)
router.post('/register', requireAuth, AdminAuthController.createAdmin);

// List all admins (protected)
router.get('/list', requireAuth, AdminAuthController.getAllAdmins);

// Delete admin (protected)
router.delete('/:adminId', requireAuth, AdminAuthController.deleteAdmin);

export default router;
