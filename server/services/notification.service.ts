import NotificationModel from '../models/notifications.model';
import { DatabaseNotification } from '@fake-stack-overflow/shared';

/**
 * Response type for notification operations
 */
export interface NotificationResponse {
  notifications?: DatabaseNotification[];
  notification?: DatabaseNotification;
  error?: string;
}

/**
 * Gets all notifications for a user, sorted by timestamp (newest first)
 * @param username - The username to get notifications for
 * @returns Promise resolving to NotificationResponse
 */
export const getNotificationsByUser = async (username: string): Promise<NotificationResponse> => {
  try {
    const notifications = await NotificationModel.find({ recipientUsername: username })
      .sort({ timestamp: -1 })
      .lean();

    return { notifications: notifications as DatabaseNotification[] };
  } catch (error) {
    return { error: `Error fetching notifications: ${(error as Error).message}` };
  }
};

/**
 * Gets unread notifications count for a user
 * @param username - The username to get unread count for
 * @returns Promise resolving to the count
 */
export const getUnreadNotificationCount = async (username: string): Promise<number> => {
  try {
    const count = await NotificationModel.countDocuments({
      recipientUsername: username,
      isRead: false,
    });
    return count;
  } catch (error) {
    return 0;
  }
};

/**
 * Marks a notification as read
 * @param notificationId - The ID of the notification
 * @param username - The username of the user (for authorization)
 * @returns Promise resolving to NotificationResponse
 */
export const markNotificationAsRead = async (
  notificationId: string,
  username: string,
): Promise<NotificationResponse> => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientUsername: username },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return { error: 'Notification not found or unauthorized' };
    }

    return { notification };
  } catch (error) {
    return { error: `Error marking notification as read: ${(error as Error).message}` };
  }
};

/**
 * Marks all notifications as read for a user
 * @param username - The username of the user
 * @returns Promise resolving to NotificationResponse
 */
export const markAllNotificationsAsRead = async (
  username: string,
): Promise<NotificationResponse> => {
  try {
    await NotificationModel.updateMany(
      { recipientUsername: username, isRead: false },
      { isRead: true },
    );
    return {};
  } catch (error) {
    return { error: `Error marking all notifications as read: ${(error as Error).message}` };
  }
};

/**
 * Deletes a notification
 * @param notificationId - The ID of the notification
 * @param username - The username of the user (for authorization)
 * @returns Promise resolving to NotificationResponse
 */
export const deleteNotification = async (
  notificationId: string,
  username: string,
): Promise<NotificationResponse> => {
  try {
    const notification = await NotificationModel.findOneAndDelete({
      _id: notificationId,
      recipientUsername: username,
    });

    if (!notification) {
      return { error: 'Notification not found or unauthorized' };
    }

    return { notification };
  } catch (error) {
    return { error: `Error deleting notification: ${(error as Error).message}` };
  }
};
