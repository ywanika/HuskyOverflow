import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Appeal collection.
 *
 * This schema defines the structure for storing appeals in the database.
 * Each appeal includes the following fields:
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
const appealSchema: Schema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['question', 'answer', 'comment', 'message'],
      required: true,
    },
    appealUser: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    modResponse: {
      type: String,
      default: '',
    },
    processedBy: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { collection: 'Appeal' },
);

export default appealSchema;
