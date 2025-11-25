import { useEffect, useState, useCallback } from 'react';
import { DatabaseNotification } from '@fake-stack-overflow/shared';
import { FakeSOSocket } from '../types/types';
import type { ObjectId } from 'mongoose';

/**
 * Helper function to safely convert ObjectId to string
 * ObjectId from mongoose has a proper toString() method that returns a string representation
 */
const objectIdToString = (id: ObjectId | string): string => {
  if (typeof id === 'string') {
    return id;
  }
  // ObjectId from mongoose has a toString method that returns hex string
  // Type assertion needed because TypeScript doesn't recognize ObjectId's custom toString
  const objectId = id as { toString(): string };
  return objectId.toString();
};
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notificationService';
import useUserContext from './useUserContext';

/**
 * Hook for managing user notifications
 * @param socket - Socket instance for real-time updates
 * @returns Object containing notifications state and handlers
 */
const useNotifications = (socket: FakeSOSocket | null) => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches notifications and unread count
   */
  const fetchNotifications = useCallback(async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [notificationsData, count] = await Promise.all([
        getNotifications(user.username),
        getUnreadNotificationCount(user.username),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(count);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  /**
   * Marks a notification as read
   */
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.username) return;

      try {
        await markNotificationAsRead(notificationId, user.username);
        setNotifications(prev =>
          prev.map(notif =>
            objectIdToString(notif._id) === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        setError('Failed to mark notification as read.');
      }
    },
    [user?.username],
  );

  /**
   * Marks all notifications as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.username) return;

    try {
      await markAllNotificationsAsRead(user.username);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all notifications as read.');
    }
  }, [user?.username]);

  /**
   * Deletes a notification
   */
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.username) return;

      try {
        await deleteNotification(notificationId, user.username);
        const deletedNotification = notifications.find(
          notif => objectIdToString(notif._id) === notificationId,
        );
        setNotifications(prev =>
          prev.filter(notif => objectIdToString(notif._id) !== notificationId),
        );
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError('Failed to delete notification.');
      }
    },
    [user?.username, notifications],
  );

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notification updates
  useEffect(() => {
    if (!socket || !user?.username) return;

    const handleNotificationUpdate = (payload: {
      type: string;
      username: string;
      notificationId?: string;
    }) => {
      // Only update if the notification is for the current user
      if (payload.username !== user.username) return;

      // Refresh notifications when updates occur
      fetchNotifications();
    };

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, [socket, user?.username, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications: fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
};

export default useNotifications;
