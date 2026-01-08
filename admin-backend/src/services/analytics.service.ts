import { prisma } from "../lib/db.js";

class AnalyticsService {
  // Get revenue analytics
  async getRevenueAnalytics(params?: { startDate?: Date; endDate?: Date; groupBy?: string }) {
    const { startDate, endDate, groupBy = "day" } = params || {};

    const where: any = { status: "COMPLETED" };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalRevenue, totalTransactions, revenueByPackage, dailyRevenue] = await Promise.all([
      prisma.coinPurchase.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.coinPurchase.count({ where }),
      prisma.coinPurchase.groupBy({
        by: ["packageId"],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      // Get daily revenue for charts
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transactions,
          SUM(amount) as revenue
        FROM coin_purchase
        WHERE status = 'COMPLETED'
        ${startDate ? prisma.$queryRawUnsafe(`AND created_at >= $1`, startDate) : prisma.$queryRawUnsafe(``)}
        ${endDate ? prisma.$queryRawUnsafe(`AND created_at <= $1`, endDate) : prisma.$queryRawUnsafe(``)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    // Get package details for revenue breakdown
    const packageIds = revenueByPackage.map((r) => r.packageId);
    const packages = await prisma.coinPackage.findMany({
      where: { id: { in: packageIds } },
    });

    const revenueBreakdown = revenueByPackage.map((r) => ({
      package: packages.find((p) => p.id === r.packageId),
      revenue: r._sum.amount || 0,
      transactions: r._count,
    }));

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions,
      revenueBreakdown,
      dailyRevenue,
    };
  }

  // Get user growth analytics
  async getUserAnalytics(params?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = params || {};

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalUsers, usersByRole, dailySignups, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      // Get daily signups for charts
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as signups
        FROM "user"
        ${startDate ? prisma.$queryRawUnsafe(`WHERE created_at >= $1`, startDate) : prisma.$queryRawUnsafe(``)}
        ${endDate ? prisma.$queryRawUnsafe(`${startDate ? 'AND' : 'WHERE'} created_at <= $1`, endDate) : prisma.$queryRawUnsafe(``)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      prisma.user.count({
        where: { isSuspended: true },
      }),
    ]);

    return {
      totalUsers,
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count,
      })),
      dailySignups,
      suspendedUsers,
    };
  }

  // Get content analytics
  async getContentAnalytics(params?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = params || {};

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalPosts,
      totalComments,
      totalLikes,
      postsByType,
      hiddenPosts,
      flaggedPosts,
      dailyPosts,
    ] = await Promise.all([
      prisma.post.count({ where }),
      prisma.comment.count({ where }),
      prisma.like.count({ where }),
      prisma.post.groupBy({
        by: ["type"],
        where,
        _count: true,
      }),
      prisma.post.count({
        where: { ...where, isHidden: true },
      }),
      prisma.post.count({
        where: { ...where, isFlagged: true },
      }),
      // Get daily post creation for charts
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as posts
        FROM post
        ${startDate ? prisma.$queryRawUnsafe(`WHERE created_at >= $1`, startDate) : prisma.$queryRawUnsafe(``)}
        ${endDate ? prisma.$queryRawUnsafe(`${startDate ? 'AND' : 'WHERE'} created_at <= $1`, endDate) : prisma.$queryRawUnsafe(``)}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    return {
      totalPosts,
      totalComments,
      totalLikes,
      postsByType: postsByType.map((p) => ({
        type: p.type,
        count: p._count,
      })),
      hiddenPosts,
      flaggedPosts,
      dailyPosts,
    };
  }

  // Get gift analytics
  async getGiftAnalytics(params?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = params || {};

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalGiftsSent, totalCoinsSpent, giftsByType, topReceivers] = await Promise.all([
      prisma.giftTransaction.count({ where }),
      prisma.giftTransaction.aggregate({
        where,
        _sum: { coinAmount: true },
      }),
      prisma.giftTransaction.groupBy({
        by: ["giftId"],
        where,
        _count: true,
        _sum: { coinAmount: true },
      }),
      prisma.giftTransaction.groupBy({
        by: ["receiverId"],
        where,
        _count: true,
        _sum: { coinAmount: true },
        orderBy: {
          _sum: {
            coinAmount: "desc",
          },
        },
        take: 10,
      }),
    ]);

    // Get gift details
    const giftIds = giftsByType.map((g) => g.giftId);
    const gifts = await prisma.gift.findMany({
      where: { id: { in: giftIds } },
    });

    const giftBreakdown = giftsByType.map((g) => ({
      gift: gifts.find((gift) => gift.id === g.giftId),
      count: g._count,
      totalCoins: g._sum.coinAmount || 0,
    }));

    // Get receiver details
    const receiverIds = topReceivers.map((r) => r.receiverId);
    const receivers = await prisma.user.findMany({
      where: { id: { in: receiverIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    const topReceiversWithDetails = topReceivers.map((r) => ({
      user: receivers.find((u) => u.id === r.receiverId),
      giftsReceived: r._count,
      coinsEarned: r._sum.coinAmount || 0,
    }));

    return {
      totalGiftsSent,
      totalCoinsSpent: totalCoinsSpent._sum.coinAmount || 0,
      giftBreakdown,
      topReceivers: topReceiversWithDetails,
    };
  }

  // Get platform overview
  async getPlatformOverview() {
    const [
      totalUsers,
      activeCreators,
      totalRevenue,
      pendingReports,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: { in: ["CREATOR", "ADMIN", "SUPER_ADMIN"] } },
      }),
      prisma.coinPurchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.report.count({
        where: { status: "PENDING" },
      }),
      prisma.adminActivityLog.findMany({
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
      totalUsers,
      activeCreators,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingReports,
      recentActivity,
    };
  }
}

export const analyticsService = new AnalyticsService();
