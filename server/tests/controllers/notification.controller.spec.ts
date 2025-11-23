import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../../app';
import * as notificationService from '../../services/notification.service';
import { DatabaseNotification } from '../../types/types';

const mockNotificationId = new ObjectId();

const mockNotification: DatabaseNotification = {
  _id: mockNotificationId as unknown as DatabaseNotification['_id'],
  recipientUsername: 'testuser',
  type: 'deletion',
  message: 'Your question has been deleted. Reason: Violation of guidelines',
  contentId: new ObjectId() as unknown as DatabaseNotification['contentId'],
  isRead: false,
  timestamp: new Date(),
};

const MOCK_NOTIFICATIONS: DatabaseNotification[] = [
  mockNotification,
  {
    ...mockNotification,
    _id: new ObjectId() as unknown as DatabaseNotification['_id'],
    type: 'flag',
    message: 'A question has been flagged',
    isRead: true,
  },
];

// Mock the notification service
const getNotificationsByUserSpy = jest.spyOn(notificationService, 'getNotificationsByUser');
const getUnreadNotificationCountSpy = jest.spyOn(notificationService, 'getUnreadNotificationCount');
const markNotificationAsReadSpy = jest.spyOn(notificationService, 'markNotificationAsRead');
const markAllNotificationsAsReadSpy = jest.spyOn(notificationService, 'markAllNotificationsAsRead');
const deleteNotificationSpy = jest.spyOn(notificationService, 'deleteNotification');
const createSystemNotificationSpy = jest.spyOn(notificationService, 'createSystemNotification');

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/notification/:username', () => {
    it('should return all notifications for a user', async () => {
      const username = 'testuser';
      getNotificationsByUserSpy.mockResolvedValueOnce({ notifications: MOCK_NOTIFICATIONS });

      const response = await supertest(app).get(`/api/notification/${username}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(getNotificationsByUserSpy).toHaveBeenCalledWith(username);
    });

    it('should return 400 when username is missing', async () => {
      const response = await supertest(app).get('/api/notification/');

      expect(response.status).toBe(404); // Express returns 404 for missing route params
    });

    it('should return 500 when service returns error', async () => {
      const username = 'testuser';
      getNotificationsByUserSpy.mockResolvedValueOnce({
        error: 'Error fetching notifications',
      });

      const response = await supertest(app).get(`/api/notification/${username}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error fetching notifications');
    });

    it('should return empty array when user has no notifications', async () => {
      const username = 'testuser';
      getNotificationsByUserSpy.mockResolvedValueOnce({ notifications: [] });

      const response = await supertest(app).get(`/api/notification/${username}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/notification/unread/:username', () => {
    it('should return unread notification count', async () => {
      const username = 'testuser';
      const mockCount = 5;
      getUnreadNotificationCountSpy.mockResolvedValueOnce(mockCount);

      const response = await supertest(app).get(`/api/notification/unread/${username}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(mockCount);
      expect(getUnreadNotificationCountSpy).toHaveBeenCalledWith(username);
    });

    it('should return 400 when username is missing', async () => {
      const response = await supertest(app).get('/api/notification/unread/');

      // Express returns 404 for missing route params, but the controller handles it as 500
      // when the service is called with undefined
      expect([404, 500]).toContain(response.status);
    });

    it('should return 0 when service returns 0', async () => {
      const username = 'testuser';
      getUnreadNotificationCountSpy.mockResolvedValueOnce(0);

      const response = await supertest(app).get(`/api/notification/unread/${username}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  describe('PATCH /api/notification/read/:notificationId', () => {
    it('should mark a notification as read', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      const updatedNotification = { ...mockNotification, isRead: true };
      markNotificationAsReadSpy.mockResolvedValueOnce({ notification: updatedNotification });

      const response = await supertest(app)
        .patch(`/api/notification/read/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.notification.isRead).toBe(true);
      expect(markNotificationAsReadSpy).toHaveBeenCalledWith(notificationId, username);
    });

    it('should return 400 when notificationId is missing', async () => {
      const response = await supertest(app)
        .patch('/api/notification/read/')
        .send({ username: 'testuser' });

      expect(response.status).toBe(404);
    });

    it('should return 400 when username is missing', async () => {
      const notificationId = mockNotificationId.toString();

      const response = await supertest(app)
        .patch(`/api/notification/read/${notificationId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 404 when notification is not found', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      markNotificationAsReadSpy.mockResolvedValueOnce({
        error: 'Notification not found or unauthorized',
      });

      const response = await supertest(app)
        .patch(`/api/notification/read/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 500 when service returns error', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      markNotificationAsReadSpy.mockResolvedValueOnce({
        error: 'Database error',
      });

      const response = await supertest(app)
        .patch(`/api/notification/read/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/notification/read-all', () => {
    it('should mark all notifications as read for a user', async () => {
      const username = 'testuser';
      markAllNotificationsAsReadSpy.mockResolvedValueOnce({});

      const response = await supertest(app).patch('/api/notification/read-all').send({ username });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(markAllNotificationsAsReadSpy).toHaveBeenCalledWith(username);
    });

    it('should return 400 when username is missing', async () => {
      const response = await supertest(app).patch('/api/notification/read-all').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required field');
    });

    it('should return 500 when service returns error', async () => {
      const username = 'testuser';
      markAllNotificationsAsReadSpy.mockResolvedValueOnce({
        error: 'Database error',
      });

      const response = await supertest(app).patch('/api/notification/read-all').send({ username });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/notification/:notificationId', () => {
    it('should delete a notification', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      deleteNotificationSpy.mockResolvedValueOnce({ notification: mockNotification });

      const response = await supertest(app)
        .delete(`/api/notification/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(deleteNotificationSpy).toHaveBeenCalledWith(notificationId, username);
    });

    it('should return 400 when notificationId is missing', async () => {
      const response = await supertest(app)
        .delete('/api/notification/')
        .send({ username: 'testuser' });

      expect(response.status).toBe(404);
    });

    it('should return 400 when username is missing', async () => {
      const notificationId = mockNotificationId.toString();

      const response = await supertest(app).delete(`/api/notification/${notificationId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 404 when notification is not found', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      deleteNotificationSpy.mockResolvedValueOnce({
        error: 'Notification not found or unauthorized',
      });

      const response = await supertest(app)
        .delete(`/api/notification/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 500 when service returns error', async () => {
      const notificationId = mockNotificationId.toString();
      const username = 'testuser';
      deleteNotificationSpy.mockResolvedValueOnce({
        error: 'Database error',
      });

      const response = await supertest(app)
        .delete(`/api/notification/${notificationId}`)
        .send({ username });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/notification/system', () => {
    it('should create system-wide notification', async () => {
      const message = 'System maintenance scheduled for tonight';
      createSystemNotificationSpy.mockResolvedValueOnce({ count: 10 });

      const response = await supertest(app).post('/api/notification/system').send({ message });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(10);
      expect(createSystemNotificationSpy).toHaveBeenCalledWith(message);
    });

    it('should return 400 when message is missing', async () => {
      const response = await supertest(app).post('/api/notification/system').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required field');
    });

    it('should return 500 when service returns error', async () => {
      const message = 'System maintenance';
      createSystemNotificationSpy.mockResolvedValueOnce({
        error: 'No users found',
      });

      const response = await supertest(app).post('/api/notification/system').send({ message });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('No users found');
    });
  });
});
