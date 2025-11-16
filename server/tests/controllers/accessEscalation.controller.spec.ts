import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/accessEscalation.service';
import { AccessEscalationRequest } from '../../../shared/types/moderation';

const mockAccessRequest: AccessEscalationRequest = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  requestedRole: 'moderator',
  reason: 'I want to help moderate the community',
  status: 'pending',
  timestamp: new Date('2024-12-03'),
};

const createAccessEscalationRequestSpy = jest.spyOn(util, 'createAccessEscalationRequest');

describe('Test accessEscalationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /request', () => {
    it('should create a new access escalation request with valid data', async () => {
      const mockReqBody = {
        username: mockAccessRequest.username,
        requestedRole: mockAccessRequest.requestedRole,
        reason: mockAccessRequest.reason,
      };

      createAccessEscalationRequestSpy.mockResolvedValueOnce(mockAccessRequest);

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(createAccessEscalationRequestSpy).toHaveBeenCalledWith(
        mockReqBody.username,
        mockReqBody.requestedRole,
        mockReqBody.reason,
      );
    });

    it('should return 400 when username is missing', async () => {
      const mockReqBody = {
        requestedRole: 'moderator',
        reason: 'I want to help',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when requestedRole is missing', async () => {
      const mockReqBody = {
        username: 'testuser',
        reason: 'I want to help',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when reason is missing', async () => {
      const mockReqBody = {
        username: 'testuser',
        requestedRole: 'moderator',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when requestedRole is invalid', async () => {
      const mockReqBody = {
        username: 'testuser',
        requestedRole: 'superadmin',
        reason: 'I want to help',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when username is empty string', async () => {
      const mockReqBody = {
        username: '',
        requestedRole: 'moderator',
        reason: 'I want to help',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when reason is empty string', async () => {
      const mockReqBody = {
        username: 'testuser',
        requestedRole: 'moderator',
        reason: '',
      };

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(400);
      expect(createAccessEscalationRequestSpy).not.toHaveBeenCalled();
    });

    it('should handle requestedRole "admin"', async () => {
      const mockReqBody = {
        username: 'testuser',
        requestedRole: 'admin',
        reason: 'I want to help as admin',
      };

      createAccessEscalationRequestSpy.mockResolvedValueOnce({
        ...mockAccessRequest,
        requestedRole: 'admin',
      });

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(createAccessEscalationRequestSpy).toHaveBeenCalledWith(
        mockReqBody.username,
        mockReqBody.requestedRole,
        mockReqBody.reason,
      );
    });

    it('should return 500 when service throws an error', async () => {
      const mockReqBody = {
        username: 'testuser',
        requestedRole: 'moderator',
        reason: 'I want to help',
      };

      createAccessEscalationRequestSpy.mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      const response = await supertest(app)
        .post('/api/access-escalation/request')
        .send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error when creating access request');
      expect(createAccessEscalationRequestSpy).toHaveBeenCalledWith(
        mockReqBody.username,
        mockReqBody.requestedRole,
        mockReqBody.reason,
      );
    });
  });
});
