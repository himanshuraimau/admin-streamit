import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { UserDetailPage } from "./pages/users/UserDetailPage";
import { CreatorApplicationsPage } from "./pages/creators/ApplicationsPage";
import PaymentsPage from "./pages/payments/PaymentsPage";
import GiftsPage from "./pages/gifts/GiftsPage";
import DiscountCodesPage from "./pages/discounts/DiscountCodesPage";
import ContentModerationPage from "./pages/content/ContentModerationPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ActivityLogsPage from "./pages/logs/ActivityLogsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple auth check (TODO: Implement proper auth with Better Auth)
const isAuthenticated = () => {
  // For now, just return true
  // Later: Check Better Auth session
  return true;
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors closeButton />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/creators" element={<CreatorApplicationsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/gifts" element={<GiftsPage />} />
            <Route path="/discounts" element={<DiscountCodesPage />} />
            <Route path="/content" element={<ContentModerationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/logs" element={<ActivityLogsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
