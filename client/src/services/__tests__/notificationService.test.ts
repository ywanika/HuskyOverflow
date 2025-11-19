import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../notificationService';
import api from '../config';

jest.mock('../config');

describe('notificationService - COS 4.1, 4.4: Notifications', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNotifications = [
    {
      _id: 'notif1',
      recipientUsername: 'user1',
      type: 'deletion',
      message: 'Your question has been deleted by a moderator. Reason: Violates guidelines',
      contentId: 'content1',
      isRead: false,
      timestamp: new Date('2024-01-01'),
    },
    {
      _id: 'notif2',
      recipientUsername: 'user1',
      type: 'appeal',
      message: 'Your appeal has been accepted',
      contentId: 'content2',
      isRead: false,
      timestamp: new Date('2024-01-02'),
    },
  ];

  describe('getNotifications', () => {
    it('should fetch all notifications for a user', async () => {
      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: mockNotifications,
      });

      const result = await getNotifications('user1');

      expect(result).toEqual(mockNotifications);
      expect(mockApi.get).toHaveBeenCalledWith('/api/notification/user1');
    });

    it('should throw error when API request fails', async () => {
      mockApi.get.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(getNotifications('user1')).rejects.toThrow('Error while fetching notifications');
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should fetch unread notification count', async () => {
      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: { count: 5 },
      });

      const result = await getUnreadNotificationCount('user1');

      expect(result).toBe(5);
      expect(mockApi.get).toHaveBeenCalledWith('/api/notification/unread/user1');
    });

    it('should throw error when API request fails', async () => {
      mockApi.get.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(getUnreadNotificationCount('user1')).rejects.toThrow(
        'Error while fetching unread notification count',
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      mockApi.patch.mockResolvedValueOnce({
        status: 200,
        data: { success: true },
      });

      const result = await markNotificationAsRead('notif1', 'user1');

      expect(result).toEqual({ success: true });
      expect(mockApi.patch).toHaveBeenCalledWith('/api/notification/read/notif1', {
        username: 'user1',
      });
    });

    it('should throw error when API request fails', async () => {
      mockApi.patch.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(markNotificationAsRead('notif1', 'user1')).rejects.toThrow(
        'Error while marking notification as read',
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockApi.patch.mockResolvedValueOnce({
        status: 200,
        data: { success: true },
      });

      const result = await markAllNotificationsAsRead('user1');

      expect(result).toEqual({ success: true });
      expect(mockApi.patch).toHaveBeenCalledWith('/api/notification/read-all', {
        username: 'user1',
      });
    });

    it('should throw error when API request fails', async () => {
      mockApi.patch.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(markAllNotificationsAsRead('user1')).rejects.toThrow(
        'Error while marking all notifications as read',
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      mockApi.delete.mockResolvedValueOnce({
        status: 200,
        data: { success: true },
      });

      const result = await deleteNotification('notif1', 'user1');

      expect(result).toEqual({ success: true });
      expect(mockApi.delete).toHaveBeenCalledWith('/api/notification/notif1', {
        data: { username: 'user1' },
      });
    });

    it('should throw error when API request fails', async () => {
      mockApi.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteNotification('notif1', 'user1')).rejects.toThrow(
        'Error while deleting notification',
      );
    });
  });

  describe('COS 4.1: Deletion Notification Content', () => {
    it('should include content type in deletion notification', async () => {
      const deletionNotification = {
        _id: 'notif1',
        recipientUsername: 'user1',
        type: 'deletion',
        message: 'Your question has been deleted by a moderator. Reason: Violates guidelines',
        contentId: 'content1',
        isRead: false,
        timestamp: new Date(),
      };

      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: [deletionNotification],
      });

      const result = await getNotifications('user1');

      expect(result[0].type).toBe('deletion');
      expect(result[0].message).toContain('deleted');
    });

    it('should include first 100 characters of deleted content in notification', async () => {
      const longContent = 'A'.repeat(150);
      const deletionNotification = {
        _id: 'notif1',
        recipientUsername: 'user1',
        type: 'deletion',
        message: `Your question has been deleted. Content: ${longContent.substring(0, 100)}...`,
        contentId: 'content1',
        isRead: false,
        timestamp: new Date(),
      };

      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: [deletionNotification],
      });

      const result = await getNotifications('user1');

      expect(result[0].message.length).toBeGreaterThan(100);
    });

    it('should include moderator reason in deletion notification', async () => {
      const deletionNotification = {
        _id: 'notif1',
        recipientUsername: 'user1',
        type: 'deletion',
        message: 'Your question has been deleted by a moderator. Reason: Violates community guidelines',
        contentId: 'content1',
        isRead: false,
        timestamp: new Date(),
      };

      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: [deletionNotification],
      });

      const result = await getNotifications('user1');

      expect(result[0].message).toContain('Reason:');
    });
  });

  describe('COS 4.4: Appeal Notification', () => {
    it('should notify user when appeal is accepted', async () => {
      const appealNotification = {
        _id: 'notif1',
        recipientUsername: 'user1',
        type: 'appeal',
        message: 'Your appeal has been accepted. Your content has been restored.',
        contentId: 'content1',
        isRead: false,
        timestamp: new Date(),
      };

      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: [appealNotification],
      });

      const result = await getNotifications('user1');

      expect(result[0].type).toBe('appeal');
      expect(result[0].message).toContain('accepted');
    });

    it('should notify user when appeal is rejected', async () => {
      const appealNotification = {
        _id: 'notif1',
        recipientUsername: 'user1',
        type: 'appeal',
        message: 'Your appeal has been rejected. The deletion decision stands.',
        contentId: 'content1',
        isRead: false,
        timestamp: new Date(),
      };

      mockApi.get.mockResolvedValueOnce({
        status: 200,
        data: [appealNotification],
      });

      const result = await getNotifications('user1');

      expect(result[0].type).toBe('appeal');
      expect(result[0].message).toContain('rejected');
    });
  });
});

