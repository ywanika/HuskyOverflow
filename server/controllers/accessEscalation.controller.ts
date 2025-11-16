import express, { Request, Response, Router } from 'express';
import { FakeSOSocket } from '../types/types';
import { createAccessEscalationRequest } from '../services/accessEscalation.service';

/**
 * Controller for handling access escalation requests (e.g., requesting moderator access).
 */
const accessEscalationController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Handles the creation of a new access escalation request.
   * @param req The request containing username, requestedRole, and reason in the body.
   * @param res The response, either returning success or an error.
   * @returns A promise resolving to void.
   */
  const requestAccess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, requestedRole, reason } = req.body;

      if (!username || !requestedRole || !reason) {
        res.status(400).json({ error: 'Missing required fields: username, requestedRole, reason' });
        return;
      }

      if (requestedRole !== 'moderator' && requestedRole !== 'admin') {
        res.status(400).json({ error: 'Invalid requestedRole. Must be "moderator" or "admin"' });
        return;
      }

      await createAccessEscalationRequest(username, requestedRole, reason);

      res.status(200).json({ message: 'Access escalation request submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Error when creating access request: ${error}` });
    }
  };

  router.post('/request', requestAccess);

  return router;
};

export default accessEscalationController;
