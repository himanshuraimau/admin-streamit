import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './components/layout/admin-layout';
import DashboardPage from './pages/dashboard';
import UsersListPage from './pages/users/list';
import CreatorApplicationsPage from './pages/creators/applications';
import ContentReportsPage from './pages/content/reports';
import AnalyticsPage from './pages/analytics';
import SettingsPage from './pages/settings';
import LoginPage from './pages/auth/login';
import { ProtectedRoute } from './components/layout/protected-route';



const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/dashboard" element={<Navigate to="/" replace />} />
                            <Route path="/users" element={<UsersListPage />} />
                            <Route path="/creators" element={<CreatorApplicationsPage />} />
                            <Route path="/content" element={<Navigate to="/reports" replace />} />
                            <Route path="/reports" element={<ContentReportsPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<div className="p-10 text-center">Page not found</div>} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
