# Component Guide

Guide to using and creating components in the StreamIt Admin Dashboard.

## Component Categories

### 1. Layout Components
### 2. UI Components (shadcn/ui)
### 3. Page Components
### 4. Custom Components

---

## Layout Components

Located in `src/components/layout/`

### Header

Top navigation bar with admin profile.

```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

**Features:**
- Admin name and email
- Logout button
- Responsive design

### Sidebar

Side navigation menu.

```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar />
```

**Features:**
- Navigation links
- Active route highlighting
- Icons for each section
- Collapsible (future)

---

## UI Components (shadcn/ui)

Located in `src/components/ui/`

All components are from [shadcn/ui](https://ui.shadcn.com/) - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Variants:**
- `default` - Primary button
- `destructive` - Danger/delete actions
- `outline` - Secondary button
- `ghost` - Minimal button
- `link` - Link-styled button

### Input

```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Dialog (Modal)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

**Use cases:**
- User roles
- Status indicators
- Tags

### Tooltip

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Page Components

Located in `src/pages/`

Each page is a full-screen component that represents a route.

### Structure

```tsx
// src/pages/example/ExamplePage.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ExamplePage() {
  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/example');
      return data;
    },
  });

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Example Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Render data */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Custom Components

### Creating a Custom Component

```tsx
// src/components/UserCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {user.name}
          <Badge>{user.role}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-600">@{user.username}</p>
      </CardContent>
    </Card>
  );
}
```

**Usage:**
```tsx
import { UserCard } from '@/components/UserCard';

<UserCard user={user} />
```

---

## Component Patterns

### 1. Loading States

```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### 2. Error States

```tsx
if (error) {
  return (
    <div className="p-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error: {error.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Empty States

```tsx
if (data.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No data found</p>
    </div>
  );
}
```

### 4. Pagination

```tsx
<div className="flex items-center justify-between mt-6">
  <p className="text-sm text-gray-600">
    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
  </p>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(page - 1)}
      disabled={page === 1}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(page + 1)}
      disabled={page >= totalPages}
    >
      Next
    </Button>
  </div>
</div>
```

### 5. Filters

```tsx
<div className="flex gap-4 mb-6">
  <Select value={roleFilter} onValueChange={setRoleFilter}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter by role" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Roles</SelectItem>
      <SelectItem value="USER">User</SelectItem>
      <SelectItem value="CREATOR">Creator</SelectItem>
    </SelectContent>
  </Select>

  <Input
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="max-w-sm"
  />
</div>
```

---

## Styling Guidelines

### 1. Use Tailwind Classes

```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  {/* Content */}
</div>
```

### 2. Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### 3. Color Scheme

- Primary: `bg-blue-600`, `text-blue-600`
- Success: `bg-green-600`, `text-green-600`
- Warning: `bg-yellow-600`, `text-yellow-600`
- Danger: `bg-red-600`, `text-red-600`
- Gray: `bg-gray-100`, `text-gray-600`

### 4. Spacing

- Small: `p-2`, `m-2`, `gap-2`
- Medium: `p-4`, `m-4`, `gap-4`
- Large: `p-6`, `m-6`, `gap-6`

---

## Adding shadcn/ui Components

To add a new shadcn/ui component:

```bash
npx shadcn-ui@latest add [component-name]
```

**Examples:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
```

This will:
1. Download the component code
2. Add it to `src/components/ui/`
3. Install any required dependencies

---

## Best Practices

1. **Keep components small** - One responsibility per component
2. **Use TypeScript** - Define prop types
3. **Reuse UI components** - Don't reinvent the wheel
4. **Handle all states** - Loading, error, empty, success
5. **Make it accessible** - Use semantic HTML, ARIA labels
6. **Responsive design** - Test on different screen sizes
7. **Consistent styling** - Follow the design system
8. **Document complex components** - Add JSDoc comments
