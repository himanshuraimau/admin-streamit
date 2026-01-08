import { prisma } from "../lib/db.js";

class DiscountService {
  // Get all discount codes with pagination
  async getDiscountCodes(params?: {
    page?: number;
    limit?: number;
    codeType?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 20, codeType, isActive, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (codeType) {
      where.codeType = codeType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.code = { contains: search, mode: "insensitive" };
    }

    const [codes, total] = await Promise.all([
      prisma.discountCode.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          _count: {
            select: { redemptions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.discountCode.count({ where }),
    ]);

    return {
      data: codes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get discount code by ID
  async getDiscountCodeById(id: string) {
    const code = await prisma.discountCode.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        redemptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
            purchase: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!code) {
      throw new Error("Discount code not found");
    }

    return code;
  }

  // Create promotional discount code
  async createDiscountCode(
    adminId: string,
    data: {
      code: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      maxRedemptions?: number;
      minPurchaseAmount?: number;
      expiresAt?: Date;
      description?: string;
    }
  ) {
    // Check if code already exists
    const existing = await prisma.discountCode.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error("Discount code already exists");
    }

    const discountCode = await prisma.$transaction(async (tx) => {
      const created = await tx.discountCode.create({
        data: {
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          codeType: "PROMOTIONAL",
          createdBy: adminId,
          maxRedemptions: data.maxRedemptions,
          minPurchaseAmount: data.minPurchaseAmount,
          expiresAt: data.expiresAt,
          description: data.description,
          isOneTimeUse: false, // Promotional codes can be used multiple times
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "CREATE_DISCOUNT_CODE",
          adminId: adminId,
          details: {
            discountCodeId: created.id,
            code: created.code,
            discountType: created.discountType,
            discountValue: created.discountValue,
          },
        },
      });

      return created;
    });

    return discountCode;
  }

  // Update discount code
  async updateDiscountCode(
    id: string,
    adminId: string,
    data: {
      discountValue?: number;
      maxRedemptions?: number;
      minPurchaseAmount?: number;
      expiresAt?: Date;
      isActive?: boolean;
      description?: string;
    }
  ) {
    const code = await prisma.discountCode.findUnique({ where: { id } });
    if (!code) {
      throw new Error("Discount code not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.discountCode.update({
        where: { id },
        data,
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "UPDATE_DISCOUNT_CODE",
          adminId: adminId,
          details: {
            discountCodeId: id,
            code: code.code,
            changes: data,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Delete discount code
  async deleteDiscountCode(id: string, adminId: string) {
    const code = await prisma.discountCode.findUnique({ where: { id } });
    if (!code) {
      throw new Error("Discount code not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.discountCode.delete({ where: { id } });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "DELETE_DISCOUNT_CODE",
          adminId: adminId,
          details: {
            discountCodeId: id,
            code: code.code,
          },
        },
      });
    });

    return { success: true };
  }

  // Get redemption stats
  async getRedemptionStats(params?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [totalRedemptions, totalBonusCoins, uniqueUsers] = await Promise.all([
      prisma.discountRedemption.count({ where }),
      prisma.discountRedemption.aggregate({
        where,
        _sum: { bonusCoins: true },
      }),
      prisma.discountRedemption.groupBy({
        by: ["userId"],
        where,
      }),
    ]);

    return {
      totalRedemptions,
      totalBonusCoins: totalBonusCoins._sum.bonusCoins || 0,
      uniqueUsers: uniqueUsers.length,
    };
  }
}

export const discountService = new DiscountService();
