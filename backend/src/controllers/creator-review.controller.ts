import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
// We no longer need to import AdminRequest explicitly due to global augmentation

export class CreatorReviewController {
    // Get application detail
    static async getApplicationDetail(req: Request, res: Response) {
        try {
            const { applicationId } = req.params;

            const application = await prisma.creatorApplication.findUnique({
                where: { id: applicationId! },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            username: true,
                            image: true,
                        },
                    },
                },
            });

            if (!application) {
                return res.status(404).json({
                    success: false,
                    error: 'Application not found',
                });
            }

            res.json({
                success: true,
                data: application,
            });
        } catch (error) {
            console.error('Error fetching application detail:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch application detail',
            });
        }
    }

    // Get pending applications
    static async getPendingApplications(req: Request, res: Response) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const [applications, total] = await Promise.all([
                prisma.creatorApplication.findMany({
                    where: {
                        status: { in: ['PENDING', 'UNDER_REVIEW'] },
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { submittedAt: 'asc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                            },
                        },
                    },
                }),
                prisma.creatorApplication.count({
                    where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
                }),
            ]);

            res.json({
                success: true,
                data: {
                    applications,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch applications',
            });
        }
    }

    // Review application
    static async reviewApplication(req: Request, res: Response) {
        try {
            const { applicationId } = req.params;
            const { action, notes } = req.body; // action: 'approve' | 'reject'

            const application = await prisma.creatorApplication.findUnique({
                where: { id: applicationId! },
            });

            if (!application) {
                return res.status(404).json({
                    success: false,
                    error: 'Application not found',
                });
            }

            // Update application
            const updatedApp = await prisma.creatorApplication.update({
                where: { id: applicationId! },
                data: {
                    status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                    reviewedAt: new Date(),
                    reviewedBy: req.admin?.id, // Use optional chaining
                    reviewNotes: notes,
                    rejectionReason: action === 'reject' ? notes : null,
                },
            });

            // Log admin action
            await prisma.adminAction.create({
                data: {
                    adminId: req.admin?.id!,
                    action:
                        action === 'approve'
                            ? 'APPLICATION_APPROVED'
                            : 'APPLICATION_REJECTED',
                    resource: 'creator_application',
                    resourceId: applicationId!,
                    details: { notes },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });

            res.json({
                success: true,
                message: `Application ${action}d successfully`,
                data: updatedApp,
            });
        } catch (error) {
            console.error('Error reviewing application:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to review application',
            });
        }
    }
}
