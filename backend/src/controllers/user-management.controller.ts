import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
// We no longer need to import AdminRequest explicitly due to global augmentation

export class UserManagementController {
    static deleteUser(arg0: string, deleteUser: any) {
        throw new Error('Method not implemented.');
    }
    // Get all users with pagination and filters
    static async getAllUsers(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                isBanned,
                hasCreatorApp,
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            // Build where clause
            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                    { username: { contains: search as string, mode: 'insensitive' } },
                ];
            }

            if (isBanned !== undefined) {
                where.isBanned = isBanned === 'true';
            }

            if (hasCreatorApp === 'true') {
                where.creatorApplication = { isNot: null };
            }

            // Get users
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { [sortBy as string]: sortOrder },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        image: true,
                        emailVerified: true,
                        isBanned: true,
                        bannedUntil: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                posts: true,
                                following: true,
                                followedBy: true,
                            },
                        },
                        creatorApplication: {
                            select: {
                                status: true,
                            },
                        },
                    },
                }),
                prisma.user.count({ where }),
            ]);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users',
            });
        }
    }

    // Get user details
    static async getUserDetail(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const user = await prisma.user.findUnique({
                where: { id: userId! },
                include: {
                    creatorApplication: {
                        // Removed identity, financial, profile includes, assuming they are not direct fields
                    },
                    // Removed stream include as it's not a direct relation on User
                    bans: {
                        where: { isActive: true },
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            posts: true,
                            following: true,
                            followedBy: true,
                        },
                    },
                },
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error('Error fetching user detail:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user detail',
            });
        }
    }

    // Ban user
    static async banUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { reason, banType, expiresAt } = req.body;

            // Create ban record
            const ban = await prisma.userBan.create({
                data: {
                    userId: userId!,
                    reason,
                    banType,
                    expiresAt: banType === 'TEMPORARY' ? new Date(expiresAt) : null,
                    bannedBy: req.admin?.id!,
                },
            });

            // Update user status
            await prisma.user.update({
                where: { id: userId! },
                data: {
                    isBanned: true,
                    bannedUntil: ban.expiresAt,
                },
            });

            // Log admin action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin?.id!,
                    action: 'USER_BANNED',
                    resource: 'user',
                    resourceId: userId!,
                    details: { reason, banType, expiresAt },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: 'User banned successfully',
                data: ban,
            });
        } catch (error) {
            console.error('Error banning user:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to ban user',
            });
        }
    }

    // Unban user
    static async unbanUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            // Deactivate all active bans
            await prisma.userBan.updateMany({
                where: {
                    userId: userId!,
                    isActive: true,
                },
                data: {
                    isActive: false,
                    liftedAt: new Date(),
                    liftedBy: req.admin?.id!,
                },
            });

            // Update user status
            await prisma.user.update({
                where: { id: userId! },
                data: {
                    isBanned: false,
                    bannedUntil: null,
                },
            });

            // Log admin action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin?.id!,
                    action: 'USER_UNBANNED',
                    resource: 'user',
                    resourceId: userId!,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: 'User unbanned successfully',
            });
        } catch (error) {
            console.error('Error unbanning user:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to unban user',
            });
        }
    }
}
