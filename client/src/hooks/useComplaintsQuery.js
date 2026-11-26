import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/axiosInstance';

/**
 * Custom hooks leveraging TanStack React Query v5.
 * Demonstrates:
 * - Unit V: Server-state management, API caching, background refetching, cache invalidation
 */

/**
 * Query hook for paginated, filtered complaints
 */
export const useComplaints = (filters = {}) => {
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: async () => {
      const data = await api.get('/complaints', { params: filters });
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds fresh cache
  });
};

/**
 * Query hook for single complaint public timeline tracker
 */
export const useComplaintTracker = (trackingId) => {
  return useQuery({
    queryKey: ['complaint', trackingId],
    queryFn: async () => {
      if (!trackingId) return null;
      const data = await api.get(`/complaints/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
      return data;
    },
    enabled: !!trackingId,
    refetchInterval: 10000, // Background sync every 10 seconds for real-time feel
  });
};

/**
 * Query hook for administrative analytics
 */
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const data = await api.get('/admin/analytics');
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Mutation hook for administrative staff assignment
 */
export const useAssignStaffMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ complaintId, staffId, priority, notes }) => {
      return api.post('/admin/assign', { complaintId, staffId, priority, notes });
    },
    onSuccess: () => {
      // Invalidate complaints cache so UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });
};

/**
 * Mutation hook for staff task resolution
 */
export const useResolveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ complaintId, formData }) => {
      return api.post(`/staff/complaints/${complaintId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.trackingId] });
      queryClient.invalidateQueries({ queryKey: ['staff-queue'] });
    },
  });
};
