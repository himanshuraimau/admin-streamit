import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Users
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });
};

export const useBanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            await api.post(`/users/${userId}/ban`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

// Creators
export const useCreatorApplications = () => {
    return useQuery({
        queryKey: ['creator-applications'],
        queryFn: async () => {
            const { data } = await api.get('/creators/pending');
            return data;
        },
    });
};

export const useReviewApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
            await api.post(`/creators/applications/${id}/review`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creator-applications'] });
        },
    });
};

// Content
export const useContentReports = () => {
    return useQuery({
        queryKey: ['content-reports'],
        queryFn: async () => {
            const { data } = await api.get('/content/reports');
            return data;
        },
    });
};

// Analytics
export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/dashboard');
            return data;
        },
    });
};
