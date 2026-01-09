# Frontend Overview

StreamIt Admin Dashboard - React frontend for managing the StreamIt platform.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS 4** - Styling
- **shadcn/ui** - UI component library
- **TanStack Query** - Data fetching & caching
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Architecture

```
admin-frontend/
├── src/
│   ├── App.tsx           # Main app with routes
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   ├── components/       # Reusable components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # shadcn/ui components
│   ├── pages/            # Page components
│   │   ├── auth/         # Login page
│   │   ├── dashboard/    # Dashboard
│   │   ├── users/        # User management
│   │   ├── creators/     # Creator applications
│   │   ├── payments/     # Payment management
│   │   ├── gifts/        # Virtual gifts
│   │   ├── discounts/    # Discount codes
│   │   ├── content/      # Content moderation
│   │   ├── reports/      # Reports
│   │   ├── analytics/    # Analytics
│   │   └── logs/         # Activity logs
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth helpers
│   │   └── utils.ts      # Utility functions
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
├── public/               # Static assets
└── index.html            # HTML template
```

## Key Features

### 1. Dashboard
- Platform overview with key metrics
- Recent activity feed
- Quick stats (users, revenue, content)

### 2. User Management
- List all users with filters
- View user details
- Suspend/unsuspend users
- Search by name, email, username

### 3. Creator Applications
- Review pending applications
- View identity & financial docs
- Approve/reject with notes
- Track application status

### 4. Payment Management
- View all transactions
- Filter by status, date, user
- Process refunds
- Payment analytics

### 5. Virtual Gifts
- Manage gift catalog
- Create/edit/delete gifts
- Track gift transactions
- Gift analytics

### 6. Discount Codes
- Create promotional codes
- Manage reward codes
- Track redemptions
- Set expiration & limits

### 7. Content Moderation
- Review posts & comments
- Hide/unhide content
- Delete inappropriate content
- View flagged content

### 8. Reports Management
- View user reports
- Resolve/dismiss reports
- Filter by status & type
- Track report statistics

### 9. Analytics
- Revenue charts
- User growth metrics
- Content statistics
- Gift analytics

### 10. Activity Logs
- Audit trail of admin actions
- Filter by action type
- View affected users

## Component Structure

### Layout Components

**Header** (`components/layout/Header.tsx`)
- Admin profile
- Logout button
- Notifications (future)

**Sidebar** (`components/layout/Sidebar.tsx`)
- Navigation menu
- Active route highlighting
- Collapsible sections

### UI Components (shadcn/ui)

All in `components/ui/`:
- `button.tsx` - Button component
- `input.tsx` - Input fields
- `table.tsx` - Data tables
- `dialog.tsx` - Modals
- `card.tsx` - Card containers
- `badge.tsx` - Status badges
- `tooltip.tsx` - Tooltips
- And more...

## Data Fetching

Uses TanStack Query for all API calls.

**Example:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const { data, isLoading, error } = useQuery({
  queryKey: ['users', page, filters],
  queryFn: async () => {
    const { data } = await api.get('/api/admin/users', {
      params: { page, ...filters }
    });
    return data;
  },
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Loading & error states
- Optimistic updates

## Authentication

JWT-based authentication with localStorage.

**Login Flow:**
```typescript
// 1. User submits login form
const { data } = await api.post('/api/auth/login', {
  email,
  password
});

// 2. Store token
localStorage.setItem('token', data.token);

// 3. Redirect to dashboard
navigate('/dashboard');
```

**Protected Routes:**
```typescript
// All routes except /login require authentication
// Checked in App.tsx
```

**API Client Setup:**
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Routing

Uses React Router v7.

**Routes:**
```
/login              - Login page
/dashboard          - Dashboard
/users              - User list
/users/:id          - User details
/creators           - Creator applications
/payments           - Payments
/gifts              - Virtual gifts
/discounts          - Discount codes
/content            - Content moderation
/reports            - Reports
/analytics          - Analytics
/logs               - Activity logs
```

## Styling

### TailwindCSS

Utility-first CSS framework.

**Example:**
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Title</h1>
  <button className="px-4 py-2 bg-blue-600 text-white rounded">
    Action
  </button>
</div>
```

### Custom Styles

Global styles in `index.css`:
- CSS variables for theming
- Custom animations
- Base component styles

## Environment Variables

```env
VITE_API_URL=http://localhost:4000
```

Access in code:
```typescript
import.meta.env.VITE_API_URL
```

## Development

**Start dev server:**
```bash
bun dev
```

Runs on `http://localhost:3001`

**Build for production:**
```bash
bun run build
```

Creates optimized bundle in `dist/`

**Preview production build:**
```bash
bun preview
```

## Key Files

### `src/App.tsx`
Main app component with routing.

### `src/lib/api.ts`
Axios instance with auth interceptor.

### `src/lib/auth.ts`
Authentication helpers (login, logout, getUser).

### `src/lib/utils.ts`
Utility functions (cn, formatDate, etc.).

### `src/types/index.ts`
TypeScript type definitions.

## Adding New Features

### 1. Create Page Component

```tsx
// src/pages/example/ExamplePage.tsx
export default function ExamplePage() {
  return (
    <div>
      <h1>Example Page</h1>
    </div>
  );
}
```

### 2. Add Route

```tsx
// src/App.tsx
import ExamplePage from './pages/example/ExamplePage';

<Route path="/example" element={<ExamplePage />} />
```

### 3. Add Navigation

```tsx
// src/components/layout/Sidebar.tsx
<NavLink to="/example">
  <Icon />
  Example
</NavLink>
```

### 4. Fetch Data

```tsx
// In your page component
const { data, isLoading } = useQuery({
  queryKey: ['example'],
  queryFn: async () => {
    const { data } = await api.get('/api/admin/example');
    return data;
  },
});
```

## Best Practices

1. **Use TanStack Query** for all API calls
2. **Type everything** with TypeScript
3. **Reuse components** from shadcn/ui
4. **Keep components small** and focused
5. **Use Tailwind** for styling
6. **Handle loading & error states**
7. **Add proper error handling**
8. **Use semantic HTML**
9. **Make it accessible**
10. **Test in different browsers**

## Next Steps

- [Component Guide](./COMPONENTS.md) - Detailed component documentation
- [State Management](./STATE.md) - Data fetching and state patterns
