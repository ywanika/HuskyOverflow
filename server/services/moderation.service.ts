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

