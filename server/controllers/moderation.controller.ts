import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/types';
import {
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  flagQuestion,
  flagAnswer,
  flagComment,
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
      res.status(400).json({ error: 'Missing required fields: questionId, moderatorUsername, or deleteReason' });
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
      res.status(400).json({ error: 'Missing required fields: answerId, moderatorUsername, or deleteReason' });
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
      res.status(400).json({ error: 'Missing required fields: commentId, moderatorUsername, or deleteReason' });
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

      res.json({ success: true, message: result.message });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error flagging comment: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.delete('/delete/question/:questionId', deleteQuestionRoute);
  router.delete('/delete/answer/:answerId', deleteAnswerRoute);
  router.delete('/delete/comment/:commentId', deleteCommentRoute);
  router.post('/flag/question/:questionId', flagQuestionRoute);
  router.post('/flag/answer/:answerId', flagAnswerRoute);
  router.post('/flag/comment/:commentId', flagCommentRoute);

  return router;
};

export default moderationController;

