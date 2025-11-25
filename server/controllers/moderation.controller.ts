import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/types';
import {
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  flagQuestion,
  flagAnswer,
  flagComment,
  unflagQuestion,
  unflagAnswer,
  unflagComment,
  getFlaggedContent,
  markAsReviewed,
  dismissFlag,
  submitAppeal,
  getAppeals,
  approveAppeal,
  rejectAppeal,
  checkExistingAppeal,
} from '../services/moderation.service';

/**
 * Request interface for moderation delete operations
 */
interface DeleteContentRequest extends Request {
  body: {
    moderatorUsername: string;
    deleteReason: string;
  };
  params: {
    questionId?: string;
    answerId?: string;
    commentId?: string;
  };
}

/**
 * Request interface for flagging operations
 */
interface FlagContentRequest extends Request {
  body: {
    username: string;
  };
  params: {
    questionId?: string;
    answerId?: string;
    commentId?: string;
  };
}

/**
 * Moderation controller for handling content deletion by moderators
 * @param socket - Socket instance for real-time updates
 * @returns Express router with moderation routes
 */
const moderationController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Deletes a question (marks as deleted) - Moderator only
   * @param req - Request containing questionId, moderatorUsername, and deleteReason
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const deleteQuestionRoute = async (req: DeleteContentRequest, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { moderatorUsername, deleteReason } = req.body;

    if (!questionId || !moderatorUsername || !deleteReason) {
      res
        .status(400)
        .json({ error: 'Missing required fields: questionId, moderatorUsername, or deleteReason' });
      return;
    }

    try {
      const result = await deleteQuestion(questionId, moderatorUsername, deleteReason);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'questionDeleted',
        questionId,
        deletedBy: moderatorUsername,
      });

      // Emit notification update for the recipient
      if (result.recipientUsername) {
        socket.emit('notificationUpdate', {
          type: 'newNotification',
          username: result.recipientUsername,
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error deleting question: ${(err as Error).message}` });
    }
  };

  /**
   * Deletes an answer (marks as deleted) - Moderator only
   * @param req - Request containing answerId, moderatorUsername, and deleteReason
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const deleteAnswerRoute = async (req: DeleteContentRequest, res: Response): Promise<void> => {
    const { answerId } = req.params;
    const { moderatorUsername, deleteReason } = req.body;

    if (!answerId || !moderatorUsername || !deleteReason) {
      res
        .status(400)
        .json({ error: 'Missing required fields: answerId, moderatorUsername, or deleteReason' });
      return;
    }

    try {
      const result = await deleteAnswer(answerId, moderatorUsername, deleteReason);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'answerDeleted',
        answerId,
        deletedBy: moderatorUsername,
      });

      // Emit notification update for the recipient
      if (result.recipientUsername) {
        socket.emit('notificationUpdate', {
          type: 'newNotification',
          username: result.recipientUsername,
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error deleting answer: ${(err as Error).message}` });
    }
  };

  /**
   * Deletes a comment (marks as deleted) - Moderator only
   * @param req - Request containing commentId, moderatorUsername, and deleteReason
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const deleteCommentRoute = async (req: DeleteContentRequest, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { moderatorUsername, deleteReason } = req.body;

    if (!commentId || !moderatorUsername || !deleteReason) {
      res
        .status(400)
        .json({ error: 'Missing required fields: commentId, moderatorUsername, or deleteReason' });
      return;
    }

    try {
      const result = await deleteComment(commentId, moderatorUsername, deleteReason);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'commentDeleted',
        commentId,
        deletedBy: moderatorUsername,
      });

      // Emit notification update for the recipient
      if (result.recipientUsername) {
        socket.emit('notificationUpdate', {
          type: 'newNotification',
          username: result.recipientUsername,
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error deleting comment: ${(err as Error).message}` });
    }
  };

  /**
   * Flags a question - Any user can flag
   * @param req - Request containing questionId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const flagQuestionRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { username } = req.body;

    if (!questionId || !username) {
      res.status(400).json({ error: 'Missing required fields: questionId or username' });
      return;
    }

    try {
      const result = await flagQuestion(questionId, username);

      if (!result.success) {
        if (result.error?.includes('already flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'questionFlagged',
        questionId,
        flaggedBy: username,
      });

      // Emit notification updates for all moderator recipients
      if (result.recipientUsernames && result.recipientUsernames.length > 0) {
        result.recipientUsernames.forEach(recipientUsername => {
          socket.emit('notificationUpdate', {
            type: 'newNotification',
            username: recipientUsername,
          });
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error flagging question: ${(err as Error).message}` });
    }
  };

  /**
   * Flags an answer - Any user can flag
   * @param req - Request containing answerId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const flagAnswerRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { answerId } = req.params;
    const { username } = req.body;

    if (!answerId || !username) {
      res.status(400).json({ error: 'Missing required fields: answerId or username' });
      return;
    }

    try {
      const result = await flagAnswer(answerId, username);

      if (!result.success) {
        if (result.error?.includes('already flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'answerFlagged',
        answerId,
        flaggedBy: username,
      });

      // Emit notification updates for all moderator recipients
      if (result.recipientUsernames && result.recipientUsernames.length > 0) {
        result.recipientUsernames.forEach(recipientUsername => {
          socket.emit('notificationUpdate', {
            type: 'newNotification',
            username: recipientUsername,
          });
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error flagging answer: ${(err as Error).message}` });
    }
  };

  /**
   * Flags a comment - Any user can flag
   * @param req - Request containing commentId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const flagCommentRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { username } = req.body;

    if (!commentId || !username) {
      res.status(400).json({ error: 'Missing required fields: commentId or username' });
      return;
    }

    try {
      const result = await flagComment(commentId, username);

      if (!result.success) {
        if (result.error?.includes('already flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'commentFlagged',
        commentId,
        flaggedBy: username,
      });

      // Emit notification updates for all moderator recipients
      if (result.recipientUsernames && result.recipientUsernames.length > 0) {
        result.recipientUsernames.forEach(recipientUsername => {
          socket.emit('notificationUpdate', {
            type: 'newNotification',
            username: recipientUsername,
          });
        });
      }

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error flagging comment: ${(err as Error).message}` });
    }
  };

  /**
   * Gets all flagged content - Moderator only
   * @param req - Request object
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getFlaggedContentRoute = async (_: Request, res: Response): Promise<void> => {
    try {
      const result = await getFlaggedContent();

      if (result.error) {
        res.status(500).json({ error: result.error });
        return;
      }

      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: `Error fetching flagged content: ${(err as Error).message}` });
    }
  };

  /**
   * Marks flagged content as reviewed - Moderator only
   * @param req - Request containing contentType, contentId, and moderatorUsername
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const markAsReviewedRoute = async (req: Request, res: Response): Promise<void> => {
    const { contentType, contentId, moderatorUsername } = req.body;

    if (!contentType || !contentId || !moderatorUsername) {
      res
        .status(400)
        .json({ error: 'Missing required fields: contentType, contentId, or moderatorUsername' });
      return;
    }

    try {
      const result = await markAsReviewed(contentType, contentId, moderatorUsername);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      const reviewType =
        contentType === 'question'
          ? 'questionReviewed'
          : contentType === 'answer'
            ? 'answerReviewed'
            : 'commentReviewed';
      const idField =
        contentType === 'question'
          ? 'questionId'
          : contentType === 'answer'
            ? 'answerId'
            : 'commentId';

      socket.emit('moderationUpdate', {
        type: reviewType,
        [idField]: contentId,
        reviewedBy: moderatorUsername,
      });

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: `Error marking content as reviewed: ${(err as Error).message}` });
    }
  };

  /**
   * Unflags a question - Any user can unflag their own flag
   * @param req - Request containing questionId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const unflagQuestionRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { username } = req.body;

    if (!questionId || !username) {
      res.status(400).json({ error: 'Missing required fields: questionId or username' });
      return;
    }

    try {
      const result = await unflagQuestion(questionId, username);

      if (!result.success) {
        if (result.error?.includes('not flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'questionUnflagged',
        questionId,
        unflaggedBy: username,
      });

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error unflagging question: ${(err as Error).message}` });
    }
  };

  /**
   * Unflags an answer - Any user can unflag their own flag
   * @param req - Request containing answerId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const unflagAnswerRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { answerId } = req.params;
    const { username } = req.body;

    if (!answerId || !username) {
      res.status(400).json({ error: 'Missing required fields: answerId or username' });
      return;
    }

    try {
      const result = await unflagAnswer(answerId, username);

      if (!result.success) {
        if (result.error?.includes('not flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'answerUnflagged',
        answerId,
        unflaggedBy: username,
      });

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error unflagging answer: ${(err as Error).message}` });
    }
  };

  /**
   * Unflags a comment - Any user can unflag their own flag
   * @param req - Request containing commentId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const unflagCommentRoute = async (req: FlagContentRequest, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { username } = req.body;

    if (!commentId || !username) {
      res.status(400).json({ error: 'Missing required fields: commentId or username' });
      return;
    }

    try {
      const result = await unflagComment(commentId, username);

      if (!result.success) {
        if (result.error?.includes('not flagged')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'commentUnflagged',
        commentId,
        unflaggedBy: username,
      });

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error unflagging comment: ${(err as Error).message}` });
    }
  };

  /**
   * Dismisses a flag - Moderator only
   * @param req - Request containing contentType, contentId, and moderatorUsername
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const dismissFlagRoute = async (req: Request, res: Response): Promise<void> => {
    const { contentType, contentId, moderatorUsername } = req.body;

    if (!contentType || !contentId || !moderatorUsername) {
      res
        .status(400)
        .json({ error: 'Missing required fields: contentType, contentId, or moderatorUsername' });
      return;
    }

    try {
      const result = await dismissFlag(contentType, contentId, moderatorUsername);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      const dismissType =
        contentType === 'question'
          ? 'questionFlagDismissed'
          : contentType === 'answer'
            ? 'answerFlagDismissed'
            : 'commentFlagDismissed';
      const idField =
        contentType === 'question'
          ? 'questionId'
          : contentType === 'answer'
            ? 'answerId'
            : 'commentId';

      socket.emit('moderationUpdate', {
        type: dismissType,
        [idField]: contentId,
        dismissedBy: moderatorUsername,
      });

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error dismissing flag: ${(err as Error).message}` });
    }
  };

  /**
   * Submits an appeal for deleted content
   * @param req - Request containing contentId, contentType, appealUser, and reason
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const submitAppealRoute = async (req: Request, res: Response): Promise<void> => {
    const { contentId, contentType, appealUser, reason } = req.body;

    if (!contentId || !contentType || !appealUser || !reason) {
      res.status(400).json({
        error: 'Missing required fields: contentId, contentType, appealUser, or reason',
      });
      return;
    }

    try {
      const result = await submitAppeal(contentId, contentType, appealUser, reason);

      if (!result.success) {
        if (result.error?.includes('already submitted')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else if (result.error?.includes('between 50 and 500')) {
          res.status(400).json({ error: result.error });
        } else if (result.error?.includes('at least 3 words')) {
          res.status(400).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'appealSubmitted',
        contentId,
        contentType,
        appealUser,
      });

      // Emit notification updates for all moderator recipients
      if (result.recipientUsernames && result.recipientUsernames.length > 0) {
        result.recipientUsernames.forEach(recipientUsername => {
          socket.emit('notificationUpdate', {
            type: 'newNotification',
            username: recipientUsername,
          });
        });
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error submitting appeal: ${(err as Error).message}` });
    }
  };

  /**
   * Checks if an appeal already exists for content
   * @param req - Request containing contentId and appealUser
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const checkExistingAppealRoute = async (req: Request, res: Response): Promise<void> => {
    const { contentId, appealUser } = req.query;

    if (!contentId || !appealUser) {
      res.status(400).json({ error: 'Missing required fields: contentId or appealUser' });
      return;
    }

    try {
      const exists = await checkExistingAppeal(contentId as string, appealUser as string);
      res.status(200).json({ exists });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error checking appeal: ${(err as Error).message}` });
    }
  };

  /**
   * Gets all appeals - Moderator only
   * @param req - Request object
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getAppealsRoute = async (_: Request, res: Response): Promise<void> => {
    try {
      const result = await getAppeals();

      if (result.error) {
        res.status(500).json({ error: result.error });
        return;
      }

      res.status(200).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: `Error fetching appeals: ${(err as Error).message}` });
    }
  };

  /**
   * Approves an appeal - Moderator only
   * @param req - Request containing appealId, moderatorUsername, and optional modResponse
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const approveAppealRoute = async (req: Request, res: Response): Promise<void> => {
    const { appealId, moderatorUsername, modResponse } = req.body;

    if (!appealId || !moderatorUsername) {
      res.status(400).json({ error: 'Missing required fields: appealId or moderatorUsername' });
      return;
    }

    try {
      const result = await approveAppeal(appealId, moderatorUsername, modResponse);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'appealApproved',
        appealId,
        processedBy: moderatorUsername,
      });

      // Emit notification update for the recipient
      if (result.recipientUsername) {
        socket.emit('notificationUpdate', {
          type: 'newNotification',
          username: result.recipientUsername,
        });
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error approving appeal: ${(err as Error).message}` });
    }
  };

  /**
   * Rejects an appeal - Moderator only
   * @param req - Request containing appealId, moderatorUsername, and optional modResponse
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const rejectAppealRoute = async (req: Request, res: Response): Promise<void> => {
    const { appealId, moderatorUsername, modResponse } = req.body;

    if (!appealId || !moderatorUsername) {
      res.status(400).json({ error: 'Missing required fields: appealId or moderatorUsername' });
      return;
    }

    try {
      const result = await rejectAppeal(appealId, moderatorUsername, modResponse);

      if (!result.success) {
        if (result.error?.includes('Unauthorized')) {
          res.status(403).json({ error: result.error });
        } else if (result.error?.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      // Emit socket event for real-time updates
      socket.emit('moderationUpdate', {
        type: 'appealRejected',
        appealId,
        processedBy: moderatorUsername,
      });

      // Emit notification update for the recipient
      if (result.recipientUsername) {
        socket.emit('notificationUpdate', {
          type: 'newNotification',
          username: result.recipientUsername,
        });
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error rejecting appeal: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.delete('/delete/question/:questionId', deleteQuestionRoute);
  router.delete('/delete/answer/:answerId', deleteAnswerRoute);
  router.delete('/delete/comment/:commentId', deleteCommentRoute);
  router.post('/flag/question/:questionId', flagQuestionRoute);
  router.post('/flag/answer/:answerId', flagAnswerRoute);
  router.post('/flag/comment/:commentId', flagCommentRoute);
  router.post('/unflag/question/:questionId', unflagQuestionRoute);
  router.post('/unflag/answer/:answerId', unflagAnswerRoute);
  router.post('/unflag/comment/:commentId', unflagCommentRoute);
  router.get('/flagged', getFlaggedContentRoute);
  router.post('/review', markAsReviewedRoute);
  router.post('/dismiss', dismissFlagRoute);
  router.post('/appeal/submit', submitAppealRoute);
  router.get('/appeal/check', checkExistingAppealRoute);
  router.get('/appeals', getAppealsRoute);
  router.post('/appeal/approve', approveAppealRoute);
  router.post('/appeal/reject', rejectAppealRoute);

  return router;
};

export default moderationController;
