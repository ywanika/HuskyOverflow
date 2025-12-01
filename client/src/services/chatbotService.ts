import api from './config';

const CHATBOT_API_URL = `/api/chatbot`;

/**
 * Sends a message to moderators from a user
 * @param username - The username of the user sending the message
 * @param message - The message content
 * @returns Promise resolving to success status
 * @throws Error if the API response status is not 200
 */
const contactModerator = async (
  username: string,
  message: string,
): Promise<{ success: boolean }> => {
  const res = await api.post(`${CHATBOT_API_URL}/contact-moderator`, {
    username,
    message,
  });

  if (res.status !== 200) {
    throw new Error('Error while sending message to moderator');
  }

  return res.data;
};

export default contactModerator;
