import mongoose from 'mongoose';
import NotificationModel from '../../models/notifications.model';
import UserModel from '../../models/users.model';
import {
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createSystemNotification,
} from '../../services/notification.service';
import { DatabaseNotification } from '@fake-stack-overflow/shared';

describe('Notification Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getNotificationsByUser', () => {
    const username = 'user1';

    it('should return all notifications for a user', async () => {
      const mockNotifications: DatabaseNotification[] = [
        {
          _id: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['_id'],
          recipientUsername: username,
          type: 'deletion',
          message: 'Your question has been deleted',
          contentId: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['contentId'],
          isRead: false,
          timestamp: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['_id'],
          recipientUsername: username,
          type: 'flag',
          message: 'A question has been flagged',
          contentId: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['contentId'],
          isRead: true,
          timestamp: new Date(),
        },
      ];

      jest.spyOn(NotificationModel, 'find').mockReturnValueOnce({
        sort: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce(mockNotifications),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.error).toBeUndefined();
      expect(NotificationModel.find).toHaveBeenCalledWith({ recipientUsername: username });
    });

    it('should return empty array if no notifications', async () => {
      jest.spyOn(NotificationModel, 'find').mockReturnValueOnce({
        sort: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect(result.notifications).toEqual([]);
      expect(result.error).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(NotificationModel, 'find').mockReturnValueOnce({
        sort: jest.fn().mockReturnValueOnce({
          lean: jest.fn().mockRejectedValueOnce(new Error('Database error')),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error fetching notifications');
    });
  });

  describe('getUnreadNotificationCount', () => {
    const username = 'user1';

    it('should return the count of unread notifications', async () => {
      jest.spyOn(NotificationModel, 'countDocuments').mockResolvedValueOnce(5);

      const result = await getUnreadNotificationCount(username);

      expect(result).toBe(5);
      expect(NotificationModel.countDocuments).toHaveBeenCalledWith({
        recipientUsername: username,
        isRead: false,
      });
    });

    it('should return 0 if no unread notifications', async () => {
      jest.spyOn(NotificationModel, 'countDocuments').mockResolvedValueOnce(0);

      const result = await getUnreadNotificationCount(username);

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      jest.spyOn(NotificationModel, 'countDocuments').mockRejectedValueOnce(new Error('DB error'));

      const result = await getUnreadNotificationCount(username);

      expect(result).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    const notificationId = new mongoose.Types.ObjectId().toString();
    const username = 'user1';

    it('should successfully mark a notification as read', async () => {
      const mockNotification: DatabaseNotification = {
        _id: new mongoose.Types.ObjectId(notificationId) as unknown as DatabaseNotification['_id'],
        recipientUsername: username,
        type: 'deletion',
        message: 'Your question has been deleted',
        contentId: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['contentId'],
        isRead: true,
        timestamp: new Date(),
      };

      jest.spyOn(NotificationModel, 'findOneAndUpdate').mockResolvedValueOnce(mockNotification);

      const result = await markNotificationAsRead(notificationId, username);

      expect(result.notification).toEqual(mockNotification);
      expect(result.error).toBeUndefined();
      expect(NotificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: notificationId, recipientUsername: username },
        { isRead: true },
        { new: true },
      );
    });

    it('should return error if notification not found', async () => {
      jest.spyOn(NotificationModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

      const result = await markNotificationAsRead(notificationId, username);

      expect(result.error).toBe('Notification not found or unauthorized');
      expect(result.notification).toBeUndefined();
    });

    it('should return error if unauthorized', async () => {
      jest.spyOn(NotificationModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

      const result = await markNotificationAsRead(notificationId, 'differentUser');

      expect(result.error).toBe('Notification not found or unauthorized');
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(NotificationModel, 'findOneAndUpdate')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await markNotificationAsRead(notificationId, username);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error marking notification as read');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    const username = 'user1';

    it('should successfully mark all notifications as read', async () => {
      jest.spyOn(NotificationModel, 'updateMany').mockResolvedValueOnce({
        acknowledged: true,
        modifiedCount: 3,
      } as any);

      const result = await markAllNotificationsAsRead(username);

      expect(result.error).toBeUndefined();
      expect(NotificationModel.updateMany).toHaveBeenCalledWith(
        { recipientUsername: username, isRead: false },
        { isRead: true },
      );
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(NotificationModel, 'updateMany')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await markAllNotificationsAsRead(username);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error marking all notifications as read');
    });
  });

  describe('deleteNotification', () => {
    const notificationId = new mongoose.Types.ObjectId().toString();
    const username = 'user1';

    it('should successfully delete a notification', async () => {
      const mockNotification: DatabaseNotification = {
        _id: new mongoose.Types.ObjectId(notificationId) as unknown as DatabaseNotification['_id'],
        recipientUsername: username,
        type: 'deletion',
        message: 'Your question has been deleted',
        contentId: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['contentId'],
        isRead: false,
        timestamp: new Date(),
      };

      jest.spyOn(NotificationModel, 'findOneAndDelete').mockResolvedValueOnce(mockNotification);

      const result = await deleteNotification(notificationId, username);

      expect(result.notification).toEqual(mockNotification);
      expect(result.error).toBeUndefined();
      expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: notificationId,
        recipientUsername: username,
      });
    });

    it('should return error if notification not found', async () => {
      jest.spyOn(NotificationModel, 'findOneAndDelete').mockResolvedValueOnce(null);

      const result = await deleteNotification(notificationId, username);

      expect(result.error).toBe('Notification not found or unauthorized');
      expect(result.notification).toBeUndefined();
    });

    it('should return error if unauthorized', async () => {
      jest.spyOn(NotificationModel, 'findOneAndDelete').mockResolvedValueOnce(null);

      const result = await deleteNotification(notificationId, 'differentUser');

      expect(result.error).toBe('Notification not found or unauthorized');
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(NotificationModel, 'findOneAndDelete')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await deleteNotification(notificationId, username);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error deleting notification');
    });
  });

  describe('createSystemNotification', () => {
    const message = 'System maintenance scheduled';

    it('should successfully create system notifications for all users', async () => {
      const mockUsers = [
        { username: 'user1', _id: new mongoose.Types.ObjectId() },
        { username: 'user2', _id: new mongoose.Types.ObjectId() },
        { username: 'user3', _id: new mongoose.Types.ObjectId() },
      ];

      const mockNotifications = [
        {
          _id: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['_id'],
          recipientUsername: 'user1',
          type: 'system_announcement',
          message,
          contentId: null,
          isRead: false,
          timestamp: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['_id'],
          recipientUsername: 'user2',
          type: 'system_announcement',
          message,
          contentId: null,
          isRead: false,
          timestamp: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId() as unknown as DatabaseNotification['_id'],
          recipientUsername: 'user3',
          type: 'system_announcement',
          message,
          contentId: null,
          isRead: false,
          timestamp: new Date(),
        },
      ];

      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(mockUsers),
      } as any);
      jest.spyOn(NotificationModel, 'insertMany').mockResolvedValueOnce(mockNotifications as any);

      const result = await createSystemNotification(message);

      expect(result.count).toBe(3);
      expect(result.error).toBeUndefined();
      expect(UserModel.find).toHaveBeenCalledWith({}, { username: 1 });
      expect(NotificationModel.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            recipientUsername: 'user1',
            type: 'system_announcement',
            message,
          }),
        ]),
      );
    });

    it('should return error if no users found', async () => {
      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await createSystemNotification(message);

      expect(result.error).toBe('No users found');
      expect(result.count).toBeUndefined();
      expect(NotificationModel.insertMany).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      const result = await createSystemNotification(message);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error creating system notification');
    });
  });
});
