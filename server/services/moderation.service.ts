import { ObjectId } from 'mongodb';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import UserModel from '../models/users.model';
import NotificationModel from '../models/notifications.model';
import AppealModel from '../models/appeals.model';
import { DatabaseUser, DatabaseQuestion, DatabaseAnswer, DatabaseComment } from '../types/types';
import { DatabaseAppeal, AppealItem, AppealsResponse } from '@fake-stack-overflow/shared';

/**
 * Response type for moderation operations
 */
export interface ModerationResponse {
  success: boolean;
  message?: string;
  error?: string;
  recipientUsername?: string; // For deletion notifications
  recipientUsernames?: string[]; // For flag/appeal notifications (multiple recipients)
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
 * @param content - The content object (question, answer, or comment)
 */
const createDeletionNotification = async (
  recipientUsername: string,
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  reason: string,
  content: DatabaseQuestion | DatabaseAnswer | DatabaseComment,
): Promise<void> => {
  try {
    // Extract first 100 characters of the content
    let contentPreview = '';
    if (contentType === 'question') {
      contentPreview = (content as DatabaseQuestion).title.substring(0, 100);
    } else {
      contentPreview = (content as DatabaseAnswer | DatabaseComment).text.substring(0, 100);
    }

    await NotificationModel.create({
      recipientUsername,
      type: 'deletion',
      message: `Your ${contentType} "${contentPreview}" has been deleted by a moderator. Reason: ${reason}`,
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
    await createDeletionNotification(
      question.askedBy,
      'question',
      questionId,
      deleteReason,
      question,
    );

    return {
      success: true,
      message: 'Question deleted successfully',
      recipientUsername: question.askedBy,
    };
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
    await createDeletionNotification(answer.ansBy, 'answer', answerId, deleteReason, answer);

    return {
      success: true,
      message: 'Answer deleted successfully',
      recipientUsername: answer.ansBy,
    };
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
    await createDeletionNotification(
      comment.commentBy,
      'comment',
      commentId,
      deleteReason,
      comment,
    );

    return {
      success: true,
      message: 'Comment deleted successfully',
      recipientUsername: comment.commentBy,
    };
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
): Promise<string[]> => {
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
    return moderators.map(m => m.username);
  } catch (error) {
    // Error handled silently - don't fail the flag if notification fails
    return [];
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
    const recipientUsernames = await createFlagNotification('question', questionId, username);

    return {
      success: true,
      message: 'Question flagged successfully',
      recipientUsernames,
    };
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
    const recipientUsernames = await createFlagNotification('answer', answerId, username);

    return {
      success: true,
      message: 'Answer flagged successfully',
      recipientUsernames,
    };
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
    const recipientUsernames = await createFlagNotification('comment', commentId, username);

    return {
      success: true,
      message: 'Comment flagged successfully',
      recipientUsernames,
    };
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

/**
 * Checks if an appeal already exists for the given content
 * @param contentId - ID of the content
 * @param appealUser - Username of the user making the appeal
 * @returns Promise resolving to true if appeal exists, false otherwise
 */
export const checkExistingAppeal = async (
  contentId: string,
  appealUser: string,
): Promise<boolean> => {
  try {
    const existingAppeal = await AppealModel.findOne({
      contentId: new ObjectId(contentId),
      appealUser,
    });
    return !!existingAppeal;
  } catch (error) {
    return false;
  }
};

/**
 * Creates a notification for moderators when an appeal is submitted
 * @param contentType - Type of content being appealed
 * @param contentId - ID of the content being appealed
 * @param appealUser - Username of the user making the appeal
 */
const createAppealNotification = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  appealUser: string,
): Promise<string[]> => {
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
        message: `An appeal has been submitted for a deleted ${contentType} by ${appealUser}`,
        contentId: new ObjectId(contentId),
        isRead: false,
        timestamp: new Date(),
      }),
    );

    await Promise.all(notifications);
    return moderators.map(m => m.username);
  } catch (error) {
    // Error handled silently - don't fail the appeal if notification fails
    return [];
  }
};

/**
 * Creates a notification for the user when their appeal is processed
 * @param recipientUsername - Username of the user who submitted the appeal
 * @param contentType - Type of content that was appealed
 * @param contentId - ID of the content
 * @param status - Status of the appeal (approved or rejected)
 * @param modResponse - Response from the moderator
 */
const createAppealResultNotification = async (
  recipientUsername: string,
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  status: 'approved' | 'rejected',
  modResponse?: string,
): Promise<void> => {
  try {
    const message =
      status === 'approved'
        ? `Your appeal for your deleted ${contentType} has been approved. ${modResponse || ''}`
        : `Your appeal for your deleted ${contentType} has been rejected. ${modResponse || ''}`;

    await NotificationModel.create({
      recipientUsername,
      type: 'appeal_result',
      message,
      contentId: new ObjectId(contentId),
      isRead: false,
      timestamp: new Date(),
    });
  } catch (error) {
    // Error handled silently - don't fail the appeal processing if notification fails
  }
};

/**
 * Submits an appeal for deleted content
 * @param contentId - ID of the content being appealed
 * @param contentType - Type of content being appealed
 * @param appealUser - Username of the user making the appeal
 * @param reason - Reason for the appeal (must be 50-500 characters and at least 3 words)
 * @returns Promise resolving to ModerationResponse
 */
export const submitAppeal = async (
  contentId: string,
  contentType: 'question' | 'answer' | 'comment',
  appealUser: string,
  reason: string,
): Promise<ModerationResponse> => {
  try {
    // Validate reason length (50-500 characters)
    if (reason.length < 50 || reason.length > 500) {
      return {
        success: false,
        error: 'Appeal reason must be between 50 and 500 characters',
      };
    }

    // Validate minimum word count (at least 3 words)
    const wordCount = reason
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    if (wordCount < 3) {
      return {
        success: false,
        error: 'Appeal reason must contain at least 3 words',
      };
    }

    // Check if user has already appealed this content
    const hasExistingAppeal = await checkExistingAppeal(contentId, appealUser);
    if (hasExistingAppeal) {
      return {
        success: false,
        error: 'You have already submitted an appeal for this content',
      };
    }

    // Verify the content exists and is deleted
    let content: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null = null;
    if (contentType === 'question') {
      content = await QuestionModel.findById(contentId);
    } else if (contentType === 'answer') {
      content = await AnswerModel.findById(contentId);
    } else if (contentType === 'comment') {
      content = await CommentModel.findById(contentId);
    }

    if (!content) {
      return { success: false, error: 'Content not found' };
    }

    if (!content.deleted?.isDeleted) {
      return { success: false, error: 'Content is not deleted' };
    }

    // Verify the user is the author of the content
    let isAuthor = false;
    if (contentType === 'question') {
      isAuthor = (content as DatabaseQuestion).askedBy === appealUser;
    } else if (contentType === 'answer') {
      isAuthor = (content as DatabaseAnswer).ansBy === appealUser;
    } else if (contentType === 'comment') {
      isAuthor = (content as DatabaseComment).commentBy === appealUser;
    }

    if (!isAuthor) {
      return { success: false, error: 'You can only appeal your own content' };
    }

    // Create the appeal
    await AppealModel.create({
      contentId: new ObjectId(contentId),
      contentType,
      appealUser,
      reason,
      status: 'pending',
      timestamp: new Date(),
    });

    // Create notifications for moderators
    const recipientUsernames = await createAppealNotification(contentType, contentId, appealUser);

    return {
      success: true,
      message: 'Appeal submitted successfully',
      recipientUsernames,
    };
  } catch (error) {
    return { success: false, error: `Error submitting appeal: ${(error as Error).message}` };
  }
};

/**
 * Gets all appeals for deleted content - Moderator only
 * @returns Promise resolving to AppealsResponse
 */
export const getAppeals = async (): Promise<AppealsResponse> => {
  try {
    const appeals = await AppealModel.find({ status: 'pending' }).lean();

    const appealItems: AppealItem[] = await Promise.all(
      appeals
        .filter(appeal => appeal.contentType !== 'message') // Filter out message type as it's not supported
        .map(async appeal => {
          let content: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null = null;

          if (appeal.contentType === 'question') {
            content = await QuestionModel.findById(appeal.contentId).lean();
          } else if (appeal.contentType === 'answer') {
            content = await AnswerModel.findById(appeal.contentId).lean();
          } else if (appeal.contentType === 'comment') {
            content = await CommentModel.findById(appeal.contentId).lean();
          }

          return {
            _id: appeal._id.toString(),
            contentId: appeal.contentId.toString(),
            contentType: appeal.contentType as 'question' | 'answer' | 'comment',
            appealUser: appeal.appealUser,
            reason: appeal.reason,
            status: appeal.status,
            modResponse: appeal.modResponse,
            processedBy: appeal.processedBy,
            timestamp: appeal.timestamp,
            processedAt: appeal.processedAt,
            content: (content as unknown as Record<string, unknown>) || {},
          };
        }),
    );

    return { appeals: appealItems };
  } catch (error) {
    return {
      appeals: [],
      error: `Error fetching appeals: ${(error as Error).message}`,
    };
  }
};

/**
 * Approves an appeal - Moderator only
 * @param appealId - ID of the appeal
 * @param moderatorUsername - Username of the moderator
 * @param modResponse - Optional response from the moderator
 * @returns Promise resolving to ModerationResponse
 */
export const approveAppeal = async (
  appealId: string,
  moderatorUsername: string,
  modResponse?: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can approve appeals',
      };
    }

    // Find the appeal
    const appeal: DatabaseAppeal | null = await AppealModel.findById(appealId);
    if (!appeal) {
      return { success: false, error: 'Appeal not found' };
    }

    if (appeal.status !== 'pending') {
      return { success: false, error: 'Appeal has already been processed' };
    }

    // Update the appeal
    await AppealModel.findByIdAndUpdate(appealId, {
      status: 'approved',
      modResponse: modResponse || '',
      processedBy: moderatorUsername,
      processedAt: new Date(),
    });

    // Restore the content (set isDeleted to false)
    if (appeal.contentType === 'question') {
      await QuestionModel.findByIdAndUpdate(appeal.contentId, {
        'deleted.isDeleted': false,
        'deleted.restoredAt': new Date(),
      });
    } else if (appeal.contentType === 'answer') {
      await AnswerModel.findByIdAndUpdate(appeal.contentId, {
        'deleted.isDeleted': false,
        'deleted.restoredAt': new Date(),
      });
    } else if (appeal.contentType === 'comment') {
      await CommentModel.findByIdAndUpdate(appeal.contentId, {
        'deleted.isDeleted': false,
        'deleted.restoredAt': new Date(),
      });
    }

    // Create notification for the user
    if (appeal.contentType !== 'message') {
      await createAppealResultNotification(
        appeal.appealUser,
        appeal.contentType,
        appeal.contentId.toString(),
        'approved',
        modResponse,
      );
    }

    return {
      success: true,
      message: 'Appeal approved successfully',
      recipientUsername: appeal.appealUser,
    };
  } catch (error) {
    return { success: false, error: `Error approving appeal: ${(error as Error).message}` };
  }
};

/**
 * Rejects an appeal - Moderator only
 * @param appealId - ID of the appeal
 * @param moderatorUsername - Username of the moderator
 * @param modResponse - Optional response from the moderator
 * @returns Promise resolving to ModerationResponse
 */
export const rejectAppeal = async (
  appealId: string,
  moderatorUsername: string,
  modResponse?: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can reject appeals',
      };
    }

    // Find the appeal
    const appeal: DatabaseAppeal | null = await AppealModel.findById(appealId);
    if (!appeal) {
      return { success: false, error: 'Appeal not found' };
    }

    if (appeal.status !== 'pending') {
      return { success: false, error: 'Appeal has already been processed' };
    }

    // Update the appeal
    await AppealModel.findByIdAndUpdate(appealId, {
      status: 'rejected',
      modResponse: modResponse || '',
      processedBy: moderatorUsername,
      processedAt: new Date(),
    });

    // Create notification for the user
    if (appeal.contentType !== 'message') {
      await createAppealResultNotification(
        appeal.appealUser,
        appeal.contentType,
        appeal.contentId.toString(),
        'rejected',
        modResponse,
      );
    }

    return {
      success: true,
      message: 'Appeal rejected successfully',
      recipientUsername: appeal.appealUser,
    };
  } catch (error) {
    return { success: false, error: `Error rejecting appeal: ${(error as Error).message}` };
  }
};

/**
 * Interface for deleted content items
 */
export interface DeletedContentItem {
  _id: string;
  contentType: 'question' | 'answer' | 'comment' | 'message';
  content: DatabaseQuestion | DatabaseAnswer | DatabaseComment | Record<string, unknown>;
  deletedBy: string;
  deleteReason: string;
  deletedAt: Date;
  authorUsername: string;
  contentPreview: string;
}

/**
 * Response type for getting deleted content
 */
export interface DeletedContentResponse {
  items: DeletedContentItem[];
  error?: string;
}

/**
 * Gets all content deleted by a specific moderator
 * @param moderatorUsername - The username of the moderator
 * @returns Promise resolving to DeletedContentResponse
 */
export const getDeletedContentByModerator = async (
  moderatorUsername: string,
): Promise<DeletedContentResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        items: [],
        error: 'Unauthorized: Only moderators and admins can view deleted content',
      };
    }

    const items: DeletedContentItem[] = [];

    // Get all deleted questions by this moderator
    const deletedQuestions = await QuestionModel.find({
      'deleted.isDeleted': true,
      'deleted.deletedBy': moderatorUsername,
    }).lean();

    deletedQuestions.forEach(q => {
      items.push({
        _id: q._id.toString(),
        contentType: 'question',
        content: q as DatabaseQuestion,
        deletedBy: q.deleted?.deletedBy || '',
        deleteReason: q.deleted?.deleteReason || '',
        deletedAt: q.deleted?.deletedAt || new Date(),
        authorUsername: q.askedBy,
        contentPreview: q.title.substring(0, 100),
      });
    });

    // Get all deleted answers by this moderator
    const deletedAnswers = await AnswerModel.find({
      'deleted.isDeleted': true,
      'deleted.deletedBy': moderatorUsername,
    }).lean();

    deletedAnswers.forEach(a => {
      items.push({
        _id: a._id.toString(),
        contentType: 'answer',
        content: a as DatabaseAnswer,
        deletedBy: a.deleted?.deletedBy || '',
        deleteReason: a.deleted?.deleteReason || '',
        deletedAt: a.deleted?.deletedAt || new Date(),
        authorUsername: a.ansBy,
        contentPreview: a.text.substring(0, 100),
      });
    });

    // Get all deleted comments by this moderator
    const deletedComments = await CommentModel.find({
      'deleted.isDeleted': true,
      'deleted.deletedBy': moderatorUsername,
    }).lean();

    deletedComments.forEach(c => {
      items.push({
        _id: c._id.toString(),
        contentType: 'comment',
        content: c as DatabaseComment,
        deletedBy: c.deleted?.deletedBy || '',
        deleteReason: c.deleted?.deleteReason || '',
        deletedAt: c.deleted?.deletedAt || new Date(),
        authorUsername: c.commentBy,
        contentPreview: c.text.substring(0, 100),
      });
    });

    // Sort by deletion date (most recent first)
    items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

    return { items };
  } catch (error) {
    return {
      items: [],
      error: `Error fetching deleted content: ${(error as Error).message}`,
    };
  }
};

/**
 * Restores deleted content (sets isDeleted to false)
 * @param contentType - Type of content to restore
 * @param contentId - ID of the content
 * @param moderatorUsername - Username of the moderator performing the restoration
 * @returns Promise resolving to ModerationResponse
 */
export const restoreDeletedContent = async (
  contentType: 'question' | 'answer' | 'comment' | 'message',
  contentId: string,
  moderatorUsername: string,
): Promise<ModerationResponse> => {
  try {
    // Check if user is moderator/admin
    const hasPermission = await isModerator(moderatorUsername);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Unauthorized: Only moderators and admins can restore content',
      };
    }

    let updatedContent: DatabaseQuestion | DatabaseAnswer | DatabaseComment | null = null;
    let authorUsername = '';

    if (contentType === 'question') {
      const question = await QuestionModel.findById(contentId);
      if (!question) {
        return { success: false, error: 'Question not found' };
      }
      authorUsername = question.askedBy;

      updatedContent = await QuestionModel.findByIdAndUpdate(
        contentId,
        {
          'deleted.isDeleted': false,
          'deleted.restoredAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'answer') {
      const answer = await AnswerModel.findById(contentId);
      if (!answer) {
        return { success: false, error: 'Answer not found' };
      }
      authorUsername = answer.ansBy;

      updatedContent = await AnswerModel.findByIdAndUpdate(
        contentId,
        {
          'deleted.isDeleted': false,
          'deleted.restoredAt': new Date(),
        },
        { new: true },
      );
    } else if (contentType === 'comment') {
      const comment = await CommentModel.findById(contentId);
      if (!comment) {
        return { success: false, error: 'Comment not found' };
      }
      authorUsername = comment.commentBy;

      updatedContent = await CommentModel.findByIdAndUpdate(
        contentId,
        {
          'deleted.isDeleted': false,
          'deleted.restoredAt': new Date(),
        },
        { new: true },
      );
    }

    if (!updatedContent) {
      return { success: false, error: 'Content not found' };
    }

    // Create notification for the content author
    await NotificationModel.create({
      recipientUsername: authorUsername,
      type: 'system_announcement',
      message: `Your ${contentType} has been restored by a moderator.`,
      contentId: new ObjectId(contentId),
      isRead: false,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Content restored successfully',
      recipientUsername: authorUsername,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error restoring content: ${(error as Error).message}`,
    };
  }
};
