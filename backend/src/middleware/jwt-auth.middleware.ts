import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/db.js';
import 'dotenv/config'; // Ensure .env is loaded

// Extend the Express Request interface to include the admin property
declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
            };
        }
    }
}

// Define a custom interface for our JWT payload
interface AuthTokenPayload extends JwtPayload {
    adminId: string;
    // userId: string; // Remove userId from payload as session is now linked to admin
}

export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'Unauthorized - Invalid token format' });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        // Verify JWT and cast to our custom payload interface
        const decoded = jwt.verify(token, jwtSecret) as unknown as AuthTokenPayload;

        // Check if session exists in DB (for explicit invalidation)
        const session = await prisma.session.findUnique({
            where: { sessionToken: token },
        });

        if (!session || session.expires < new Date()) {
            // Opportunistically clean up expired/invalid session from DB
            if (session) {
                await prisma.session.deleteMany({
                    where: { sessionToken: token },
                });
            }
            return res.status(401).json({ success: false, error: 'Unauthorized - Invalid or expired token' });
        }

        // Find the admin based on the decoded token
        const admin = await prisma.admin.findUnique({
            where: { id: decoded.adminId }, // Only use adminId to find admin
        });

        if (!admin) {
            return res.status(403).json({ success: false, error: 'Forbidden - Admin not found' });
        }

        // Attach admin info to request
        req.admin = {
            id: admin.id,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, error: 'Unauthorized - Invalid token' });
        }
        console.error('JWT authentication error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
