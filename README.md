# StreamIt Admin Dashboard

A comprehensive admin dashboard for the StreamIt platform, providing complete control over users, content, payments, analytics, and platform operations.

## 🚀 Features

- **User Management**: View, suspend, and manage user accounts
- **Creator Applications**: Review and approve/reject creator applications
- **Payment Management**: Monitor transactions, process refunds, and view payment analytics
- **Virtual Gifts**: Manage gift catalog and track gift transactions
- **Discount Codes**: Create and manage promotional discount codes
- **Content Moderation**: Review and moderate posts, comments, and streams
- **Reports Management**: Handle user reports and take appropriate actions
- **Activity Logs**: Track all admin actions with detailed audit trail
- **Analytics Dashboard**: Comprehensive analytics for revenue, users, content, and gifts

## 📁 Project Structure

```
admin-streamit/
├── admin-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   └── package.json
│
├── admin-backend/           # Bun + Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── lib/            # Utilities
│   ├── prisma/             # Database schema and migrations
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **shadcn/ui** - UI components
- **TanStack Query** - Data fetching and caching
- **React Router** - Routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Bun** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+
- **Git**

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd admin-streamit
```

### 2. Setup Backend

```bash
cd admin-backend

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
bun db:generate

# Run migrations
bun db:migrate

# Seed the database (creates admin user)
bun db:seed

# Start development server
bun dev
```

The backend will run on `http://localhost:4000`

**Default Admin Credentials:**
- Email: `admin@streamit.com`
- Password: `Admin@123456`

### 3. Setup Frontend

```bash
cd admin-frontend

# Install dependencies
bun install

# Start development server
bun dev
```

The frontend will run on `http://localhost:3001`

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/voltstream"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=4000
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
```

## 📝 Available Scripts

### Backend

- `bun dev` - Start development server with hot reload
- `bun start` - Start production server
- `bun db:generate` - Generate Prisma client
- `bun db:migrate` - Run database migrations
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open Prisma Studio
- `bun db:seed` - Seed database with initial data

### Frontend

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Run ESLint

## 🎨 Features Overview

### Dashboard
- Platform overview with key metrics
- Recent activity feed
- Quick access to pending tasks

### User Management
- Search and filter users
- View detailed user profiles
- Suspend/unsuspend users
- Track user activity

### Creator Applications
- Review pending applications
- Approve or reject with notes
- View applicant details and documents

### Payments
- View all transactions
- Filter by status and date
- Process refunds
- Payment statistics

### Virtual Gifts
- Manage gift catalog
- Track gift transactions
- View gift analytics

### Discount Codes
- Create promotional codes
- Set expiration and usage limits
- Track redemptions

### Content Moderation
- Review posts, comments, and streams
- Hide/unhide content
- Delete inappropriate content
- End live streams

### Reports
- Review user reports
- Resolve or dismiss reports
- Track report statistics

### Analytics
- Revenue analytics with charts
- User growth metrics
- Content statistics
- Gift analytics

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- SQL injection protection via Prisma
- XSS protection
- CORS configuration
- Input validation with Zod

## 📚 Documentation

Complete documentation available in the [`docs/`](docs/) folder.

### Quick Links

**Backend:**
- [Overview](docs/backend/README.md) - Architecture, features, and setup
- [Database Schema](docs/backend/DATABASE.md) - Complete database documentation
- [API Reference](docs/backend/API.md) - All endpoints and examples

**Frontend:**
- [Overview](docs/frontend/README.md) - Architecture, features, and setup
- [Components](docs/frontend/COMPONENTS.md) - UI component guide
- [State Management](docs/frontend/STATE.md) - Data fetching patterns

## 🚀 Getting Started

### Backend

```bash
cd admin-backend
bun install
bun db:migrate
bun db:seed
bun dev
```

### Frontend

```bash
cd admin-frontend
bun install
bun dev
```

See [Documentation](docs/README.md) for detailed guides.

## 🚀 Production Deployment (AWS EC2)

Deploy to AWS EC2 with Neon PostgreSQL:

**Setup:**
- Frontend: `app.vidreplay.site`
- Backend: `api.vidreplay.site`
- Database: Neon PostgreSQL (cloud)

**Quick Steps:**
1. Setup Neon database
2. Launch EC2 instance (t3.medium)
3. Configure DNS (A records)
4. Deploy with Docker
5. Setup Nginx reverse proxy
6. Enable SSL with Certbot

📚 **[Complete Deployment Guide](DEPLOY.md)** - Step-by-step AWS EC2 deployment  
✅ **[Deployment Checklist](DEPLOY-CHECKLIST.md)** - Quick reference checklist

## 🐳 Docker Deployment

Deploy with Docker using Neon PostgreSQL:

```bash
# Setup environment
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and JWT_SECRET

# Build and start
docker-compose up -d

# Run migrations
docker-compose exec backend bunx prisma migrate deploy

# Seed admin user
docker-compose exec backend bun run prisma/seed.ts
```

See [DOCKER.md](DOCKER.md) for complete Docker deployment guide.

## 📄 License

This project is proprietary and confidential.

## 👥 Team

StreamIt Team

## 📞 Support

For support, please contact the development team.
