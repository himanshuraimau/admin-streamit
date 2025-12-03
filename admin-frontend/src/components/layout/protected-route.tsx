import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "@/lib/auth";

export function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (!authService.isAuthenticated()) {
                setIsAuthenticated(false);
                return;
            }

            // Verify token is still valid by fetching profile
            const profile = await authService.getProfile();
            setIsAuthenticated(!!profile);
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
