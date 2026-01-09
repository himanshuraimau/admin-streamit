# State Management

Guide to managing state and data fetching in the StreamIt Admin Dashboard.

## Overview

The app uses:
- **TanStack Query** (React Query) - Server state management
- **React useState** - Local component state
- **localStorage** - Authentication token

No global state management library (Redux, Zustand) is needed.

---

## TanStack Query

All API calls use TanStack Query for:
- Automatic caching
- Background refetching
- Loading & error states
- Optimistic updates
- Pagination support

### Setup

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## Fetching Data

### Basic Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/users');
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Query with Parameters

```tsx
const [page, setPage] = useState(1);
const [role, setRole] = useState('all');

const { data, isLoading } = useQuery({
  queryKey: ['users', page, role],
  queryFn: async () => {
    const { data } = await api.get('/api/admin/users', {
      params: { page, role: role !== 'all' ? role : undefined },
    });
    return data;
  },
});
```

**Key Points:**
- `queryKey` includes all parameters
- Query refetches when key changes
- Automatic caching by key

### Dependent Queries

```tsx
// Fetch user first
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: async () => {
    const { data } = await api.get(`/api/admin/users/${userId}`);
    return data;
  },
});

// Then fetch user's posts
const { data: posts } = useQuery({
  queryKey: ['posts', userId],
  queryFn: async () => {
    const { data } = await api.get(`/api/admin/posts`, {
      params: { authorId: userId },
    });
    return data;
  },
  enabled: !!user, // Only run if user is loaded
});
```

---

## Mutations

For creating, updating, or deleting data.

### Basic Mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

function SuspendUserButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: async (data: { reason: string }) => {
      await api.patch(`/api/admin/users/${userId}/suspend`, data);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('User suspended successfully');
    },
    onError: (error) => {
      toast.error(`Failed to suspend user: ${error.message}`);
    },
  });

  const handleSuspend = () => {
    suspendMutation.mutate({
      reason: 'Violation of community guidelines',
    });
  };

  return (
    <Button
      onClick={handleSuspend}
      disabled={suspendMutation.isPending}
    >
      {suspendMutation.isPending ? 'Suspending...' : 'Suspend User'}
    </Button>
  );
}
```

### Mutation with Form

```tsx
import { useForm } from 'react-hook-form';

function CreateGiftForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/api/admin/virtual-gifts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Gift created successfully');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} placeholder="Gift name" />
      <Input {...register('coinPrice', { valueAsNumber: true })} type="number" />
      <Button type="submit" disabled={createMutation.isPending}>
        Create Gift
      </Button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
const deleteMutation = useMutation({
  mutationFn: async (postId: string) => {
    await api.delete(`/api/admin/posts/${postId}`);
  },
  onMutate: async (postId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['posts'] });

    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(['posts']);

    // Optimistically update
    queryClient.setQueryData(['posts'], (old: any) => ({
      ...old,
      data: old.data.filter((post: any) => post.id !== postId),
    }));

    // Return context with snapshot
    return { previousPosts };
  },
  onError: (err, postId, context) => {
    // Rollback on error
    queryClient.setQueryData(['posts'], context?.previousPosts);
    toast.error('Failed to delete post');
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

---

## Local State

Use `useState` for component-local state.

### Form State

```tsx
function FilterForm() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [suspended, setSuspended] = useState(false);

  return (
    <div className="flex gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="USER">User</SelectItem>
          <SelectItem value="CREATOR">Creator</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Modal State

```tsx
function UserActions({ userId }: { userId: string }) {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowSuspendDialog(true)}>
        Suspend User
      </Button>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
          </DialogHeader>
          {/* Suspend form */}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Authentication State

Stored in localStorage and managed by auth helpers.

### Auth Helpers

```tsx
// src/lib/auth.ts
export const auth = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
```

### Usage

```tsx
// Login
const handleLogin = async (email: string, password: string) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  auth.setToken(data.token);
  navigate('/dashboard');
};

// Logout
const handleLogout = () => {
  auth.logout();
};

// Check auth
useEffect(() => {
  if (!auth.isAuthenticated()) {
    navigate('/login');
  }
}, []);
```

---

## Pagination State

```tsx
function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/users', {
        params: { page, limit },
      });
      return data;
    },
  });

  const { pagination } = data || {};

  return (
    <div>
      {/* Table */}
      
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page} of {pagination?.totalPages}</span>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={page >= pagination?.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

## Filter State

```tsx
function UsersPage() {
  const [filters, setFilters] = useState({
    role: 'all',
    suspended: false,
    search: '',
  });

  const { data } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = {
        role: filters.role !== 'all' ? filters.role : undefined,
        suspended: filters.suspended || undefined,
        search: filters.search || undefined,
      };
      const { data } = await api.get('/api/admin/users', { params });
      return data;
    },
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Select
          value={filters.role}
          onValueChange={(role) => setFilters({ ...filters, role })}
        >
          {/* Options */}
        </Select>

        <Input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search..."
        />
      </div>

      {/* Results */}
    </div>
  );
}
```

---

## Query Invalidation

Invalidate queries to refetch data.

### After Mutation

```tsx
const mutation = useMutation({
  mutationFn: async (data) => {
    await api.post('/api/admin/users', data);
  },
  onSuccess: () => {
    // Invalidate all user queries
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### Manual Refetch

```tsx
const { data, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

<Button onClick={() => refetch()}>
  Refresh
</Button>
```

### Invalidate Multiple

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
  queryClient.invalidateQueries({ queryKey: ['analytics'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}
```

---

## Error Handling

### Query Errors

```tsx
const { data, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

if (isError) {
  return (
    <div className="p-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">
            Error loading users: {error.message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Mutation Errors

```tsx
const mutation = useMutation({
  mutationFn: suspendUser,
  onError: (error) => {
    toast.error(`Failed to suspend user: ${error.message}`);
  },
});
```

### Global Error Handler

```tsx
// In API client
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.logout();
    }
    return Promise.reject(error);
  }
);
```

---

## Best Practices

1. **Use query keys wisely** - Include all parameters
2. **Invalidate after mutations** - Keep data fresh
3. **Handle loading states** - Show spinners
4. **Handle error states** - Show error messages
5. **Use optimistic updates** - For better UX
6. **Keep state close** - Use local state when possible
7. **Avoid prop drilling** - Use composition instead
8. **Cache appropriately** - Set staleTime based on data
9. **Clean up on unmount** - Cancel queries if needed
10. **Test edge cases** - Empty states, errors, etc.

---

## Common Patterns

### Refetch on Interval

```tsx
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboard,
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

### Prefetch Data

```tsx
const queryClient = useQueryClient();

// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
};
```

### Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hooks Docs](https://react.dev/reference/react)
