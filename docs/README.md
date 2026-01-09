# Documentation

Complete documentation for the StreamIt Admin Dashboard.

## 📚 Documentation Structure

```
docs/
├── README.md              # This file
├── backend/               # Backend documentation
│   ├── README.md          # Backend overview
│   ├── DATABASE.md        # Database schema
│   └── API.md             # API reference
└── frontend/              # Frontend documentation
    ├── README.md          # Frontend overview
    ├── COMPONENTS.md      # Component guide
    └── STATE.md           # State management
```

## 🚀 Quick Start

### Backend

**What it is:** Bun + Express API for managing the StreamIt platform

**Key docs:**
- [Overview](backend/README.md) - Architecture and features
- [Database Schema](backend/DATABASE.md) - All models and relationships
- [API Reference](backend/API.md) - Complete API documentation

**Quick commands:**
```bash
cd admin-backend
bun install
bun db:migrate
bun db:seed
bun dev
```

### Frontend

**What it is:** React dashboard for platform administration

**Key docs:**
- [Overview](frontend/README.md) - Architecture and features
- [Components](frontend/COMPONENTS.md) - UI component guide
- [State Management](frontend/STATE.md) - Data fetching patterns

**Quick commands:**
```bash
cd admin-frontend
bun install
bun dev
```

## 📖 Documentation Guide

### For Developers

**New to the project?**
1. Start with [Backend Overview](backend/README.md)
2. Understand the [Database Schema](backend/DATABASE.md)
3. Read [Frontend Overview](frontend/README.md)
4. Learn about [Components](frontend/COMPONENTS.md)

**Building features?**
1. Check [API Reference](backend/API.md) for endpoints
2. Review [State Management](frontend/STATE.md) for data fetching
3. Use [Components Guide](frontend/COMPONENTS.md) for UI

**Working with data?**
1. Refer to [Database Schema](backend/DATABASE.md)
2. Check [API Reference](backend/API.md) for endpoints
3. See [State Management](frontend/STATE.md) for queries

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                  app.vidreplay.site                       │
│                                                           │
│  - React 19 + TypeScript                                │
│  - TailwindCSS + shadcn/ui                              │
│  - TanStack Query                                        │
│  - React Router                                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS (JWT Auth)
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Backend (Bun + Express)                 │
│                  api.vidreplay.site                       │
│                                                           │
│  - Bun runtime                                           │
│  - Express.js                                            │
│  - JWT authentication                                    │
│  - Prisma ORM                                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Prisma
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Database (PostgreSQL)                   │
│                                                           │
│  - User management                                       │
│  - Creator applications                                  │
│  - Payments & gifts                                      │
│  - Content & moderation                                  │
└──────────────────────────────────────────────────────────┘
```

## 🔑 Key Concepts

### User Roles
- **USER** - Regular platform user
- **CREATOR** - Approved content creator
- **ADMIN** - Platform administrator
- **SUPER_ADMIN** - Super administrator

### Creator Flow
```
User → Submit Application → Admin Reviews → Approved/Rejected
```

### Payment Flow
```
User → Purchase Coins → Send Gifts → Creator Earns
```

### Moderation Flow
```
User Reports Content → Admin Reviews → Hide/Delete/Dismiss
```

## 📊 Features

### User Management
- View all users
- Suspend/unsuspend users
- View user details & activity

### Creator Applications
- Review applications
- Verify identity & financials
- Approve/reject with notes

### Payment Management
- View transactions
- Process refunds
- Track revenue

### Virtual Gifts
- Manage gift catalog
- Track gift sends
- Gift analytics

### Discount Codes
- Create promo codes
- Manage reward codes
- Track redemptions

### Content Moderation
- Review posts & comments
- Hide/delete content
- End live streams

### Reports
- View user reports
- Resolve/dismiss reports
- Track statistics

### Analytics
- Revenue charts
- User growth
- Content stats
- Gift analytics

### Activity Logs
- Audit trail
- Track admin actions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT
- **Validation**: Zod

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS 4
- **Components**: shadcn/ui
- **Data**: TanStack Query
- **Routing**: React Router 7
- **Charts**: Recharts

## 🔗 Related Files

- [Main README](../README.md) - Project overview
- [Backend README](../admin-backend/README.md) - Backend-specific README
- [Frontend README](../admin-frontend/README.md) - Frontend-specific README
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

## 📝 Documentation Standards

When adding new documentation:

1. **Be concise** - Get to the point quickly
2. **Use examples** - Show, don't just tell
3. **Keep it updated** - Update docs when code changes
4. **Link related docs** - Help readers navigate
5. **Use proper formatting** - Headers, code blocks, lists
6. **Include diagrams** - Visual aids help understanding

## 🤝 Contributing

Found an issue in the docs? Want to add more documentation?

1. Check existing docs first
2. Follow the documentation standards above
3. Submit a PR with your changes
4. Tag it with `documentation` label

## 📞 Need Help?

- Check the relevant documentation section
- Look at code examples in the docs
- Review the API reference
- Ask the team

---

**Last Updated**: January 2026
