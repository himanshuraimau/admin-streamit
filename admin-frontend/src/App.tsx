import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { UserDetailPage } from "./pages/users/UserDetailPage";
import { CreatorApplicationsPage } from "./pages/creators/ApplicationsPage";

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
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
            
            {/* Placeholder routes */}
            <Route path="/payments" element={<div>Payments (Coming Soon)</div>} />
            <Route path="/gifts" element={<div>Gifts (Coming Soon)</div>} />
            <Route path="/discounts" element={<div>Discounts (Coming Soon)</div>} />
            <Route path="/content" element={<div>Content (Coming Soon)</div>} />
            <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
            <Route path="/logs" element={<div>Logs (Coming Soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
