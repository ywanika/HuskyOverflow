import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Question collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - `title`: The title of the question.
 * - `text`: The detailed content of the question.
 * - `tags`: An array of references to `Tag` documents associated with the question.
 * - `answers`: An array of references to `Answer` documents associated with the question.
 * - `askedBy`: The username of the user who asked the question.
 * - `askDateTime`: The date and time when the question was asked.
 * - `views`: An array of usernames that have viewed the question.
 * - `upVotes`: An array of usernames that have upvoted the question.
 * - `downVotes`: An array of usernames that have downvoted the question.
 * - `comments`: Comments that have been added to the question by users.
 */
const questionSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    askedBy: {
      type: String,
    },
    askDateTime: {
      type: Date,
    },
    views: [{ type: String }],
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
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
  { collection: 'Question' },
);

export default questionSchema;
