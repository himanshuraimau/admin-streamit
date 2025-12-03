import api from './api';

interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        token: string;
        admin: {
            id: string;
            email: string;
            name: string;
        };
    };
    error?: string;
}

interface AdminProfile {
    id: string;
    email: string;
    name: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/api/admin/auth/login', {
            email,
            password,
        });

        if (data.success && data.data?.token) {
            // Store token in localStorage
            localStorage.setItem('admin_token', data.data.token);
            // Set token in axios default headers
            api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        }

        return data;
    },

    async getProfile(): Promise<AdminProfile | null> {
        try {
            const { data } = await api.get('/api/admin/auth/me');
            if (data.success) {
                return data.data;
            }
            return null;
        } catch (error) {
            return null;
        }
    },

    async logout(): Promise<void> {
        const token = localStorage.getItem('admin_token');
        if (token) {
            try {
                await api.post('/api/admin/auth/logout', { token });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.removeItem('admin_token');
        delete api.defaults.headers.common['Authorization'];
    },

    getToken(): string | null {
        return localStorage.getItem('admin_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    initializeAuth(): void {
        const token = this.getToken();
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    async createAdmin(data: { email: string; password: string; name: string }) {
        const response = await api.post('/api/admin/auth/register', data);
        return response.data;
    },

    async getAdmins() {
        const response = await api.get('/api/admin/auth/list');
        return response.data;
    },

    async deleteAdmin(adminId: string) {
        const response = await api.delete(`/api/admin/auth/${adminId}`);
        return response.data;
    },
};

// Initialize auth on module load
authService.initializeAuth();
