import { ObjectId } from 'mongodb';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import UserModel from '../models/users.model';
import NotificationModel from '../models/notifications.model';
import { DatabaseUser, DatabaseQuestion, DatabaseAnswer, DatabaseComment } from '../types/types';

/**
 * Response type for moderation operations
 */
export interface ModerationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Checks if a user has moderator or admin privileges
 * @param username - The username to check
 * @returns Promise resolving to true if user is moderator/admin, false otherwise
 */
export const isModerator = async (username: string): Promise<boolean> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username });
    if (!user) {
      return false;
    }
    return user.role === 'moderator' || user.role === 'admin';
  } catch (error) {
    return false;
  }
};

/**
 * Creates a notification for content deletion
 * @param recipientUsername - Username of the content creator
 * @param contentType - Type of content that was deleted
 * @param contentId - ID of the deleted content
 * @param reason - Reason for deletion
 */
const createDeletionNotification = async (
  recipientUsername: string,
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  reason: string,
): Promise<void> => {
  try {
    await NotificationModel.create({
      recipientUsername,
      type: 'deletion',
      message: `Your ${contentType} has been deleted by a moderator. Reason: ${reason}`,
      contentId: new ObjectId(contentId),
      isRead: false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Error handled silently - don't fail the deletion if notification fails
  }
};

/**
 * Deletes a question (marks as deleted) - Moderator only
 * @param questionId - The ID of the question to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to ModerationResponse
 */
export const deleteQuestion = async (
  questionId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can delete content',
      };
    }

    // Find and update the question
    const question: DatabaseQuestion | null = await QuestionModel.findByIdAndUpdate(
      questionId,
      {
        'deleted.isDeleted': true,
        'deleted.deletedBy': moderatorUsername,
        'deleted.deleteReason': deleteReason,
        'deleted.deletedAt': new Date(),
      },
      { new: true },
    );

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Create notification for the question author
    await createDeletionNotification(question.askedBy, 'question', questionId, deleteReason);

    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    return { success: false, error: `Error deleting question: ${(error as Error).message}` };
  }
};

/**
 * Deletes an answer (marks as deleted) - Moderator only
 * @param answerId - The ID of the answer to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to ModerationResponse
 */
export const deleteAnswer = async (
  answerId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can delete content',
      };
    }

    // Find and update the answer
    const answer: DatabaseAnswer | null = await AnswerModel.findByIdAndUpdate(
      answerId,
      {
        'deleted.isDeleted': true,
        'deleted.deletedBy': moderatorUsername,
        'deleted.deleteReason': deleteReason,
        'deleted.deletedAt': new Date(),
      },
      { new: true },
    );

    if (!answer) {
      return { success: false, error: 'Answer not found' };
    }

    // Create notification for the answer author
    await createDeletionNotification(answer.ansBy, 'answer', answerId, deleteReason);

    return { success: true, message: 'Answer deleted successfully' };
  } catch (error) {
    return { success: false, error: `Error deleting answer: ${(error as Error).message}` };
  }
};

/**
 * Deletes a comment (marks as deleted) - Moderator only
 * @param commentId - The ID of the comment to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to ModerationResponse
 */
export const deleteComment = async (
  commentId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can delete content',
      };
    }

    // Find and update the comment
    const comment: DatabaseComment | null = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        'deleted.isDeleted': true,
        'deleted.deletedBy': moderatorUsername,
        'deleted.deleteReason': deleteReason,
        'deleted.deletedAt': new Date(),
      },
      { new: true },
    );

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Create notification for the comment author
    await createDeletionNotification(comment.commentBy, 'comment', commentId, deleteReason);

    return { success: true, message: 'Comment deleted successfully' };
  } catch (error) {
    return { success: false, error: `Error deleting comment: ${(error as Error).message}` };
  }
};

/**
 * Creates a notification for moderators when content is flagged
 * @param contentType - Type of content that was flagged
 * @param contentId - ID of the flagged content
 * @param flaggedBy - Username of the user who flagged the content
 */
const createFlagNotification = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  flaggedBy: string,
): Promise<void> => {
  try {
    // Get all moderators and admins
    const moderators = await UserModel.find({
      role: { $in: ['moderator', 'admin'] },
    });

    // Create notifications for all moderators
    const notifications = moderators.map(moderator =>
      NotificationModel.create({
        recipientUsername: moderator.username,
        type: 'flag',
        message: `A ${contentType} has been flagged by ${flaggedBy}`,
        contentId: new ObjectId(contentId),
        isRead: false,
        timestamp: new Date(),
      }),
    );

    await Promise.all(notifications);
  } catch (error) {
    // Error handled silently - don't fail the flag if notification fails
  }
};

/**
 * Flags a question - Any user can flag
 * @param questionId - The ID of the question to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const flagQuestion = async (
  questionId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the question
    const question: DatabaseQuestion | null = await QuestionModel.findById(questionId);

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Check if user has already flagged this question
    if (question.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have already flagged this question' };
    }

    // Update the question with the flag
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      {
        'flagged.isFlagged': true,
        '$addToSet': { 'flagged.flaggedBy': username },
        '$push': { 'flagged.flaggedAt': new Date() },
      },
      { new: true },
    );

    if (!updatedQuestion) {
      return { success: false, error: 'Failed to flag question' };
    }

    // Create notification for moderators
    await createFlagNotification('question', questionId, username);

    return { success: true, message: 'Question flagged successfully' };
  } catch (error) {
    return { success: false, error: `Error flagging question: ${(error as Error).message}` };
  }
};

/**
 * Flags an answer - Any user can flag
 * @param answerId - The ID of the answer to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const flagAnswer = async (
  answerId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the answer
    const answer: DatabaseAnswer | null = await AnswerModel.findById(answerId);

    if (!answer) {
      return { success: false, error: 'Answer not found' };
    }

    // Check if user has already flagged this answer
    if (answer.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have already flagged this answer' };
    }

    // Update the answer with the flag
    const updatedAnswer = await AnswerModel.findByIdAndUpdate(
      answerId,
      {
        'flagged.isFlagged': true,
        '$addToSet': { 'flagged.flaggedBy': username },
        '$push': { 'flagged.flaggedAt': new Date() },
      },
      { new: true },
    );

    if (!updatedAnswer) {
      return { success: false, error: 'Failed to flag answer' };
    }

    // Create notification for moderators
    await createFlagNotification('answer', answerId, username);

    return { success: true, message: 'Answer flagged successfully' };
  } catch (error) {
    return { success: false, error: `Error flagging answer: ${(error as Error).message}` };
  }
};

/**
 * Flags a comment - Any user can flag
 * @param commentId - The ID of the comment to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const flagComment = async (
  commentId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the comment
    const comment: DatabaseComment | null = await CommentModel.findById(commentId);

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Check if user has already flagged this comment
    if (comment.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have already flagged this comment' };
    }

    // Update the comment with the flag
    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        'flagged.isFlagged': true,
        '$addToSet': { 'flagged.flaggedBy': username },
        '$push': { 'flagged.flaggedAt': new Date() },
      },
      { new: true },
    );

    if (!updatedComment) {
      return { success: false, error: 'Failed to flag comment' };
    }

    // Create notification for moderators
    await createFlagNotification('comment', commentId, username);

    return { success: true, message: 'Comment flagged successfully' };
  } catch (error) {
    return { success: false, error: `Error flagging comment: ${(error as Error).message}` };
  }
};

/**
 * Unflags a question - Any user can unflag their own flag
 * @param questionId - The ID of the question to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const unflagQuestion = async (
  questionId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the question
    const question: DatabaseQuestion | null = await QuestionModel.findById(questionId);

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Check if user has flagged this question
    if (!question.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have not flagged this question' };
    }

    // Remove the user from flaggedBy array
    const updatedFlaggedBy = question.flagged.flaggedBy.filter(u => u !== username);
    const flaggedByIndex = question.flagged.flaggedBy.indexOf(username);
    const updatedFlaggedAt = question.flagged.flaggedAt.filter(
      (_, index) => index !== flaggedByIndex,
    );

    // Update the question - if no one else has flagged, set isFlagged to false
    const isStillFlagged = updatedFlaggedBy.length > 0;

    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      {
        'flagged.isFlagged': isStillFlagged,
        'flagged.flaggedBy': updatedFlaggedBy,
        'flagged.flaggedAt': updatedFlaggedAt,
      },
      { new: true },
    );

    if (!updatedQuestion) {
      return { success: false, error: 'Failed to unflag question' };
    }

    return { success: true, message: 'Question unflagged successfully' };
  } catch (error) {
    return { success: false, error: `Error unflagging question: ${(error as Error).message}` };
  }
};

/**
 * Unflags an answer - Any user can unflag their own flag
 * @param answerId - The ID of the answer to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const unflagAnswer = async (
  answerId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the answer
    const answer: DatabaseAnswer | null = await AnswerModel.findById(answerId);

    if (!answer) {
      return { success: false, error: 'Answer not found' };
    }

    // Check if user has flagged this answer
    if (!answer.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have not flagged this answer' };
    }

    // Remove the user from flaggedBy array
    const updatedFlaggedBy = answer.flagged.flaggedBy.filter(u => u !== username);
    const flaggedByIndex = answer.flagged.flaggedBy.indexOf(username);
    const updatedFlaggedAt = answer.flagged.flaggedAt.filter(
      (_, index) => index !== flaggedByIndex,
    );

    // Update the answer - if no one else has flagged, set isFlagged to false
    const isStillFlagged = updatedFlaggedBy.length > 0;

    const updatedAnswer = await AnswerModel.findByIdAndUpdate(
      answerId,
      {
        'flagged.isFlagged': isStillFlagged,
        'flagged.flaggedBy': updatedFlaggedBy,
        'flagged.flaggedAt': updatedFlaggedAt,
      },
      { new: true },
    );

    if (!updatedAnswer) {
      return { success: false, error: 'Failed to unflag answer' };
    }

    return { success: true, message: 'Answer unflagged successfully' };
  } catch (error) {
    return { success: false, error: `Error unflagging answer: ${(error as Error).message}` };
  }
};

/**
 * Unflags a comment - Any user can unflag their own flag
 * @param commentId - The ID of the comment to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to ModerationResponse
 */
export const unflagComment = async (
  commentId: string,
  username: string,
): Promise<ModerationResponse> => {
  try {
    // Find the comment
    const comment: DatabaseComment | null = await CommentModel.findById(commentId);

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Check if user has flagged this comment
    if (!comment.flagged?.flaggedBy?.includes(username)) {
      return { success: false, error: 'You have not flagged this comment' };
    }

    // Remove the user from flaggedBy array
    const updatedFlaggedBy = comment.flagged.flaggedBy.filter(u => u !== username);
    const flaggedByIndex = comment.flagged.flaggedBy.indexOf(username);
    const updatedFlaggedAt = comment.flagged.flaggedAt.filter(
      (_, index) => index !== flaggedByIndex,
    );

    // Update the comment - if no one else has flagged, set isFlagged to false
    const isStillFlagged = updatedFlaggedBy.length > 0;

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        'flagged.isFlagged': isStillFlagged,
        'flagged.flaggedBy': updatedFlaggedBy,
        'flagged.flaggedAt': updatedFlaggedAt,
      },
      { new: true },
    );

    if (!updatedComment) {
      return { success: false, error: 'Failed to unflag comment' };
    }

    return { success: true, message: 'Comment unflagged successfully' };
  } catch (error) {
    return { success: false, error: `Error unflagging comment: ${(error as Error).message}` };
  }
};

/**
 * Interface for flagged content items
 */
export interface FlaggedContentItem {
  _id: string;
  contentType: 'question' | 'answer' | 'comment';
  content: DatabaseQuestion | DatabaseAnswer | DatabaseComment;
  flaggedBy: string[];
  flaggedAt: Date[];
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Response type for getting flagged content
 */
export interface FlaggedContentResponse {
  questions: FlaggedContentItem[];
  answers: FlaggedContentItem[];
  comments: FlaggedContentItem[];
  error?: string;
}

/**
 * Gets all flagged content that hasn't been reviewed yet
 * @returns Promise resolving to FlaggedContentResponse
 */
export const getFlaggedContent = async (): Promise<FlaggedContentResponse> => {
  try {
    // Get all flagged questions that haven't been reviewed
    // Check for null or undefined reviewedBy
    const flaggedQuestions = await QuestionModel.find({
      'flagged.isFlagged': true,
      '$or': [
        { 'flagged.reviewedBy': { $exists: false } },
        { 'flagged.reviewedBy': null },
        { 'flagged.reviewedBy': '' },
      ],
    }).lean();

    // Get all flagged answers that haven't been reviewed
    const flaggedAnswers = await AnswerModel.find({
      'flagged.isFlagged': true,
      '$or': [
        { 'flagged.reviewedBy': { $exists: false } },
        { 'flagged.reviewedBy': null },
        { 'flagged.reviewedBy': '' },
      ],
    }).lean();

    // Get all flagged comments that haven't been reviewed
    const flaggedComments = await CommentModel.find({
      'flagged.isFlagged': true,
      '$or': [
        { 'flagged.reviewedBy': { $exists: false } },
        { 'flagged.reviewedBy': null },
        { 'flagged.reviewedBy': '' },
      ],
    }).lean();

    const questions: FlaggedContentItem[] = flaggedQuestions.map(q => ({
      _id: q._id.toString(),
      contentType: 'question' as const,
      content: q as DatabaseQuestion,
      flaggedBy: q.flagged?.flaggedBy || [],
      flaggedAt: q.flagged?.flaggedAt || [],
      reviewedBy: q.flagged?.reviewedBy,
      reviewedAt: q.flagged?.reviewedAt,
    }));

    const answers: FlaggedContentItem[] = flaggedAnswers.map(a => ({
      _id: a._id.toString(),
      contentType: 'answer' as const,
      content: a as DatabaseAnswer,
      flaggedBy: a.flagged?.flaggedBy || [],
      flaggedAt: a.flagged?.flaggedAt || [],
      reviewedBy: a.flagged?.reviewedBy,
      reviewedAt: a.flagged?.reviewedAt,
    }));

    const comments: FlaggedContentItem[] = flaggedComments.map(c => ({
      _id: c._id.toString(),
      contentType: 'comment' as const,
      content: c as DatabaseComment,
      flaggedBy: c.flagged?.flaggedBy || [],
      flaggedAt: c.flagged?.flaggedAt || [],
      reviewedBy: c.flagged?.reviewedBy,
      reviewedAt: c.flagged?.reviewedAt,
    }));

    return { questions, answers, comments };
  } catch (error) {
    return {
      questions: [],
      answers: [],
      comments: [],
      error: `Error fetching flagged content: ${(error as Error).message}`,
    };
  }
};

/**
 * Marks flagged content as reviewed by a moderator
 * @param contentType - Type of content being reviewed
 * @param contentId - ID of the content
 * @param moderatorUsername - Username of the moderator reviewing
 * @returns Promise resolving to ModerationResponse
 */
export const markAsReviewed = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  moderatorUsername: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can review content',
      };
    }

    let updatedContent: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null = null;

    if (contentType === 'question') {
      updatedContent = await QuestionModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'answer') {
      updatedContent = await AnswerModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'comment') {
      updatedContent = await CommentModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    }

    if (!updatedContent) {
      return { success: false, error: 'Content not found' };
    }

    return { success: true, message: 'Content marked as reviewed' };
  } catch (error) {
    return {
      success: false,
      error: `Error marking content as reviewed: ${(error as Error).message}`,
    };
  }
};

/**
 * Dismisses a flag (unflags content) - Moderator only
 * @param contentType - Type of content
 * @param contentId - ID of the content
 * @param moderatorUsername - Username of the moderator
 * @returns Promise resolving to ModerationResponse
 */
export const dismissFlag = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  moderatorUsername: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can dismiss flags',
      };
    }

    let updatedContent: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null = null;

    if (contentType === 'question') {
      updatedContent = await QuestionModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.isFlagged': false,
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'answer') {
      updatedContent = await AnswerModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.isFlagged': false,
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'comment') {
      updatedContent = await CommentModel.findByIdAndUpdate(
        contentId,
        {
          'flagged.isFlagged': false,
          'flagged.reviewedBy': moderatorUsername,
          'flagged.reviewedAt': new Date(),
        },
        { new: true },
      );
    }

    if (!updatedContent) {
      return { success: false, error: 'Content not found' };
    }

    return { success: true, message: 'Flag dismissed successfully' };
  } catch (error) {
    return { success: false, error: `Error dismissing flag: ${(error as Error).message}` };
  }
};
