import { ObjectId } from 'mongodb';

/**
 * Represents flagged information for content moderation.
 * - `isFlagged`: Whether the content is flagged for review.
 * - `flaggedBy`: Array of usernames who flagged the content.
 * - `flaggedAt`: Array of timestamps when the content was flagged.
 * - `reviewedBy`: Username of the moderator who reviewed the flag.
 * - `reviewedAt`: Timestamp when the flag was reviewed.
 */
export interface FlaggedInfo {
  isFlagged: boolean;
  flaggedBy: string[];
  flaggedAt: Date[];
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Represents deleted information for content moderation.
 * - `isDeleted`: Whether the content is deleted.
 * - `deletedBy`: Username of the moderator/admin who deleted the content.
 * - `deleteReason`: Reason for deletion.
 * - `deletedAt`: Timestamp when the content was deleted.
 * - `restoredAt`: Timestamp when the content was restored (if applicable).
 */
export interface DeletedInfo {
  isDeleted: boolean;
  deletedBy?: string;
  deleteReason?: string;
  deletedAt?: Date;
  restoredAt?: Date;
}

/**
 * Represents a notification in the system.
 * - `recipientUsername`: Username of the user receiving the notification.
 * - `type`: Type of notification (deletion, appeal_result, flag, suspension, role_change, system_announcement).
 * - `message`: Message content of the notification.
 * - `contentId`: ObjectId of the related content (for appeals, etc.).
 * - `isRead`: Whether the notification has been read.
 * - `timestamp`: Timestamp when the notification was created.
 */
export interface Notification {
  recipientUsername: string;
  type:
    | 'deletion'
    | 'appeal_result'
    | 'flag'
    | 'suspension'
    | 'role_change'
    | 'system_announcement';
  message: string;
  contentId?: ObjectId;
  isRead: boolean;
  timestamp: Date;
}

/**
 * Represents a notification stored in the database.
 * - `_id`: Unique identifier for the notification.
 * - `recipientUsername`: Username of the user receiving the notification.
 * - `type`: Type of notification.
 * - `message`: Message content of the notification.
 * - `contentId`: ObjectId of the related content.
 * - `isRead`: Whether the notification has been read.
 * - `timestamp`: Timestamp when the notification was created.
 */
export interface DatabaseNotification extends Notification {
  _id: ObjectId;
}

/**
 * Represents an appeal for content moderation.
 * - `contentId`: ObjectId of the content being appealed.
 * - `contentType`: Type of content being appealed (question, answer, comment, message).
 * - `appealUser`: Username of the user making the appeal.
 * - `reason`: Reason for the appeal.
 * - `status`: Current status of the appeal (pending, approved, rejected).
 * - `modResponse`: Response from the moderator.
 * - `processedBy`: Username of the moderator who processed the appeal.
 * - `timestamp`: Timestamp when the appeal was submitted.
 * - `processedAt`: Timestamp when the appeal was processed.
 */
export interface Appeal {
  contentId: ObjectId;
  contentType: 'question' | 'answer' | 'comment' | 'message';
  appealUser: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  modResponse?: string;
  processedBy?: string;
  timestamp: Date;
  processedAt?: Date;
}

/**
 * Represents an appeal stored in the database.
 * - `_id`: Unique identifier for the appeal.
 * - `contentId`: ObjectId of the content being appealed.
 * - `contentType`: Type of content being appealed.
 * - `appealUser`: Username of the user making the appeal.
 * - `reason`: Reason for the appeal.
 * - `status`: Current status of the appeal.
 * - `modResponse`: Response from the moderator.
 * - `processedBy`: Username of the moderator who processed the appeal.
 * - `timestamp`: Timestamp when the appeal was submitted.
 * - `processedAt`: Timestamp when the appeal was processed.
 */
export interface DatabaseAppeal extends Appeal {
  _id: ObjectId;
}

export interface AccessEscalationRequest {
  _id: ObjectId;
  username: string;
  requestedRole: 'moderator' | 'admin';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  responseMessage?: string;
  timestamp: Date;
}
