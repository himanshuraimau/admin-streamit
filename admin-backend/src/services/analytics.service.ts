import { prisma } from "../lib/db.js";

class AnalyticsService {
  // Helper: Get daily revenue
  private async getDailyRevenue(startDate?: Date, endDate?: Date) {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    
    const start = startDate || defaultStart;
    const end = endDate || new Date();
    
    const result: any[] = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as transactions,
        SUM(amount)::int as revenue
      FROM "coin_purchase"
      WHERE status = 'COMPLETED'
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
      LIMIT 90
    `;
    
    return result.map(r => ({
      date: r.date.toISOString().split('T')[0],
      transactions: Number(r.transactions),
      revenue: Number(r.revenue),
    }));
  }
  
  // Helper: Get daily signups
  private async getDailySignups(startDate?: Date, endDate?: Date) {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    
    const start = startDate || defaultStart;
    const end = endDate || new Date();
    
    const result: any[] = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as signups
      FROM "user"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
      LIMIT 90
    `;
    
    return result.map(r => ({
      date: r.date.toISOString().split('T')[0],
      signups: Number(r.signups),
    }));
  }
  
  // Helper: Get daily posts
  private async getDailyPosts(startDate?: Date, endDate?: Date) {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    
    const start = startDate || defaultStart;
    const end = endDate || new Date();
    
    const result: any[] = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as posts
      FROM "post"
      WHERE "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
      LIMIT 90
    `;
    
    return result.map(r => ({
      date: r.date.toISOString().split('T')[0],
      posts: Number(r.posts),
    }));
  }

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
      this.getDailyRevenue(startDate, endDate),
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
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalTransactions,
        revenueBreakdown,
        dailyRevenue,
        averageTransaction: totalTransactions > 0 
          ? (totalRevenue._sum.amount || 0) / totalTransactions 
          : 0,
        totalPayments: totalTransactions,
      },
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
      this.getDailySignups(startDate, endDate),
      prisma.user.count({
        where: { isSuspended: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        usersByRole: usersByRole.map((u) => ({
          role: u.role,
          count: u._count,
        })),
        dailySignups,
        suspendedUsers,
        newUsers: dailySignups.reduce((sum: number, day: any) => sum + (day.signups || 0), 0),
        activeUsers: totalUsers - suspendedUsers,
      },
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
      this.getDailyPosts(startDate, endDate),
    ]);

    return {
      success: true,
      data: {
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
        totalStreams: 0, // TODO: Add stream count
        liveStreams: 0, // TODO: Add live stream count
      },
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

    const topGifts = giftBreakdown
      .sort((a, b) => b.totalCoins - a.totalCoins)
      .slice(0, 10)
      .map((g) => ({
        giftId: g.gift?.id || '',
        giftName: g.gift?.name || 'Unknown',
        count: g.count,
        totalRevenue: g.totalCoins,
      }));

    return {
      success: true,
      data: {
        totalGiftsSent,
        totalGiftRevenue: totalCoinsSpent._sum.coinAmount || 0,
        uniqueSenders: await prisma.giftTransaction.findMany({
          where,
          select: { senderId: true },
          distinct: ['senderId'],
        }).then(r => r.length),
        topGifts,
        giftBreakdown,
        topReceivers: topReceiversWithDetails,
      },
    };
  }

  // Get platform overview
  async getPlatformOverview() {
    const [
      totalUsers,
      activeCreators,
      totalRevenue,
      totalPosts,
      pendingReports,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: "CREATOR" },
      }),
      prisma.coinPurchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.post.count(),
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
      success: true,
      data: {
        totalUsers,
        activeCreators,
        totalRevenue: (totalRevenue._sum.amount || 0) / 100, // Convert from cents to dollars
        totalPosts,
        pendingReports,
        recentActivity,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
