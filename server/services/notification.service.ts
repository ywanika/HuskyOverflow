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

/**
 * Creates a system-wide notification for all users
 * @param message - The notification message
 * @returns Promise resolving to NotificationResponse with count of notifications created
 */
export const createSystemNotification = async (
  message: string,
): Promise<NotificationResponse & { count?: number }> => {
  try {
    // Import UserModel to get all users
    const UserModel = (await import('../models/users.model')).default;

    // Get all users
    const users = await UserModel.find({}, { username: 1 }).lean();

    if (!users || users.length === 0) {
      return { error: 'No users found' };
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipientUsername: user.username,
      type: 'system_announcement' as const,
      message,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    }));

    const result = await NotificationModel.insertMany(notifications);

    return { count: result.length };
  } catch (error) {
    return { error: `Error creating system notification: ${(error as Error).message}` };
  }
};

/**
 * Creates a notification for appeal result (approved or rejected)
 * @param recipientUsername - Username of the user who made the appeal
 * @param contentType - Type of content that was appealed
 * @param contentId - ID of the appealed content
 * @param status - Status of the appeal (approved or rejected)
 * @param modResponse - Response from the moderator (optional)
 * @returns Promise resolving to void (errors handled silently)
 */
export const createAppealResultNotification = async (
  recipientUsername: string,
  contentType: 'question' | 'answer' | 'comment' | 'message',
  contentId: string,
  status: 'approved' | 'rejected',
  modResponse?: string,
): Promise<void> => {
  try {
    const { ObjectId } = await import('mongodb');
    const message =
      status === 'approved'
        ? `Your appeal for your ${contentType} has been approved. Your content has been restored.${modResponse ? ` Moderator response: ${modResponse}` : ''}`
        : `Your appeal for your ${contentType} has been rejected.${modResponse ? ` Moderator response: ${modResponse}` : ''}`;

    await NotificationModel.create({
      recipientUsername,
      type: 'appeal_result',
      message,
      contentId: new ObjectId(contentId),
      isRead: false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Error handled silently - don't fail the appeal processing if notification fails
  }
};

/**
 * Creates a notification for role changes (user promoted to moderator, moderator demoted to user, etc.)
 * @param recipientUsername - Username of the user whose role changed
 * @param newRole - The new role assigned to the user
 * @param changedBy - Username of the admin who made the change
 * @returns Promise resolving to void (errors handled silently)
 */
export const createRoleChangeNotification = async (
  recipientUsername: string,
  newRole: 'user' | 'moderator' | 'admin',
  changedBy: string,
): Promise<void> => {
  try {
    const roleMessages: Record<string, string> = {
      user: 'Your role has been changed to regular user.',
      moderator: 'You have been promoted to moderator. You now have access to moderation tools.',
      admin: 'You have been promoted to administrator. You now have access to admin tools.',
    };

    const message = `${roleMessages[newRole]} Changed by: ${changedBy}`;

    await NotificationModel.create({
      recipientUsername,
      type: 'role_change',
      message,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Error handled silently - don't fail the role change if notification fails
  }
};

/**
 * Creates a notification for user suspension
 * @param recipientUsername - Username of the suspended user
 * @param suspendedUntil - Date until which the user is suspended
 * @param reason - Reason for suspension
 * @param suspendedBy - Username of the admin who suspended the user
 * @returns Promise resolving to void (errors handled silently)
 */
export const createSuspensionNotification = async (
  recipientUsername: string,
  suspendedUntil: Date,
  reason: string,
  suspendedBy: string,
): Promise<void> => {
  try {
    const now = new Date();
    const isPermanent = suspendedUntil.getTime() > now.getTime() + 365 * 24 * 60 * 60 * 1000; // More than 1 year = permanent

    const suspensionType = isPermanent ? 'permanently banned' : 'suspended';
    const untilMessage = isPermanent
      ? ''
      : ` Your suspension will be lifted on ${suspendedUntil.toLocaleDateString()}.`;

    const message = `You have been ${suspensionType} from the platform.${untilMessage} Reason: ${reason}. Suspended by: ${suspendedBy}`;

    await NotificationModel.create({
      recipientUsername,
      type: 'suspension',
      message,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Error handled silently - don't fail the suspension if notification fails
  }
};
