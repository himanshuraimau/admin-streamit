import { prisma } from "../lib/db.js";

class LogService {
  // Get admin activity logs with pagination and filtering
  async getAdminLogs(params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    affectedUserId?: string;
    action?: string;
    targetType?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 20,
      adminId,
      affectedUserId,
      action,
      targetType,
      search,
      startDate,
      endDate,
    } = params || {};

    const skip = (page - 1) * limit;

    const where: any = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (affectedUserId) {
      where.affectedUserId = affectedUserId;
    }

    if (action) {
      where.action = action;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          affectedUser: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminActivityLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get log by ID
  async getLogById(id: string) {
    const log = await prisma.adminActivityLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
        affectedUser: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new Error("Log not found");
    }

    return log;
  }

  // Get admin activity statistics
  async getAdminActivityStats(params?: {
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { adminId, startDate, endDate } = params || {};

    const where: any = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalActions, actionsByType, actionsByAdmin, recentActions] = await Promise.all([
      prisma.adminActivityLog.count({ where }),
      prisma.adminActivityLog.groupBy({
        by: ["action"],
        where,
        _count: true,
      }),
      prisma.adminActivityLog.groupBy({
        by: ["adminId"],
        where,
        _count: true,
      }),
      prisma.adminActivityLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      totalActions,
      actionsByType: actionsByType.map((a) => ({
        action: a.action,
        count: a._count,
      })),
      actionsByAdmin: actionsByAdmin.map((a) => ({
        adminId: a.adminId,
        count: a._count,
      })),
      recentActions,
    };
  }

  // Get timeline of actions for a specific user
  async getUserActivityTimeline(userId: string, params?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminActivityLog.findMany({
        where: {
          affectedUserId: userId,
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminActivityLog.count({
        where: { affectedUserId: userId },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const logService = new LogService();
