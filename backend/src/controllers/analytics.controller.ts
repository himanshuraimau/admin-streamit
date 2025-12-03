import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
import type { Request as AdminRequest } from 'express';

// Temporary workaround for ungenerated Prisma enums
type CreatorApplicationStatus = any;
type ReportStatus = any;

export class AnalyticsController {
    static getContentStats(arg0: string, getContentStats: any) {
        throw new Error('Method not implemented.');
    }
    static getCreatorStats(arg0: string, getCreatorStats: any) {
        throw new Error('Method not implemented.');
    }
    // Dashboard overview stats
    static async getDashboardStats(req: AdminRequest, res: Response) {
        try {
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const [
                totalUsers,
                newUsersLast30Days,
                totalCreators,
                pendingApplications,
                totalPosts,
                totalReports,
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({
                    where: { createdAt: { gte: last30Days } },
                }),
                prisma.creatorApplication.count({
                    where: { status: 'APPROVED' },
                }),
                prisma.creatorApplication.count({
                    where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
                }),
                prisma.post.count(),
                prisma.contentReport.count({
                    where: { status: 'PENDING' },
                }),
            ]);

            res.json({
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        new: newUsersLast30Days,
                    },
                    creators: {
                        total: totalCreators,
                        pending: pendingApplications,
                    },
                    content: {
                        totalPosts,
                    },
                    moderation: {
                        pendingReports: totalReports,
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch dashboard stats',
            });
        }
    }

    // User growth over time
    static async getUserGrowth(req: AdminRequest, res: Response) {
        try {
            const { days = 30 } = req.query;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Number(days));

            const users = await prisma.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate },
                },
                _count: true,
            });

            // Format data for charts
            const growth = users.map((item: { createdAt: { toISOString: () => string; }; _count: any; }) => ({
                date: item.createdAt.toISOString().split('T')[0],
                count: item._count,
            }));

            res.json({
                success: true,
                data: growth,
            });
        } catch (error) {
            console.error('Error fetching user growth:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user growth',
            });
        }
    }
}
