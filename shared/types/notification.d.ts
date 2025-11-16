import { ObjectId } from 'mongoose';

/**
 * Represents a notification in the application.
 * - `recipientUsername`: Username of the user receiving the notification.
 * - `type`: Type of notification (deletion, appeal_result, flag, suspension, role_change, system_announcement).
 * - `message`: Message content of the notification.
 * - `contentId`: ObjectId of the related content (for appeals, etc.).
 * - `isRead`: Whether the notification has been read.
 * - `timestamp`: Timestamp when the notification was created.
 */
export interface Notification {
  recipientUsername: string;
  type: 'deletion' | 'appeal_result' | 'flag' | 'suspension' | 'role_change' | 'system_announcement';
  message: string;
  contentId: ObjectId | null;
  isRead: boolean;
  timestamp: Date;
}

/**
 * Represents a notification stored in the database.
 * - `_id`: Unique identifier for the notification.
 * - `recipientUsername`: Username of the user receiving the notification.
 * - `type`: Type of notification (deletion, appeal_result, flag, suspension, role_change, system_announcement).
 * - `message`: Message content of the notification.
 * - `contentId`: ObjectId of the related content (for appeals, etc.).
 * - `isRead`: Whether the notification has been read.
 * - `timestamp`: Timestamp when the notification was created.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

