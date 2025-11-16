import mongoose from 'mongoose';
import AccessEscalationRequestModel from '../../models/accessEscalationRequest.model';
import {
  createAccessEscalationRequest,
  getAllAccessEscalationRequests,
  getAccessEscalationRequestsByUsername,
  updateAccessEscalationRequestStatus,
} from '../../services/accessEscalation.service';
import { AccessEscalationRequest } from '../../../shared/types/moderation';

const mockAccessRequest: AccessEscalationRequest = {
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  requestedRole: 'moderator',
  reason: 'I want to help moderate the community',
  status: 'pending',
  timestamp: new Date('2024-12-03'),
};

const mockAccessRequest2: AccessEscalationRequest = {
  _id: new mongoose.Types.ObjectId(),
  username: 'anotheruser',
  requestedRole: 'admin',
  reason: 'I have experience as admin',
  status: 'pending',
  timestamp: new Date('2024-12-04'),
};

describe('Access Escalation Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createAccessEscalationRequest', () => {
    it('should create and return a new access escalation request', async () => {
      jest
        .spyOn(AccessEscalationRequestModel, 'create')
        .mockResolvedValueOnce(mockAccessRequest as any);

      const result = await createAccessEscalationRequest(
        mockAccessRequest.username,
        mockAccessRequest.requestedRole,
        mockAccessRequest.reason,
      );

      expect(result._id).toBeDefined();
      expect(result.username).toEqual(mockAccessRequest.username);
      expect(result.requestedRole).toEqual(mockAccessRequest.requestedRole);
      expect(result.reason).toEqual(mockAccessRequest.reason);
      expect(result.status).toEqual('pending');
      expect(AccessEscalationRequestModel.create).toHaveBeenCalledWith({
        username: mockAccessRequest.username,
        requestedRole: mockAccessRequest.requestedRole,
        reason: mockAccessRequest.reason,
        status: 'pending',
        timestamp: expect.any(Date),
      });
    });

    it('should throw an error if create returns null', async () => {
      jest.spyOn(AccessEscalationRequestModel, 'create').mockResolvedValueOnce(null as any);

      await expect(
        createAccessEscalationRequest('testuser', 'moderator', 'Test reason'),
      ).rejects.toThrow('Error occurred when creating access request');
    });

    it('should throw an error if database operation fails', async () => {
      jest
        .spyOn(AccessEscalationRequestModel, 'create')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        createAccessEscalationRequest('testuser', 'moderator', 'Test reason'),
      ).rejects.toThrow('Error occurred when creating access request');
    });

    it('should create request with admin role', async () => {
      const adminRequest = { ...mockAccessRequest, requestedRole: 'admin' as const };
      jest.spyOn(AccessEscalationRequestModel, 'create').mockResolvedValueOnce(adminRequest as any);

      const result = await createAccessEscalationRequest('testuser', 'admin', 'Test reason');

      expect(result.requestedRole).toEqual('admin');
    });
  });

  describe('getAllAccessEscalationRequests', () => {
    it('should return all access escalation requests sorted by timestamp', async () => {
      const mockFind = {
        sort: jest.fn().mockResolvedValue([mockAccessRequest2, mockAccessRequest]),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      const result = await getAllAccessEscalationRequests();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockAccessRequest2);
      expect(result[1]).toEqual(mockAccessRequest);
      expect(AccessEscalationRequestModel.find).toHaveBeenCalledWith();
      expect(mockFind.sort).toHaveBeenCalledWith({ timestamp: -1 });
    });

    it('should return empty array when no requests exist', async () => {
      const mockFind = {
        sort: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      const result = await getAllAccessEscalationRequests();

      expect(result).toHaveLength(0);
    });

    it('should throw an error if database operation fails', async () => {
      const mockFind = {
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      await expect(getAllAccessEscalationRequests()).rejects.toThrow(
        'Error occurred when retrieving access requests',
      );
    });
  });

  describe('getAccessEscalationRequestsByUsername', () => {
    it('should return requests for a specific username', async () => {
      const mockFind = {
        sort: jest.fn().mockResolvedValue([mockAccessRequest]),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      const result = await getAccessEscalationRequestsByUsername('testuser');

      expect(result).toHaveLength(1);
      expect(result[0].username).toEqual('testuser');
      expect(AccessEscalationRequestModel.find).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockFind.sort).toHaveBeenCalledWith({ timestamp: -1 });
    });

    it('should return empty array when user has no requests', async () => {
      const mockFind = {
        sort: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      const result = await getAccessEscalationRequestsByUsername('nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should throw an error if database operation fails', async () => {
      const mockFind = {
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      await expect(getAccessEscalationRequestsByUsername('testuser')).rejects.toThrow(
        'Error occurred when retrieving access requests',
      );
    });

    it('should return multiple requests for the same user', async () => {
      const secondRequest = { ...mockAccessRequest, _id: new mongoose.Types.ObjectId() };
      const mockFind = {
        sort: jest.fn().mockResolvedValue([mockAccessRequest, secondRequest]),
      };

      jest.spyOn(AccessEscalationRequestModel, 'find').mockReturnValue(mockFind as any);

      const result = await getAccessEscalationRequestsByUsername('testuser');

      expect(result).toHaveLength(2);
      expect(result[0].username).toEqual('testuser');
      expect(result[1].username).toEqual('testuser');
    });
  });

  describe('updateAccessEscalationRequestStatus', () => {
    it('should update request status to approved', async () => {
      const updatedRequest = {
        ...mockAccessRequest,
        status: 'approved' as const,
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        responseMessage: 'Request approved',
      };

      jest
        .spyOn(AccessEscalationRequestModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedRequest as any);

      const result = await updateAccessEscalationRequestStatus(
        mockAccessRequest._id.toString(),
        'approved',
        'admin1',
        'Request approved',
      );

      expect(result).not.toBeNull();
      expect(result?.status).toEqual('approved');
      expect(result?.reviewedBy).toEqual('admin1');
      expect(result?.reviewedAt).toBeDefined();
      expect(result?.responseMessage).toEqual('Request approved');
      expect(AccessEscalationRequestModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAccessRequest._id.toString(),
        {
          status: 'approved',
          reviewedBy: 'admin1',
          reviewedAt: expect.any(Date),
          responseMessage: 'Request approved',
        },
        { new: true },
      );
    });

    it('should update request status to rejected', async () => {
      const updatedRequest = {
        ...mockAccessRequest,
        status: 'rejected' as const,
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        responseMessage: 'Insufficient experience',
      };

      jest
        .spyOn(AccessEscalationRequestModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedRequest as any);

      const result = await updateAccessEscalationRequestStatus(
        mockAccessRequest._id.toString(),
        'rejected',
        'admin1',
        'Insufficient experience',
      );

      expect(result).not.toBeNull();
      expect(result?.status).toEqual('rejected');
      expect(result?.responseMessage).toEqual('Insufficient experience');
    });

    it('should update without response message', async () => {
      const updatedRequest = {
        ...mockAccessRequest,
        status: 'approved' as const,
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
        responseMessage: '',
      };

      jest
        .spyOn(AccessEscalationRequestModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedRequest as any);

      const result = await updateAccessEscalationRequestStatus(
        mockAccessRequest._id.toString(),
        'approved',
        'admin1',
      );

      expect(result).not.toBeNull();
      expect(result?.responseMessage).toEqual('');
    });

    it('should return null if request is not found', async () => {
      jest
        .spyOn(AccessEscalationRequestModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(null as any);

      const result = await updateAccessEscalationRequestStatus(
        'nonexistentid',
        'approved',
        'admin1',
      );

      expect(result).toBeNull();
    });

    it('should throw an error if database operation fails', async () => {
      jest
        .spyOn(AccessEscalationRequestModel, 'findByIdAndUpdate')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        updateAccessEscalationRequestStatus(mockAccessRequest._id.toString(), 'approved', 'admin1'),
      ).rejects.toThrow('Error occurred when updating access request');
    });
  });
});
