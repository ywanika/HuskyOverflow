import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/types';
import { getDashboardMetrics, isAdmin } from '../services/admin.service';

/**
 * Admin controller for handling admin dashboard and metrics
 * @param socket - Socket instance for real-time updates
 * @returns Express router with admin routes
 */
const adminController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Gets dashboard metrics - Admin only
   * @param req - Request object (should contain admin username in query or body)
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getDashboardMetricsRoute = async (req: Request, res: Response): Promise<void> => {
    const username = (req.query.username as string) || (req.body.username as string);

    if (!username) {
      res.status(400).json({ error: 'Missing required field: username' });
      return;
    }

    try {
      // Check if user is admin
      const hasPermission = await isAdmin(username);
      if (!hasPermission) {
        res.status(403).json({ error: 'Unauthorized: Only admins can access dashboard metrics' });
        return;
      }

      const metrics = await getDashboardMetrics();
      res.json(metrics);
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: `Error fetching dashboard metrics: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.get('/metrics', getDashboardMetricsRoute);

  return router;
};

export default adminController;
