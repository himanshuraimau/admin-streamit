# StreamIt Admin Panel

A comprehensive admin dashboard for managing the StreamIt live streaming platform. Built with React, TypeScript, and Express.js.

## 🚀 Features

### User Management
- View and search all users
- Filter by role and suspension status
- Suspend/unsuspend user accounts with reasons
- View detailed user profiles and activity

### Creator Management
- Review and approve creator applications
- Reject applications with feedback
- Monitor creator activity and content

### Payment Management
- View all payment transactions
- Filter by status and search
- Process refunds with tracking
- View payment statistics and analytics

### Virtual Gifts
- Create and manage virtual gifts
- Set pricing and upload gift assets
- View gift transaction history
- Track gift revenue and popularity

### Discount Codes
- Create promotional discount codes
- Set percentage or fixed amount discounts
- Configure usage limits and expiration
- Track redemption statistics

### Content Moderation
- Moderate posts, comments, and streams
- Hide or delete inappropriate content
- End live streams for policy violations
- Track moderation history

### Reports Management
- Review user reports
- Resolve or dismiss reports with notes
- Track report status workflow
- View report statistics

### Activity Logs
- Comprehensive admin action logging
- Filter by action type and date range
- Search by admin or target
- View detailed activity timeline

### Analytics Dashboard
- Platform overview metrics
- Revenue analytics with charts
- User growth and demographics
- Content creation trends
- Gift usage analytics

## 📦 Project Structure

```
admin-streamit/
├── admin-backend/          # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── admin-frontend/         # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities & API client
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # App entry point
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Bun
- **Framework:** Express.js 5
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth
- **Validation:** Zod
- **Language:** TypeScript

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router 7
- **State Management:** TanStack Query
- **Tables:** TanStack Table
- **Forms:** React Hook Form
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Language:** TypeScript

## 📋 Prerequisites

- Bun >= 1.0.0
- PostgreSQL >= 14
- Node.js >= 20 (for frontend tools)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd admin-streamit
```

### 2. Backend Setup

```bash
cd admin-backend

# Install dependencies
bun install

# Set up environment variables
cp .env.development .env
# Edit .env with your database credentials

# Generate Prisma Client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Seed initial admin user (optional)
bunx prisma db seed

# Start development server
bun run dev
```

The backend will run on `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd admin-frontend

# Install dependencies
bun install

# Start development server
bun run dev
```

The frontend will run on `http://localhost:3001`.

### 4. Access the Application

1. Open `http://localhost:3001` in your browser
2. Log in with admin credentials
3. Start managing your platform!

## 🔐 Authentication

The application uses Better Auth for authentication. Admin users must have the role `ADMIN` or `SUPER_ADMIN` to access the admin panel.

### Creating an Admin User

You can create an admin user directly in the database:

```sql
UPDATE "user" 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@example.com';
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/database
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME="StreamIt Admin"
```

## 🧪 Development

### Backend Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run production server
bun run start

# Run Prisma Studio
bunx prisma studio

# Generate Prisma Client
bunx prisma generate

# Create migration
bunx prisma migrate dev --name migration_name
```

### Frontend Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 📚 API Documentation

Detailed API documentation is available in [API.md](./admin-backend/API.md).

Base URL: `http://localhost:4000/api/admin`

All endpoints require admin authentication.

## 🎨 UI Components

The frontend uses a custom component library built with:
- Tailwind CSS for styling
- Lucide React for icons
- TanStack Table for data tables
- Recharts for analytics charts
- Sonner for toast notifications

## 🔒 Security Features

- Role-based access control (RBAC)
- Session-based authentication
- CORS protection
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection
- Rate limiting (recommended for production)

## 📊 Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User** - User accounts and profiles
- **CreatorApplication** - Creator verification requests
- **CoinPurchase** - Payment transactions
- **Gift** - Virtual gift definitions
- **GiftTransaction** - Gift purchase history
- **DiscountCode** - Promotional codes
- **Post/Comment/Stream** - User-generated content
- **Report** - User reports
- **AdminActivityLog** - Admin action audit trail

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Run database migrations
3. Build the application: `bun run build`
4. Start the server: `bun run start`

### Frontend Deployment

1. Update `VITE_API_URL` in `.env.production`
2. Build the application: `bun run build`
3. Serve the `dist` folder with a static file server (Nginx, Vercel, Netlify, etc.)

### Recommended Hosting

- **Backend:** Railway, Render, Fly.io, AWS, DigitalOcean
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** Supabase, Railway, Neon, AWS RDS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for StreamIt platform.

## 🐛 Known Issues

- Some TypeScript type mismatches between frontend and backend need alignment
- Table pagination could be improved with infinite scroll
- Real-time updates via WebSocket not yet implemented

## 🔮 Future Enhancements

- [ ] Real-time notifications via WebSocket
- [ ] Advanced analytics with custom date ranges
- [ ] Bulk operations for user management
- [ ] Export data to CSV/Excel
- [ ] Email notifications for critical actions
- [ ] Two-factor authentication for admins
- [ ] API rate limiting
- [ ] Automated tests (unit & integration)
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## 📞 Support

For questions or issues, please contact the development team or create an issue in the repository.

---

Built with ❤️ for StreamIt Platform
