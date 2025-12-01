import express, { Request, Response } from 'express';
import { FakeSOSocket } from '../types/types';
import { contactModerator } from '../services/chatbot.service';

/**
 * Request interface for chatbot operations
 */
interface ContactModeratorRequest extends Request {
  body: {
    username: string;
    message: string;
  };
}

/**
 * Chatbot controller for handling chatbot-related operations
 * @param socket - Socket instance for real-time updates
 * @returns Express router with chatbot routes
 */
const chatbotController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Handles contact moderator requests
   * @param req - Request containing username and message
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const contactModeratorRoute = async (
    req: ContactModeratorRequest,
    res: Response,
  ): Promise<void> => {
    const { username, message } = req.body;

    if (!username || !message) {
      res.status(400).json({ error: 'Missing required fields: username and message' });
      return;
    }

    try {
      const result = await contactModerator(username, message);

      if (result.error) {
        res.status(500).json({ error: result.error });
        return;
      }

      // Broadcast notification update to all moderators via socket
      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: 'moderator', // Signal to all moderators
      });

      res.json({ success: true, count: result.count });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error contacting moderator: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.post('/contact-moderator', contactModeratorRoute);

  return router;
};

export default chatbotController;
