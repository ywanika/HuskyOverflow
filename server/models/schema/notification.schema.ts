import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Notification collection.
 *
 * This schema defines the structure for storing notifications in the database.
 * Each notification includes the following fields:
 * - `recipientUsername`: Username of the user receiving the notification.
 * - `type`: Type of notification (deletion, appeal_result, flag, suspension, role_change, system_announcement).
 * - `message`: Message content of the notification.
 * - `contentId`: ObjectId of the related content (for appeals, etc.).
 * - `isRead`: Whether the notification has been read.
 * - `timestamp`: Timestamp when the notification was created.
 */
const notificationSchema: Schema = new Schema(
  {
    recipientUsername: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['deletion', 'appeal_result', 'flag', 'suspension', 'role_change', 'system_announcement'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'Notification' },
);

export default notificationSchema;
