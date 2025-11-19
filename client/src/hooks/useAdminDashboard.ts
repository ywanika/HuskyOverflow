import { useState, useEffect, useCallback } from 'react';
import useUserContext from './useUserContext';
import { getDashboardMetrics, DashboardMetrics } from '../services/adminService';
import { sendSystemNotification } from '../services/notificationService';

const useAdminDashboard = () => {
  const { user } = useUserContext();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

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

  const handleNotificationSubmit = async () => {
    if (!notificationMessage.trim()) {
      setNotificationStatus({ type: 'error', message: 'Please enter a notification message' });
      return;
    }

    try {
      const result = await sendSystemNotification(notificationMessage);
      setNotificationStatus({
        type: 'success',
        message: `Notification sent to ${result.count} users successfully!`,
      });
      setNotificationMessage('');
    } catch (err) {
      setNotificationStatus({
        type: 'error',
        message: (err as Error).message || 'Failed to send notification',
      });
    }
  };

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    notificationMessage,
    setNotificationMessage,
    notificationStatus,
    handleNotificationSubmit,
  };
};

export default useAdminDashboard;
