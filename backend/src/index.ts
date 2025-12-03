// @ts-nocheck
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/db.js';
// Removed: import { auth } from './lib/auth';
// Removed: import { toNodeHandler } from 'better-auth/node';

// Import routes
import adminAuthRoutes from './routes/admin-auth.route.js';
import usersRoutes from './routes/users.route.js';
import creatorsRoutes from './routes/creators.route.js';
import contentRoutes from './routes/content.route.js';
import analyticsRoutes from './routes/analytics.route.js';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP',
});

app.use('/api/admin', limiter);

// Body parsing
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Database connection failed' });
    }
});

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/creators', creatorsRoutes);
app.use('/api/admin/content', contentRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Admin API running on port ${PORT}`);
    console.log(`📊 Admin Frontend: ${process.env.FRONTEND_URL}`);
});
