import { prisma } from "../lib/db.js";

class ContentService {
  // Get posts with moderation info
  async getPosts(params?: {
    page?: number;
    limit?: number;
    isHidden?: boolean;
    isFlagged?: boolean;
    authorId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, isHidden, isFlagged, authorId, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isHidden !== undefined) {
      where.isHidden = isHidden;
    }

    if (isFlagged !== undefined) {
      where.isFlagged = isFlagged;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              reports: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Hide/unhide post
  async togglePostVisibility(
    postId: string,
    adminId: string,
    data: { isHidden: boolean; reason?: string }
  ) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.post.update({
        where: { id: postId },
        data: {
          isHidden: data.isHidden,
          hiddenReason: data.isHidden ? data.reason : null,
          hiddenBy: data.isHidden ? adminId : null,
          hiddenAt: data.isHidden ? new Date() : null,
        },
        include: {
          author: true,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: data.isHidden ? "POST_HIDDEN" : "POST_UNHIDDEN",
          adminUserId: adminId,
          affectedUserId: post.authorId,
          details: {
            postId,
            reason: data.reason,
          },
        },
      });

      return result;
    });

    return updated;
  }

  // Delete post
  async deletePost(postId: string, adminId: string, reason: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    await prisma.$transaction(async (tx) => {
      // Log before deletion
      await tx.adminActivityLog.create({
        data: {
          action: "POST_DELETED",
          adminUserId: adminId,
          affectedUserId: post.authorId,
          details: {
            postId,
            content: post.content,
            reason,
          },
        },
      });

      await tx.post.delete({ where: { id: postId } });
    });

    return { success: true };
  }

  // Get comments with moderation info
  async getComments(params?: {
    page?: number;
    limit?: number;
    postId?: string;
    userId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, postId, userId, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (postId) {
      where.postId = postId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete comment
  async deleteComment(commentId: string, adminId: string, reason: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    await prisma.$transaction(async (tx) => {
      // Log before deletion
      await tx.adminActivityLog.create({
        data: {
          action: "COMMENT_DELETED",
          adminUserId: adminId,
          affectedUserId: comment.userId,
          details: {
            commentId,
            content: comment.content,
            postId: comment.postId,
            reason,
          },
        },
      });

      await tx.comment.delete({ where: { id: commentId } });
    });

    return { success: true };
  }

  // Get streams with moderation info
  async getStreams(params?: {
    page?: number;
    limit?: number;
    isLive?: boolean;
    userId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, isLive, userId, search } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isLive !== undefined) {
      where.isLive = isLive;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [streams, total] = await Promise.all([
      prisma.stream.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              giftTransactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.stream.count({ where }),
    ]);

    return {
      data: streams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // End stream (force stop)
  async endStream(streamId: string, adminId: string, reason: string) {
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: { user: true },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.stream.update({
        where: { id: streamId },
        data: {
          isLive: false,
        },
      });

      // Log admin action
      await tx.adminActivityLog.create({
        data: {
          action: "STREAM_ENDED",
          adminUserId: adminId,
          affectedUserId: stream.userId,
          details: {
            streamId,
            title: stream.title,
            reason,
          },
        },
      });

      return result;
    });

    return updated;
  }
}

export const contentService = new ContentService();
