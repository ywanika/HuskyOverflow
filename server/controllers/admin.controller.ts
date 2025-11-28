import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/types';
import { getDashboardMetrics, isAdmin, createUserWithRole } from '../services/admin.service';
import { createAuditLog, getAuditLogs } from '../services/auditLog.service';

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
    const username = req.query.username as string;

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

      // Log admin action
      await createAuditLog({
        adminUsername: username,
        actionType: 'view_dashboard_metrics',
      });

      res.json(metrics);
    } catch (err: unknown) {
      res
        .status(500)
        .json({ error: `Error fetching dashboard metrics: ${(err as Error).message}` });
    }
  };

  /**
   * Creates a new user account with a specific role - Admin only
   * @param req - Request object containing admin username and user creation details
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const createUserRoute = async (req: Request, res: Response): Promise<void> => {
    const adminUsername = req.query.username as string;
    const { username, password, role } = req.body;

    if (!adminUsername) {
      res.status(400).json({ error: 'Missing required field: username (admin)' });
      return;
    }

    if (!username || !password || !role) {
      res.status(400).json({ error: 'Missing required fields: username, password, or role' });
      return;
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be user, moderator, or admin' });
      return;
    }

    try {
      // Check if user is admin
      const hasPermission = await isAdmin(adminUsername);
      if (!hasPermission) {
        res.status(403).json({ error: 'Unauthorized: Only admins can create users' });
        return;
      }

      const result = await createUserWithRole(username, password, role);

      if ('error' in result) {
        res.status(400).json({ error: result.error });
        return;
      }

      // Log admin action
      await createAuditLog({
        adminUsername,
        actionType: 'create_user',
        targetUser: username,
      });

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: `Error creating user: ${(err as Error).message}` });
    }
  };

  /**
   * Gets audit logs - Admin only
   * @param req - Request object (should contain admin username in query or body)
   * @param res - Response object
   * @returns Promise resolving to void
   */
  const getAuditLogsRoute = async (req: Request, res: Response): Promise<void> => {
    const username = req.query.username as string;

    if (!username) {
      res.status(400).json({ error: 'Missing required field: username' });
      return;
    }

    try {
      // Check if user is admin
      const hasPermission = await isAdmin(username);
      if (!hasPermission) {
        res.status(403).json({ error: 'Unauthorized: Only admins can access audit logs' });
        return;
      }

      const filters = {
        adminUsername: req.query.adminUsername as string | undefined,
        actionType: req.query.actionType as string | undefined,
        targetUser: req.query.targetUser as string | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const logs = await getAuditLogs(filters);

      // Log admin action
      await createAuditLog({
        adminUsername: username,
        actionType: 'view_audit_logs',
      });

      res.status(200).json(logs);
    } catch (err: unknown) {
      res.status(500).json({ error: `Error fetching audit logs: ${(err as Error).message}` });
    }
  };

  // Register routes
  router.get('/metrics', getDashboardMetricsRoute);
  router.get('/audit-logs', getAuditLogsRoute);
  router.post('/create-user', createUserRoute);

  return router;
};

export default adminController;
