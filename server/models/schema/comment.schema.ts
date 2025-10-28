import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Comment collection.
 *
 * This schema defines the structure of comment used in questions and answers in the database.
 * Each comment includes the following fields:
 * - `text`: The content of the comment.
 * - `commentBy`: The username of the user who commented.
 * - `commentDateTime`: The date and time when the comment was posted.
 */
const commentSchema: Schema = new Schema(
  {
    text: {
      type: String,
    },
    commentBy: {
      type: String,
    },
    commentDateTime: {
      type: Date,
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
  { collection: 'Comment' },
);

export default commentSchema;
