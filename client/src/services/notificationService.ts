import api from './config';
import { DatabaseNotification } from '@fake-stack-overflow/shared';

const NOTIFICATION_API_URL = `/api/notification`;

/**
 * Fetches all notifications for a user
 * @param username - The username to get notifications for
 * @returns Promise resolving to array of notifications
 * @throws Error if the API response status is not 200
 */
export const getNotifications = async (username: string): Promise<DatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/${username}`);

  if (res.status !== 200) {
    throw new Error('Error while fetching notifications');
  }

  return res.data;
};

/**
 * Fetches unread notification count for a user
 * @param username - The username to get unread count for
 * @returns Promise resolving to the count
 * @throws Error if the API response status is not 200
 */
export const getUnreadNotificationCount = async (username: string): Promise<number> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/unread/${username}`);

  if (res.status !== 200) {
    throw new Error('Error while fetching unread notification count');
  }

  return res.data.count;
};

/**
 * Marks a notification as read
 * @param notificationId - The ID of the notification
 * @param username - The username of the user
 * @returns Promise resolving to success status
 * @throws Error if the API response status is not 200
 */
export const markNotificationAsRead = async (
  notificationId: string,
  username: string,
): Promise<{ success: boolean }> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/read/${notificationId}`, { username });

  if (res.status !== 200) {
    throw new Error('Error while marking notification as read');
  }

  return res.data;
};

/**
 * Marks all notifications as read for a user
 * @param username - The username of the user
 * @returns Promise resolving to success status
 * @throws Error if the API response status is not 200
 */
export const markAllNotificationsAsRead = async (username: string): Promise<{ success: boolean }> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/read-all`, { username });

  if (res.status !== 200) {
    throw new Error('Error while marking all notifications as read');
  }

  return res.data;
};

/**
 * Deletes a notification
 * @param notificationId - The ID of the notification
 * @param username - The username of the user
 * @returns Promise resolving to success status
 * @throws Error if the API response status is not 200
 */
export const deleteNotification = async (
  notificationId: string,
  username: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`${NOTIFICATION_API_URL}/${notificationId}`, {
    data: { username },
  });

  if (res.status !== 200) {
    throw new Error('Error while deleting notification');
  }

  return res.data;
};

