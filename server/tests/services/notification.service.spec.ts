import { ObjectId } from 'mongodb';
import NotificationModel from '../../models/notifications.model';
import UserModel from '../../models/users.model';
import {
  getNotificationsByUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createSystemNotification,
  createAppealResultNotification,
  createRoleChangeNotification,
  createSuspensionNotification,
} from '../../services/notification.service';
import { DatabaseNotification } from '../../types/types';

describe('Notification Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getNotificationsByUser', () => {
    it('should return notifications for a user sorted by timestamp (newest first)', async () => {
      const username = 'testuser';
      const mockNotifications: DatabaseNotification[] = [
        {
          _id: new ObjectId() as any,
          recipientUsername: username,
          type: 'deletion',
          message: 'Your question has been deleted',
          contentId: new ObjectId() as any,
          isRead: false,
          timestamp: new Date('2024-01-02'),
        },
        {
          _id: new ObjectId() as any,
          recipientUsername: username,
          type: 'flag',
          message: 'A question has been flagged',
          contentId: new ObjectId() as any,
          isRead: true,
          timestamp: new Date('2024-01-01'),
        },
      ];

      jest.spyOn(NotificationModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockNotifications),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect('notifications' in result).toBe(true);
      if ('notifications' in result) {
        expect(result.notifications).toHaveLength(2);
        expect(result.notifications?.[0].timestamp).toEqual(new Date('2024-01-02'));
      }
    });

    it('should return error when database query fails', async () => {
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Error fetching notifications');
      }
    });

    it('should return empty array when user has no notifications', async () => {
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await getNotificationsByUser(username);

      expect('notifications' in result).toBe(true);
      if ('notifications' in result) {
        expect(result.notifications).toHaveLength(0);
      }
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return the count of unread notifications', async () => {
      const username = 'testuser';
      const mockCount = 5;

      jest.spyOn(NotificationModel, 'countDocuments').mockResolvedValue(mockCount);

      const count = await getUnreadNotificationCount(username);

      expect(count).toBe(mockCount);
      expect(NotificationModel.countDocuments).toHaveBeenCalledWith({
        recipientUsername: username,
        isRead: false,
      });
    });

    it('should return 0 when database query fails', async () => {
      const username = 'testuser';

      jest
        .spyOn(NotificationModel, 'countDocuments')
        .mockRejectedValue(new Error('Database error'));

      const count = await getUnreadNotificationCount(username);

      expect(count).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read and return it', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';
      const mockNotification: DatabaseNotification = {
        _id: new ObjectId(notificationId) as any,
        recipientUsername: username,
        type: 'deletion',
        message: 'Your question has been deleted',
        contentId: new ObjectId() as any,
        isRead: true,
        timestamp: new Date(),
      };

      jest.spyOn(NotificationModel, 'findOneAndUpdate').mockResolvedValue(mockNotification as any);

      const result = await markNotificationAsRead(notificationId, username);

      expect('notification' in result).toBe(true);
      if ('notification' in result) {
        expect(result.notification?.isRead).toBe(true);
      }
      expect(NotificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: notificationId, recipientUsername: username },
        { isRead: true },
        { new: true },
      );
    });

    it('should return error when notification is not found', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await markNotificationAsRead(notificationId, username);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('not found');
      }
    });

    it('should return error when database operation fails', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';

      jest
        .spyOn(NotificationModel, 'findOneAndUpdate')
        .mockRejectedValue(new Error('Database error'));

      const result = await markNotificationAsRead(notificationId, username);

      expect('error' in result).toBe(true);
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'updateMany').mockResolvedValue({} as any);

      const result = await markAllNotificationsAsRead(username);

      expect('error' in result).toBe(false);
      expect(NotificationModel.updateMany).toHaveBeenCalledWith(
        { recipientUsername: username, isRead: false },
        { isRead: true },
      );
    });

    it('should return error when database operation fails', async () => {
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'updateMany').mockRejectedValue(new Error('Database error'));

      const result = await markAllNotificationsAsRead(username);

      expect('error' in result).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification and return it', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';
      const mockNotification: DatabaseNotification = {
        _id: new ObjectId(notificationId) as any,
        recipientUsername: username,
        type: 'deletion',
        message: 'Your question has been deleted',
        contentId: new ObjectId() as any,
        isRead: false,
        timestamp: new Date(),
      };

      jest.spyOn(NotificationModel, 'findOneAndDelete').mockResolvedValue(mockNotification as any);

      const result = await deleteNotification(notificationId, username);

      expect('notification' in result).toBe(true);
      expect(NotificationModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: notificationId,
        recipientUsername: username,
      });
    });

    it('should return error when notification is not found', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';

      jest.spyOn(NotificationModel, 'findOneAndDelete').mockResolvedValue(null);

      const result = await deleteNotification(notificationId, username);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('not found');
      }
    });

    it('should return error when database operation fails', async () => {
      const notificationId = new ObjectId().toString();
      const username = 'testuser';

      jest
        .spyOn(NotificationModel, 'findOneAndDelete')
        .mockRejectedValue(new Error('Database error'));

      const result = await deleteNotification(notificationId, username);

      expect('error' in result).toBe(true);
    });
  });

  describe('createSystemNotification', () => {
    it('should create notifications for all users', async () => {
      const message = 'System maintenance scheduled';
      const mockUsers = [
        { username: 'user1', _id: new ObjectId() },
        { username: 'user2', _id: new ObjectId() },
        { username: 'user3', _id: new ObjectId() },
      ];

      jest.spyOn(UserModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      const mockNotifications = mockUsers.map(user => ({
        _id: new ObjectId() as any,
        recipientUsername: user.username,
        type: 'system_announcement' as const,
        message,
        contentId: null,
        isRead: false,
        timestamp: new Date(),
      }));

      jest.spyOn(NotificationModel, 'insertMany').mockResolvedValue(mockNotifications as any);

      const result = await createSystemNotification(message);

      expect('count' in result).toBe(true);
      if ('count' in result) {
        expect(result.count).toBe(3);
      }
      expect(NotificationModel.insertMany).toHaveBeenCalled();
    });

    it('should return error when no users found', async () => {
      const message = 'System maintenance scheduled';

      jest.spyOn(UserModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await createSystemNotification(message);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('No users found');
      }
    });

    it('should return error when database operation fails', async () => {
      const message = 'System maintenance scheduled';
      const mockUsers = [{ username: 'user1', _id: new ObjectId() }];

      jest.spyOn(UserModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUsers),
      } as any);

      jest.spyOn(NotificationModel, 'insertMany').mockRejectedValue(new Error('Database error'));

      const result = await createSystemNotification(message);

      expect('error' in result).toBe(true);
    });
  });

  describe('createAppealResultNotification', () => {
    it('should create notification for approved appeal', async () => {
      const recipientUsername = 'testuser';
      const contentType = 'question';
      const contentId = new ObjectId().toString();
      const status = 'approved' as const;
      const modResponse = 'Your appeal has been reviewed and approved';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createAppealResultNotification(
        recipientUsername,
        contentType,
        contentId,
        status,
        modResponse,
      );

      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername,
          type: 'appeal_result',
          contentId: expect.any(ObjectId),
          isRead: false,
        }),
      );
    });

    it('should create notification for rejected appeal', async () => {
      const recipientUsername = 'testuser';
      const contentType = 'answer';
      const contentId = new ObjectId().toString();
      const status = 'rejected' as const;

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createAppealResultNotification(recipientUsername, contentType, contentId, status);

      expect(NotificationModel.create).toHaveBeenCalled();
      const callArgs = (NotificationModel.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('rejected');
    });

    it('should handle errors silently', async () => {
      const recipientUsername = 'testuser';
      const contentType = 'comment';
      const contentId = new ObjectId().toString();
      const status = 'approved' as const;

      jest.spyOn(NotificationModel, 'create').mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(
        createAppealResultNotification(recipientUsername, contentType, contentId, status),
      ).resolves.not.toThrow();
    });
  });

  describe('createRoleChangeNotification', () => {
    it('should create notification for role change to moderator', async () => {
      const recipientUsername = 'testuser';
      const newRole = 'moderator' as const;
      const changedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createRoleChangeNotification(recipientUsername, newRole, changedBy);

      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername,
          type: 'role_change',
          message: expect.stringContaining('moderator'),
          contentId: null,
          isRead: false,
        }),
      );
    });

    it('should create notification for role change to user', async () => {
      const recipientUsername = 'testuser';
      const newRole = 'user' as const;
      const changedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createRoleChangeNotification(recipientUsername, newRole, changedBy);

      expect(NotificationModel.create).toHaveBeenCalled();
      const callArgs = (NotificationModel.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('regular user');
    });

    it('should create notification for role change to admin', async () => {
      const recipientUsername = 'testuser';
      const newRole = 'admin' as const;
      const changedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createRoleChangeNotification(recipientUsername, newRole, changedBy);

      expect(NotificationModel.create).toHaveBeenCalled();
      const callArgs = (NotificationModel.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('administrator');
    });

    it('should handle errors silently', async () => {
      const recipientUsername = 'testuser';
      const newRole = 'moderator' as const;
      const changedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockRejectedValue(new Error('Database error'));

      await expect(
        createRoleChangeNotification(recipientUsername, newRole, changedBy),
      ).resolves.not.toThrow();
    });
  });

  describe('createSuspensionNotification', () => {
    it('should create notification for temporary suspension', async () => {
      const recipientUsername = 'testuser';
      const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const reason = 'Violation of community guidelines';
      const suspendedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createSuspensionNotification(recipientUsername, suspendedUntil, reason, suspendedBy);

      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername,
          type: 'suspension',
          message: expect.stringContaining('suspended'),
          contentId: null,
          isRead: false,
        }),
      );
    });

    it('should create notification for permanent ban', async () => {
      const recipientUsername = 'testuser';
      const suspendedUntil = new Date(Date.now() + 400 * 24 * 60 * 60 * 1000); // More than 1 year
      const reason = 'Severe violation of community guidelines';
      const suspendedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createSuspensionNotification(recipientUsername, suspendedUntil, reason, suspendedBy);

      expect(NotificationModel.create).toHaveBeenCalled();
      const callArgs = (NotificationModel.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.message).toContain('permanently banned');
    });

    it('should include suspension end date for temporary suspensions', async () => {
      const recipientUsername = 'testuser';
      const suspendedUntil = new Date('2024-12-31');
      const reason = 'Violation of community guidelines';
      const suspendedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      await createSuspensionNotification(recipientUsername, suspendedUntil, reason, suspendedBy);

      expect(NotificationModel.create).toHaveBeenCalled();
      const callArgs = (NotificationModel.create as jest.Mock).mock.calls[0][0];
      // toLocaleDateString() formats dates differently, so check for the year and month
      expect(callArgs.message).toContain('suspension will be lifted');
      expect(callArgs.message).toContain('2024');
    });

    it('should handle errors silently', async () => {
      const recipientUsername = 'testuser';
      const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const reason = 'Violation';
      const suspendedBy = 'admin1';

      jest.spyOn(NotificationModel, 'create').mockRejectedValue(new Error('Database error'));

      await expect(
        createSuspensionNotification(recipientUsername, suspendedUntil, reason, suspendedBy),
      ).resolves.not.toThrow();
    });
  });
});
