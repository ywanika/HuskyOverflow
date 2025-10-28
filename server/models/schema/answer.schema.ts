import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Answer collection.
 *
 * This schema defines the structure for storing answers in the database.
 * Each answer includes the following fields:
 * - `text`: The content of the answer.
 * - `ansBy`: The username of the user who provided the answer.
 * - `ansDateTime`: The date and time when the answer was given.
 * - `comments`: Comments that have been added to the answer by users.
 */
const answerSchema: Schema = new Schema(
  {
    text: {
      type: String,
    },
    ansBy: {
      type: String,
    },
    ansDateTime: {
      type: Date,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
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
  { collection: 'Answer' },
);

export default answerSchema;
