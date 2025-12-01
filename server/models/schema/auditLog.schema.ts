import { Schema } from 'mongoose';

/**
 * Mongoose schema for the AuditLog collection.
 * Tracks all admin actions for audit purposes.
 */
const auditLogSchema: Schema = new Schema(
  {
    adminUsername: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
    targetUser: {
      type: String,
    },
    targetContent: {
      type: String,
    },
    reason: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

export default auditLogSchema;
