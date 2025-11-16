import api from './config';
import profanityService from './profanityService';

const ACCESS_ESCALATION_API_URL = '/api/access-escalation';

/**
 * Sends a request to escalate access to moderator role.
 *
 * @param username - The username of the user requesting access.
 * @param reason - The reason for requesting moderator access.
 * @returns {Promise<void>} A promise that resolves when the request is successful.
 * @throws {Error} If an error occurs during the request.
 */
const requestModeratorAccess = async (username: string, reason: string): Promise<void> => {
  try {
    await profanityService(reason);
    const res = await api.post(`${ACCESS_ESCALATION_API_URL}/request`, {
      username,
      requestedRole: 'moderator',
      reason,
    });

    if (res.status !== 200) {
      throw new Error('Failed to submit access request');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error while requesting access: ${error.message}`);
    } else {
      throw new Error('Error while requesting access');
    }
  }
};

export default requestModeratorAccess;
