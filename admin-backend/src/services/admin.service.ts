import { prisma } from "../lib/db.js";
import type {
  SuspendUserInput,
  UnsuspendUserInput,
  UserFilterInput,
  ApproveCreatorInput,
  RejectCreatorInput,
  CreatorApplicationFilterInput,
} from "../lib/validations/admin.validation.js";

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalCreators,
      activeStreams,
      totalRevenue,
      pendingApplications,
      suspendedUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total creators (approved)
      prisma.creatorApplication.count({
        where: { status: "APPROVED" },
      }),
      
      // Active streams
      prisma.stream.count({
        where: { isLive: true },
      }),
      
      // Total revenue from coin purchases
      prisma.coinPurchase.aggregate({
        _sum: { amount: true },
      }),
      
      // Pending creator applications
      prisma.creatorApplication.count({
        where: { status: "PENDING" },
      }),
      
      // Suspended users
      prisma.user.count({
        where: { isSuspended: true },
      }),
    ]);

    return {
      totalUsers,
      totalCreators,
      activeStreams,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingApplications,
      suspendedUsers,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get paginated user list with filters
   */
  async getUsers(filters: UserFilterInput) {
    const { page = 1, limit = 20, search, role, isSuspended, sortBy = "createdAt", sortOrder = "desc" } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isSuspended !== undefined) {
      where.isSuspended = isSuspended;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          isSuspended: true,
          suspendedReason: true,
          suspendedAt: true,
          createdAt: true,
          lastLoginAt: true,
          image: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single user details
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorApplication: true,
        stream: true,
        coinWallet: true,
        _count: {
          select: {
            posts: true,
            following: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: string, adminId: string, input: SuspendUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "SUPER_ADMIN") {
      throw new Error("Cannot suspend super admin");
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedReason: input.reason,
        suspendedBy: adminId,
        suspendedAt: new Date(),
        suspensionExpiresAt: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuspended: true,
        suspendedReason: true,
        suspendedAt: true,
        suspensionExpiresAt: true,
      },
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: "USER_SUSPENDED",
      targetType: "USER",
      targetId: userId,
      details: {
        reason: input.reason,
        duration: input.duration,
        expiresAt,
      },
    });

    return updatedUser;
  }

  /**
   * Unsuspend a user
   */
  async unsuspendUser(userId: string, adminId: string, input: UnsuspendUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isSuspended) {
      throw new Error("User is not suspended");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedReason: null,
        suspendedBy: null,
        suspendedAt: null,
        suspensionExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuspended: true,
      },
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: "USER_UNSUSPENDED",
      targetType: "USER",
      targetId: userId,
      details: {
        note: input.note,
      },
    });

    return updatedUser;
  }

  /**
   * Get creator applications with filters
   */
  async getCreatorApplications(filters: CreatorApplicationFilterInput) {
    const { page = 1, limit = 20, search, status, sortBy = "createdAt", sortOrder = "desc" } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [applications, total] = await Promise.all([
      prisma.creatorApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.creatorApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve creator application
   */
  async approveCreatorApplication(applicationId: string, adminId: string, input: ApproveCreatorInput) {
    const application = await prisma.creatorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "PENDING") {
      throw new Error("Application is not pending");
    }

    // Update application and user role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.creatorApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });

      // Update user role to CREATOR
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "CREATOR" },
      });

      return updatedApplication;
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: "CREATOR_APPROVED",
      targetType: "CREATOR_APPLICATION",
      targetId: applicationId,
      details: {
        userId: application.userId,
        note: input.note,
      },
    });

    return result;
  }

  /**
   * Reject creator application
   */
  async rejectCreatorApplication(applicationId: string, adminId: string, input: RejectCreatorInput) {
    const application = await prisma.creatorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "PENDING") {
      throw new Error("Application is not pending");
    }

    const updatedApplication = await prisma.creatorApplication.update({
      where: { id: applicationId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: input.reason,
      },
    });

    // Log admin action
    await this.logAdminAction({
      adminId,
      action: "CREATOR_REJECTED",
      targetType: "CREATOR_APPLICATION",
      targetId: applicationId,
      details: {
        userId: application.userId,
        reason: input.reason,
      },
    });

    return updatedApplication;
  }

  /**
   * Log admin action
   */
  private async logAdminAction(data: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: any;
  }) {
    try {
      await prisma.adminActivityLog.create({
        data: {
          adminId: data.adminId,
          action: data.action as any,
          targetType: data.targetType,
          targetId: data.targetId,
          description: `${data.action} - ${data.targetType}`,
          metadata: data.details || {},
          ipAddress: null,
        },
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
      // Don't throw - logging failure shouldn't break the main operation
    }
  }
}

export const adminService = new AdminService();
