import { prisma } from "../lib/db.js";

class ReportService {
  // Get all reports with pagination and filtering
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    reason?: string;
    reporterId?: string;
    reportedUserId?: string;
  }) {
    const { page = 1, limit = 20, status, reason, reporterId, reportedUserId } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    if (reporterId) {
      where.reporterId = reporterId;
    }

    if (reportedUserId) {
      where.reportedUserId = reportedUserId;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              type: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get report by ID
  async getReportById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            role: true,
            isSuspended: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            type: true,
            isHidden: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            media: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            isHidden: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            post: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  }

  // Mark report as under review
  async reviewReport(id: string, adminId: string) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error("Report not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: {
          status: "UNDER_REVIEW",
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
        include: {
          reporter: true,
          reportedUser: true,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "REPORT_REVIEWED",
          adminUserId: adminId,
          affectedUserId: report.reportedUserId,
          details: {
            reportId: id,
            reason: report.reason,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Resolve report
  async resolveReport(id: string, adminId: string, data: { resolution: string; action?: string }) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error("Report not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: {
          status: "RESOLVED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          resolution: data.resolution,
        },
        include: {
          reporter: true,
          reportedUser: true,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "REPORT_REVIEWED",
          adminUserId: adminId,
          affectedUserId: report.reportedUserId,
          details: {
            reportId: id,
            reason: report.reason,
            resolution: data.resolution,
            action: data.action,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Dismiss report
  async dismissReport(id: string, adminId: string, reason: string) {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error("Report not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.report.update({
        where: { id },
        data: {
          status: "DISMISSED",
          reviewedBy: adminId,
          reviewedAt: new Date(),
          resolution: reason,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "REPORT_DISMISSED",
          adminUserId: adminId,
          details: {
            reportId: id,
            reason,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Get report statistics
  async getReportStats(params?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [totalReports, pendingReports, resolvedReports, dismissedReports, reportsByReason] =
      await Promise.all([
        prisma.report.count({ where }),
        prisma.report.count({
          where: { ...where, status: "PENDING" },
        }),
        prisma.report.count({
          where: { ...where, status: "RESOLVED" },
        }),
        prisma.report.count({
          where: { ...where, status: "DISMISSED" },
        }),
        prisma.report.groupBy({
          by: ["reason"],
          where,
          _count: true,
        }),
      ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      dismissedReports,
      underReviewReports: totalReports - pendingReports - resolvedReports - dismissedReports,
      reportsByReason: reportsByReason.map((r) => ({
        reason: r.reason,
        count: r._count,
      })),
    };
  }
}

export const reportService = new ReportService();
