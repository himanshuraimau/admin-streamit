import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
// We no longer need to import AdminRequest explicitly due to global augmentation

// Temporary workaround for ungenerated Prisma enums
type ContentType = any;
type ReportStatus = any;

export class ContentModerationController {
    static getReportDetail(req: Request, res: Response) {
        throw new Error('Method not implemented.');
    }
    // Get all content reports
    static async getReports(req: Request, res: Response) {
        try {
            const { page = 1, limit = 20, status, contentType } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (status) where.status = status as ReportStatus;
            if (contentType) where.contentType = contentType as ContentType;

            const [reports, total] = await Promise.all([
                prisma.contentReport.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        reporter: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                }),
                prisma.contentReport.count({ where }),
            ]);

            res.json({
                success: true,
                data: {
                    reports,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch reports',
            });
        }
    }

    // Review content report
    static async reviewReport(req: Request, res: Response) {
        try {
            const { reportId } = req.params;
            const { action, reviewNotes } = req.body;

            const report = await prisma.contentReport.update({
                where: { id: reportId! },
                data: {
                    status: 'RESOLVED',
                    reviewedAt: new Date(),
                    reviewedBy: req.admin!.id,
                    reviewNotes,
                    actionTaken: action,
                },
            });

            // Take action based on decision
            if (action === 'CONTENT_REMOVED') {
                if (report.contentType === 'POST') {
                    await prisma.post.update({
                        where: { id: report.contentId! },
                        data: {
                            isHidden: true,
                            hiddenReason: reviewNotes,
                            hiddenBy: req.admin!.id,
                            hiddenAt: new Date(),
                        },
                    });
                }
            }

            // Log action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin!.id,
                    action: 'POST_DELETED',
                    resource: report.contentType.toLowerCase(),
                    resourceId: report.contentId!,
                    details: { reportId, action, reviewNotes },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: 'Report reviewed successfully',
                data: report,
            });
        } catch (error) {
            console.error('Error reviewing report:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to review report',
            });
        }
    }

    // Delete post
    static async deletePost(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { reason } = req.body;

            await prisma.post.delete({
                where: { id: postId! },
            });

            // Log action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin!.id,
                    action: 'POST_DELETED',
                    resource: 'post',
                    resourceId: postId!,
                    details: { reason },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: 'Post deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete post',
            });
        }
    }

    // Hide post
    static async hidePost(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { reason } = req.body;

            const post = await prisma.post.update({
                where: { id: postId! },
                data: {
                    isHidden: true,
                    hiddenReason: reason,
                    hiddenBy: req.admin!.id,
                    hiddenAt: new Date(),
                },
            });

            // Log action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin!.id,
                    action: 'POST_HIDDEN',
                    resource: 'post',
                    resourceId: postId!,
                    details: { reason },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: 'Post hidden successfully',
                data: post,
            });
        } catch (error) {
            console.error('Error hiding post:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to hide post',
            });
        }
    }

    // Get all posts with filters
    static async getAllPosts(req: Request, res: Response) {
        try {
            const { page = 1, limit = 20, isHidden, authorId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (isHidden !== undefined) where.isHidden = isHidden === 'true';
            if (authorId) where.authorId = authorId;

            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            },
                        },
                        content: true,
                        isHidden: true,
                        hiddenReason: true,
                        hiddenBy: true,
                        hiddenAt: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true,
                            },
                        },
                    },
                }),
                prisma.post.count({ where }),
            ]);

            res.json({
                success: true,
                data: {
                    posts,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch posts',
            });
        }
    }
}
