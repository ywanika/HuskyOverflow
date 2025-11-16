import { Schema } from 'mongoose';

/**
 * Mongoose schema for the AccessEscalationRequest collection.
 *
 * This schema defines the structure for storing access escalation requests in the database.
 * Each request includes the following fields:
 * - `username`: Username of the user requesting access.
 * - `requestedRole`: Role being requested (moderator or admin).
 * - `reason`: Reason for the access request.
 * - `status`: Current status of the request (pending, approved, rejected).
 * - `reviewedBy`: Username of the admin who reviewed the request.
 * - `reviewedAt`: Timestamp when the request was reviewed.
 * - `responseMessage`: Response message from the admin.
 * - `timestamp`: Timestamp when the request was submitted.
 */
const accessEscalationRequestSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ['moderator', 'admin'],
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
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    responseMessage: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'AccessEscalationRequest' },
);

export default accessEscalationRequestSchema;
