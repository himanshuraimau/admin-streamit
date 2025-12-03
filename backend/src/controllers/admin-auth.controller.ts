import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db.js';
import 'dotenv/config';
import ms from 'ms';

export class AdminAuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email and password are required' });
            }

            // 1. Find the admin by email (no longer looking up User)
            const admin = await prisma.admin.findUnique({
                where: { email },
            });

            if (!admin) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            // 2. Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            // 3. Generate JWT
            const jwtSecret = process.env.JWT_SECRET;
            const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

            if (!jwtSecret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }

            // @ts-ignore - JWT typing issue with expiresIn
            const token = jwt.sign(
                { adminId: admin.id },
                jwtSecret,
                { expiresIn: jwtExpiresIn }
            );

            // 4. Create a session record
            // @ts-ignore
            const expiresInMs = ms(jwtExpiresIn);
            const expirationDate = new Date(Date.now() + expiresInMs);

            await prisma.session.upsert({
                where: { sessionToken: token },
                update: { expires: expirationDate },
                create: {
                    sessionToken: token,
                    adminId: admin.id,
                    expires: expirationDate,
                },
            });

            // 5. Update login tracking
            await prisma.admin.update({
                where: { id: admin.id },
                data: {
                    lastLoginAt: new Date(),
                    loginCount: { increment: 1 },
                },
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                    },
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: 'Failed to log in' });
        }
    }

    static async getAdminProfile(req: Request, res: Response) {
        try {
            const adminRequest = req as any;

            if (!adminRequest.admin) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            const admin = await prisma.admin.findUnique({
                where: { id: adminRequest.admin.id },
            });

            if (!admin) {
                return res.status(404).json({ success: false, error: 'Admin profile not found' });
            }

            res.json({
                success: true,
                data: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                },
            });
        } catch (error) {
            console.error('Get admin profile error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch admin profile' });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ success: false, error: 'Token is required for logout' });
            }

            await prisma.session.deleteMany({
                where: { sessionToken: token },
            });

            res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ success: false, error: 'Failed to log out' });
        }
    }

    static async createAdmin(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ success: false, error: 'All fields are required' });
            }

            // Check if admin already exists
            const existingAdmin = await prisma.admin.findUnique({
                where: { email },
            });

            if (existingAdmin) {
                return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create admin
            const newAdmin = await prisma.admin.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                },
            });

            res.json({
                success: true,
                message: 'Admin created successfully',
                data: newAdmin,
            });
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({ success: false, error: 'Failed to create admin' });
        }
    }

    static async getAllAdmins(req: Request, res: Response) {
        try {
            const admins = await prisma.admin.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            res.json({
                success: true,
                data: admins,
            });
        } catch (error) {
            console.error('Get all admins error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch admins' });
        }
    }

    static async deleteAdmin(req: Request, res: Response) {
        try {
            const { adminId } = req.params;

            if (!adminId) {
                return res.status(400).json({ success: false, error: 'Admin ID is required' });
            }

            // Count total admins
            const adminCount = await prisma.admin.count();

            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete the last admin account'
                });
            }

            // Delete admin
            await prisma.admin.delete({
                where: { id: adminId },
            });

            res.json({
                success: true,
                message: 'Admin deleted successfully',
            });
        } catch (error) {
            console.error('Delete admin error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete admin' });
        }
    }
}
