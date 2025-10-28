import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Comment, DatabaseComment } from './comment';
import { FlaggedInfo, DeletedInfo } from './moderation';

/**
 * Represents an answer to a question.
 * - `text`: The answer text.
 * - `ansBy`: The author of the answer.
 * - `ansDateTime`: The timestamp of when the answer was given.
 * - `comments`: A list of comments associated with the answer.
 * - `flagged`: Flagged information for moderation.
 * - `deleted`: Deleted information for moderation.
 */
export interface Answer {
  text: string;
  ansBy: string;
  ansDateTime: Date;
  comments: Comment[];
  flagged?: FlaggedInfo;
  deleted?: DeletedInfo;
}

/**
 * Represents an answer stored in the database.
 * - `_id`: The unique identifier of the answer.
 * - `comments`: A list of ObjectId references to the comments related to the answer.
 * - `flagged`: Flagged information for moderation.
 * - `deleted`: Deleted information for moderation.
 */
export interface DatabaseAnswer extends Omit<Answer, 'comments'> {
  _id: ObjectId;
  comments: ObjectId[];
}

/**
 * Represents a fully populated answer from the database.
 * - `comments`: A list of populated `DatabaseComment` objects.
 */
export interface PopulatedDatabaseAnswer extends Omit<DatabaseAnswer, 'comments'> {
  comments: DatabaseComment[];
}

/**
 * Interface extending the request body for adding an answer to a question.
 * - `qid`: The unique identifier of the question being answered.
 * - `ans`: The answer being added.
 */
export interface AddAnswerRequest extends Request {
  body: {
    qid: string;
    ans: Answer;
  };
}

/**
 * Type representing possible responses for an Answer-related operation.
 * - Either a `DatabaseAnswer` object or an error message.
 */
export type AnswerResponse = DatabaseAnswer | { error: string };
