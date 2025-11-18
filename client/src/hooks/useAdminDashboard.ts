import { useState, useEffect, useCallback } from 'react';
import useUserContext from './useUserContext';
import { getDashboardMetrics, DashboardMetrics } from '../services/adminService';

const useAdminDashboard = () => {
  const { user } = useUserContext();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getDashboardMetrics(user.username);
      setMetrics(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [user.username]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
};

export default useAdminDashboard;
