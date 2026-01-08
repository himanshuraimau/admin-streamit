import { prisma } from "../lib/db.js";

class GiftService {
  // Get all gifts with pagination
  async getGifts(params?: { page?: number; limit?: number; isActive?: boolean }) {
    const { page = 1, limit = 50, isActive } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [gifts, total] = await Promise.all([
      prisma.gift.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.gift.count({ where }),
    ]);

    return {
      data: gifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get gift by ID
  async getGiftById(id: string) {
    const gift = await prisma.gift.findUnique({
      where: { id },
      include: {
        _count: {
          select: { giftsSent: true },
        },
      },
    });

    if (!gift) {
      throw new Error("Gift not found");
    }

    return gift;
  }

  // Create new gift
  async createGift(
    adminId: string,
    data: {
      name: string;
      description?: string;
      coinPrice: number;
      imageUrl: string;
      animationUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const gift = await prisma.$transaction(async (tx) => {
      const created = await tx.gift.create({
        data: {
          name: data.name,
          description: data.description,
          coinPrice: data.coinPrice,
          imageUrl: data.imageUrl,
          animationUrl: data.animationUrl,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "CREATE_GIFT",
          adminId: adminId,
          details: {
            giftId: created.id,
            name: created.name,
            coinPrice: created.coinPrice,
          },
        },
      });

      return created;
    });

    return gift;
  }

  // Update gift
  async updateGift(
    id: string,
    adminId: string,
    data: {
      name?: string;
      description?: string;
      coinPrice?: number;
      imageUrl?: string;
      animationUrl?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const gift = await prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      throw new Error("Gift not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.gift.update({
        where: { id },
        data,
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "UPDATE_GIFT",
          adminId: adminId,
          details: {
            giftId: id,
            changes: data,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Delete gift
  async deleteGift(id: string, adminId: string) {
    const gift = await prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      throw new Error("Gift not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.gift.delete({ where: { id } });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "DELETE_GIFT",
          adminId: adminId,
          details: {
            giftId: id,
            name: gift.name,
          },
        },
      });
    });

    return { success: true };
  }

  // Get gift transactions
  async getGiftTransactions(params: {
    page?: number;
    limit?: number;
    giftId?: string;
    senderId?: string;
    receiverId?: string;
  }) {
    const { page = 1, limit = 20, giftId, senderId, receiverId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (giftId) where.giftId = giftId;
    if (senderId) where.senderId = senderId;
    if (receiverId) where.receiverId = receiverId;

    const [transactions, total] = await Promise.all([
      prisma.giftTransaction.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          gift: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.giftTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const giftService = new GiftService();
