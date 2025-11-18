import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/types';
import {
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notification.service';

/**
 * Request interface for notification operations
 */
interface NotificationRequest extends Request {
  params: {
    username?: string;
    notificationId?: string;
  };
  query: {
    username?: string;
  };
}

/**
 * Notification controller for handling user notifications
 * @param socket - Socket instance for real-time updates
 * @returns Express router with notification routes
 */
const notificationController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Gets all notifications for a user
   * @param req - Request containing username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getNotificationsRoute = async (req: NotificationRequest, res: Response): Promise<void> => {
    const username = req.params.username || req.query.username;

    if (!username) {
      res.status(400).json({ error: 'Missing required field: username' });
      return;
    }

    try {
      const result = await getNotificationsByUser(username);

      if (result.error) {
        res.status(500).json({ error: result.error });
        return;
      }

      res.json(result.notifications || []);
    } catch (err: unknown) {
      res.status(500).json({ error: `Error fetching notifications: ${(err as Error).message}` });
    }
  };

  /**
   * Gets unread notification count for a user
   * @param req - Request containing username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getUnreadCountRoute = async (req: NotificationRequest, res: Response): Promise<void> => {
    const username = req.params.username || req.query.username;

    if (!username) {
      res.status(400).json({ error: 'Missing required field: username' });
      return;
    }

    try {
      const count = await getUnreadNotificationCount(username);
      res.json({ count });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error fetching unread count: ${(err as Error).message}` });
    }
  };

  /**
   * Marks a notification as read
   * @param req - Request containing notificationId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const markAsReadRoute = async (req: NotificationRequest, res: Response): Promise<void> => {
    const { notificationId } = req.params;
    const username = req.body.username || req.query.username;

    if (!notificationId || !username) {
      res.status(400).json({ error: 'Missing required fields: notificationId or username' });
      return;
    }

    try {
      const result = await markNotificationAsRead(notificationId, username);

      if (result.error) {
        if (result.error.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      socket.emit('notificationUpdate', {
        type: 'notificationRead',
        username,
        notificationId,
      });

      res.json({ success: true, notification: result.notification });
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: `Error marking notification as read: ${(err as Error).message}` });
    }
  };

  /**
   * Marks all notifications as read for a user
   * @param req - Request containing username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const markAllAsReadRoute = async (req: NotificationRequest, res: Response): Promise<void> => {
    const username = req.body.username || req.query.username;

    if (!username) {
      res.status(400).json({ error: 'Missing required field: username' });
      return;
    }

    try {
      const result = await markAllNotificationsAsRead(username);

      if (result.error) {
        res.status(500).json({ error: result.error });
        return;
      }

      socket.emit('notificationUpdate', {
        type: 'allNotificationsRead',
        username,
      });

      res.json({ success: true });
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: `Error marking all notifications as read: ${(err as Error).message}` });
    }
  };

  /**
   * Deletes a notification
   * @param req - Request containing notificationId and username
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const deleteNotificationRoute = async (
    req: NotificationRequest,
    res: Response,
  ): Promise<void> => {
    const { notificationId } = req.params;
    const username = req.body.username || req.query.username;

    if (!notificationId || !username) {
      res.status(400).json({ error: 'Missing required fields: notificationId or username' });
      return;
    }

    try {
      const result = await deleteNotification(notificationId, username);

      if (result.error) {
        if (result.error.includes('not found')) {
          res.status(404).json({ error: result.error });
        } else {
          res.status(500).json({ error: result.error });
        }
        return;
      }

      socket.emit('notificationUpdate', {
        type: 'notificationDeleted',
        username,
        notificationId,
      });

      res.json({ success: true });
    } catch (err: unknown) {
      res.status(500).json({ error: `Error deleting notification: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.get('/:username', getNotificationsRoute);
  router.get('/unread/:username', getUnreadCountRoute);
  router.patch('/read/:notificationId', markAsReadRoute);
  router.patch('/read-all', markAllAsReadRoute);
  router.delete('/:notificationId', deleteNotificationRoute);

  return router;
};

export default notificationController;
