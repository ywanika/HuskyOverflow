import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Message collection.
 *
 * This schema defines the structure of a message in the database.
 * Each message includes the following fields:
 * - `msg`: The text of the message.
 * - `msgFrom`: The username of the user sending the message.
 * - `msgDateTime`: The date and time the message was sent.
 * - `type`: The type of message, either 'global' or 'direct'.
 */
const messageSchema: Schema = new Schema(
  {
    msg: {
      type: String,
    },
    msgFrom: {
      type: String,
    },
    msgDateTime: {
      type: Date,
    },
    type: {
      type: String,
      enum: ['global', 'direct'],
    },
    flagged: {
      isFlagged: {
        type: Boolean,
        default: false,
      },
      flaggedBy: [{ type: String }],
      flaggedAt: [{ type: Date }],
      reviewedBy: {
        type: String,
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    deleted: {
      isDeleted: {
        type: Boolean,
        default: false,
      },
      deletedBy: {
        type: String,
        default: null,
      },
      deleteReason: {
        type: String,
        default: '',
      },
      deletedAt: {
        type: Date,
        default: null,
      },
      restoredAt: {
        type: Date,
        default: null,
      },
    },
  },
  { collection: 'Message' },
);

export default messageSchema;
