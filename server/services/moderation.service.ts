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
    // Log error but don't fail the deletion if notification fails
    console.error('Error creating deletion notification:', error);
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
      return { success: false, error: 'Unauthorized: Only moderators and admins can delete content' };
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
      return { success: false, error: 'Unauthorized: Only moderators and admins can delete content' };
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
      return { success: false, error: 'Unauthorized: Only moderators and admins can delete content' };
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
    // Log error but don't fail the flag if notification fails
    console.error('Error creating flag notification:', error);
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
        $addToSet: { 'flagged.flaggedBy': username },
        $push: { 'flagged.flaggedAt': new Date() },
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
export const flagAnswer = async (answerId: string, username: string): Promise<ModerationResponse> => {
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
        $addToSet: { 'flagged.flaggedBy': username },
        $push: { 'flagged.flaggedAt': new Date() },
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
        $addToSet: { 'flagged.flaggedBy': username },
        $push: { 'flagged.flaggedAt': new Date() },
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

