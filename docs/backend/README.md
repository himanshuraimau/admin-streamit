# Backend Overview

StreamIt Admin Backend - A Bun + Express API for managing the StreamIt platform.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod

## Architecture

```
admin-backend/
├── index.ts              # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data (admin user)
└── src/
    ├── controllers/      # Request handlers
    ├── services/         # Business logic
    ├── routes/           # API routes
    ├── middleware/       # Auth & validation
    ├── lib/              # Utilities
    └── types/            # TypeScript types
```

## Core Features

### 1. User Management
- View all users with filtering
- Suspend/unsuspend users
- View user details and activity
- Role management (USER, CREATOR, ADMIN)

### 2. Creator Applications
- Review pending applications
- Approve/reject with notes
- View identity verification
- Manage creator status

### 3. Payment Management
- View all transactions
- Process refunds
- Track coin purchases
- Payment analytics

### 4. Virtual Gifts
- CRUD operations for gifts
- Track gift transactions
- Gift analytics

### 5. Discount Codes
- Create promotional codes
- Manage reward codes
- Track redemptions
- Set expiration and limits

### 6. Content Moderation
- Review posts, comments, streams
- Hide/unhide content
- Delete inappropriate content
- End live streams

### 7. Reports Management
- View user reports
- Resolve/dismiss reports
- Track report statistics

### 8. Analytics
- Revenue analytics
- User growth metrics
- Content statistics
- Gift analytics

### 9. Activity Logging
- Audit trail for all admin actions
- Track who did what and when

## Database Models

### Core Models
- **User** - Platform users (with roles)
- **Session** - User sessions
- **Account** - OAuth accounts

### Creator Models
- **CreatorApplication** - Creator applications
- **IdentityVerification** - ID verification
- **FinancialDetails** - Bank details
- **CreatorProfile** - Creator profile

### Content Models
- **Post** - User posts
- **PostMedia** - Media attachments
- **Comment** - Comments on posts
- **Like** - Post likes
- **CommentLike** - Comment likes
- **Stream** - Live streams

### Payment Models
- **CoinWallet** - User coin balance
- **CoinPackage** - Coin packages for sale
- **CoinPurchase** - Purchase transactions
- **Gift** - Virtual gifts
- **GiftTransaction** - Gift sends

### Discount Models
- **DiscountCode** - Promo/reward codes
- **DiscountRedemption** - Code usage

### Moderation Models
- **Report** - User reports
- **AdminActivityLog** - Admin actions
- **SystemSetting** - Platform settings
- **Announcement** - Platform announcements

## API Structure

### Authentication
```
POST /api/auth/login
GET  /api/auth/me
```

### Admin Endpoints
All require JWT authentication and ADMIN role.

```
/api/admin/users                    # User management
/api/admin/creator-applications     # Creator applications
/api/admin/payments                 # Payment management
/api/admin/virtual-gifts            # Gift management
/api/admin/discount-codes           # Discount codes
/api/admin/posts                    # Post moderation
/api/admin/comments                 # Comment moderation
/api/admin/streams                  # Stream management
/api/admin/reports                  # Reports
/api/admin/analytics                # Analytics
/api/admin/activity-logs            # Activity logs
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/streamit"
JWT_SECRET="your-secret-key"
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS="https://app.vidreplay.site"
```

## Running

**Development:**
```bash
bun dev
```

**Production:**
```bash
bun start
```

## Database Commands

```bash
bun db:generate        # Generate Prisma client
bun db:migrate         # Run migrations (dev)
bun db:migrate:deploy  # Run migrations (prod)
bun db:push            # Push schema changes
bun db:studio          # Open Prisma Studio
bun db:seed            # Seed database
```

## Default Admin

Created by seed script:
```
Email: admin@streamit.com
Password: Admin@123456
```

## Next Steps

- [Database Schema](./DATABASE.md) - Detailed schema documentation
- [API Reference](./API.md) - Complete API documentation
