import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as adminService from '../../services/admin.service';
import * as auditLogService from '../../services/auditLog.service';
import { SafeDatabaseUser } from '../../types/types';

const mockAdminUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'admin1',
  dateJoined: new Date('2024-12-03'),
  role: 'admin',
};

const mockRegularUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'regularuser',
  dateJoined: new Date('2024-12-03'),
  role: 'user',
};

const mockModeratorUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'moderator1',
  dateJoined: new Date('2024-12-03'),
  role: 'moderator',
};

const getDashboardMetricsSpy = jest.spyOn(adminService, 'getDashboardMetrics');
const isAdminSpy = jest.spyOn(adminService, 'isAdmin');
const createUserWithRoleSpy = jest.spyOn(adminService, 'createUserWithRole');
const createAuditLogSpy = jest.spyOn(auditLogService, 'createAuditLog');
const getAuditLogsSpy = jest.spyOn(auditLogService, 'getAuditLogs');

describe('Test adminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/metrics', () => {
    it('should return dashboard metrics for admin user', async () => {
      const mockMetrics = {
        users: {
          total: 100,
          newThisWeek: 10,
          newThisMonth: 25,
          byRole: { user: 80, moderator: 15, admin: 5 },
          active: 50,
          suspended: 5,
        },
        content: {
          questions: { total: 200, withAnswers: 150, unanswered: 50, flagged: 5, deleted: 2 },
          answers: { total: 400, flagged: 3, deleted: 1 },
          comments: { total: 600, flagged: 2, deleted: 0 },
        },
        engagement: {
          totalViews: 10000,
          totalUpvotes: 1500,
          totalDownvotes: 200,
          averageAnswersPerQuestion: 2.0,
          averageCommentsPerAnswer: 1.5,
        },
        moderation: {
          totalFlagged: 10,
          totalReviewed: 8,
          totalDeleted: 3,
          pendingReview: 2,
        },
        tags: {
          total: 50,
          mostUsed: [
            { name: 'javascript', count: 100 },
            { name: 'react', count: 80 },
          ],
        },
        communities: {
          total: 10,
          public: 8,
          private: 2,
        },
        collections: { total: 25 },
        messages: { total: 500 },
        growth: {
          questionsByWeek: [{ week: '2024-W01', count: 20 }],
          usersByWeek: [{ week: '2024-W01', count: 5 }],
        },
      };

      isAdminSpy.mockResolvedValueOnce(true);
      getDashboardMetricsSpy.mockResolvedValueOnce(mockMetrics as any);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).get('/api/admin/metrics?username=admin1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMetrics);
      expect(isAdminSpy).toHaveBeenCalledWith('admin1');
      expect(getDashboardMetricsSpy).toHaveBeenCalled();
      expect(createAuditLogSpy).toHaveBeenCalledWith({
        adminUsername: 'admin1',
        actionType: 'view_dashboard_metrics',
      });
    });

    it('should return 403 for non-admin user', async () => {
      isAdminSpy.mockResolvedValueOnce(false);

      const response = await supertest(app).get('/api/admin/metrics?username=regularuser');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return 400 for missing username', async () => {
      const response = await supertest(app).get('/api/admin/metrics');

      expect(response.status).toBe(400);
      expect(response.body?.message).toBe('Request Validation Failed');
      expect(response.body?.errors?.[0]?.message).toContain('must have required property');
    });

    it('should return 500 for service error', async () => {
      isAdminSpy.mockResolvedValueOnce(true);
      getDashboardMetricsSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).get('/api/admin/metrics?username=admin1');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error fetching dashboard metrics');
    });
  });

  describe('POST /api/admin/create-user', () => {
    it('should create a new user with specified role for admin', async () => {
      const mockNewUser = { ...mockRegularUser, username: 'newuser' };

      isAdminSpy.mockResolvedValueOnce(true);
      createUserWithRoleSpy.mockResolvedValueOnce(mockNewUser);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        _id: mockNewUser._id.toString(),
        username: 'newuser',
        role: 'user',
        dateJoined: expect.any(String),
      });
      expect(isAdminSpy).toHaveBeenCalledWith('admin1');
      expect(createUserWithRoleSpy).toHaveBeenCalledWith('newuser', 'password123', 'user');
      expect(createAuditLogSpy).toHaveBeenCalledWith({
        adminUsername: 'admin1',
        actionType: 'create_user',
        targetUser: 'newuser',
      });
    });

    it('should create a moderator user', async () => {
      const mockNewModerator = { ...mockModeratorUser, username: 'newmoderator' };

      isAdminSpy.mockResolvedValueOnce(true);
      createUserWithRoleSpy.mockResolvedValueOnce(mockNewModerator);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newmoderator',
        password: 'password123',
        role: 'moderator',
      });

      expect(response.status).toBe(200);
      expect(createUserWithRoleSpy).toHaveBeenCalledWith(
        'newmoderator',
        'password123',
        'moderator',
      );
    });

    it('should create an admin user', async () => {
      const mockNewAdmin = { ...mockAdminUser, username: 'newadmin' };

      isAdminSpy.mockResolvedValueOnce(true);
      createUserWithRoleSpy.mockResolvedValueOnce(mockNewAdmin);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newadmin',
        password: 'password123',
        role: 'admin',
      });

      expect(response.status).toBe(200);
      expect(createUserWithRoleSpy).toHaveBeenCalledWith('newadmin', 'password123', 'admin');
    });

    it('should return 403 for non-admin user', async () => {
      isAdminSpy.mockResolvedValueOnce(false);

      const response = await supertest(app)
        .post('/api/admin/create-user?username=regularuser')
        .send({
          username: 'newuser',
          password: 'password123',
          role: 'user',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return 400 for missing admin username', async () => {
      const response = await supertest(app).post('/api/admin/create-user').send({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required field: username (admin)');
    }, 10000); // Increase timeout

    it('should return 400 for missing required fields', async () => {
      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newuser',
        // missing password and role
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid role', async () => {
      isAdminSpy.mockResolvedValueOnce(true); // Mock admin check

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newuser',
        password: 'password123',
        role: 'invalidrole',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid role');
    });

    it('should return 400 for service error with error object', async () => {
      isAdminSpy.mockResolvedValueOnce(true);
      createUserWithRoleSpy.mockResolvedValueOnce({ error: 'Username already exists' });

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'existinguser',
        password: 'password123',
        role: 'user',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username already exists');
    });

    it('should return 500 for unexpected service error', async () => {
      isAdminSpy.mockResolvedValueOnce(true);
      createUserWithRoleSpy.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await supertest(app).post('/api/admin/create-user?username=admin1').send({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error creating user');
    });
  });

  describe('GET /api/admin/audit-logs', () => {
    beforeEach(() => {
      // Extra mock clearing for this describe block due to test pollution
      isAdminSpy.mockReset();
      getAuditLogsSpy.mockReset();
      createAuditLogSpy.mockReset();
    });

    it('should return audit logs for admin user', async () => {
      const mockLogs = [
        {
          _id: new mongoose.Types.ObjectId(),
          adminUsername: 'admin1',
          actionType: 'create_user',
          targetUser: 'newuser',
          timestamp: new Date(),
        },
      ];

      isAdminSpy.mockResolvedValueOnce(true);
      getAuditLogsSpy.mockResolvedValueOnce(mockLogs as any);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).get('/api/admin/audit-logs?username=admin1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        _id: expect.any(String),
        adminUsername: 'admin1',
        actionType: 'create_user',
        targetUser: 'newuser',
        timestamp: expect.any(String),
      });
      expect(isAdminSpy).toHaveBeenCalledWith('admin1');
      expect(getAuditLogsSpy).toHaveBeenCalledWith({
        adminUsername: undefined,
        actionType: undefined,
        targetUser: undefined,
        startDate: undefined,
        endDate: undefined,
      });
      expect(createAuditLogSpy).toHaveBeenCalledWith({
        adminUsername: 'admin1',
        actionType: 'view_audit_logs',
      });
    });

    it('should apply filters when provided', async () => {
      const mockLogs: any[] = [];

      isAdminSpy.mockResolvedValueOnce(true);
      getAuditLogsSpy.mockResolvedValueOnce(mockLogs);
      createAuditLogSpy.mockResolvedValueOnce(undefined);

      const response = await supertest(app).get(
        '/api/admin/audit-logs?username=admin1&adminUsername=admin2&actionType=create_user&targetUser=testuser&startDate=2024-01-01&endDate=2024-12-31',
      );

      expect(response.status).toBe(200);
      expect(getAuditLogsSpy).toHaveBeenCalledWith({
        adminUsername: 'admin2',
        actionType: 'create_user',
        targetUser: 'testuser',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
    });

    it('should return 403 for non-admin user', async () => {
      isAdminSpy.mockResolvedValueOnce(false);

      const response = await supertest(app).get('/api/admin/audit-logs?username=regularuser');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    }, 10000); // Increase timeout

    it('should return 500 for service error', async () => {
      isAdminSpy.mockResolvedValueOnce(true);
      getAuditLogsSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).get('/api/admin/audit-logs?username=admin1');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error fetching audit logs');
    }, 10000); // Increase timeout
  });
});
