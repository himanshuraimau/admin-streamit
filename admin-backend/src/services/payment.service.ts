import { prisma } from "../lib/db.js";

class PaymentService {
  // Get all payments with pagination and filtering
  async getPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { username: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [purchases, total] = await Promise.all([
      prisma.coinPurchase.findMany({
        where,
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
          package: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.coinPurchase.count({ where }),
    ]);

    return {
      data: purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get payment by ID
  async getPaymentById(id: string) {
    const purchase = await prisma.coinPurchase.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            phone: true,
          },
        },
        package: true,
        discountRedemption: {
          include: {
            discountCode: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new Error("Payment not found");
    }

    return purchase;
  }

  // Process refund
  async refundPayment(id: string, adminId: string, data: { reason: string; note?: string }) {
    const purchase = await prisma.coinPurchase.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!purchase) {
      throw new Error("Payment not found");
    }

    if (purchase.status !== "COMPLETED") {
      throw new Error("Only completed payments can be refunded");
    }

    // Process refund in transaction
    const refunded = await prisma.$transaction(async (tx) => {
      // Update purchase status
      const updated = await tx.coinPurchase.update({
        where: { id },
        data: {
          status: "REFUNDED",
          failureReason: data.reason,
        },
        include: {
          user: true,
          package: true,
        },
      });

      // Deduct coins from user's wallet
      await tx.coinWallet.update({
        where: { userId: purchase.userId },
        data: {
          balance: {
            decrement: purchase.totalCoins,
          },
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "REFUND_PAYMENT",
          adminId: adminId,
          affectedUserId: purchase.userId,
          details: {
            purchaseId: id,
            orderId: purchase.orderId,
            amount: purchase.amount,
            coins: purchase.totalCoins,
            reason: data.reason,
            note: data.note,
          },
        },
      });

      return updated;
    });

    return refunded;
  }

  // Get payment statistics
  async getPaymentStats(params?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [totalRevenue, totalTransactions, completedRevenue, pendingCount, failedCount] =
      await Promise.all([
        prisma.coinPurchase.aggregate({
          where: { ...where, status: { in: ["COMPLETED", "REFUNDED"] } },
          _sum: { amount: true },
        }),
        prisma.coinPurchase.count({ where }),
        prisma.coinPurchase.aggregate({
          where: { ...where, status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.coinPurchase.count({
          where: { ...where, status: "PENDING" },
        }),
        prisma.coinPurchase.count({
          where: { ...where, status: "FAILED" },
        }),
      ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      completedRevenue: completedRevenue._sum.amount || 0,
      totalTransactions,
      completedCount: totalTransactions - pendingCount - failedCount,
      pendingCount,
      failedCount,
    };
  }
}

export const paymentService = new PaymentService();
