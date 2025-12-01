import UserModel from '../models/users.model';
import NotificationModel from '../models/notifications.model';

/**
 * Response type for chatbot operations
 */
export interface ChatbotResponse {
  success?: boolean;
  error?: string;
  count?: number;
}

/**
 * Sends a message from a user to all moderators
 * Creates notifications for all moderators and admins
 * @param username - The username of the user sending the message
 * @param message - The message content
 * @returns Promise resolving to ChatbotResponse
 */
export const contactModerator = async (
  username: string,
  message: string,
): Promise<ChatbotResponse> => {
  try {
    // Validate inputs
    if (!username || !message || !message.trim()) {
      return { error: 'Username and message are required' };
    }

    // Get all moderators and admins
    const moderators = await UserModel.find({
      role: { $in: ['moderator', 'admin'] },
    }).select('username');

    if (!moderators || moderators.length === 0) {
      return { error: 'No moderators found' };
    }

    // Create notifications for all moderators/admins
    const notifications = moderators.map(mod => ({
      recipientUsername: mod.username,
      type: 'flag' as const, // Using 'flag' type for moderator contact messages
      message: `User ${username} sent a message: "${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"`,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    }));

    await NotificationModel.insertMany(notifications);

    return { success: true, count: notifications.length };
  } catch (error) {
    return { error: `Error sending message to moderators: ${(error as Error).message}` };
  }
};
