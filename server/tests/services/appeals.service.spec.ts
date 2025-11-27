import { ObjectId } from 'mongodb';
import AppealModel from '../../models/appeals.model';
import QuestionModel from '../../models/questions.model';
import UserModel from '../../models/users.model';
import NotificationModel from '../../models/notifications.model';
import {
  submitAppeal,
  getAppeals,
  approveAppeal,
  rejectAppeal,
  checkExistingAppeal,
} from '../../services/moderation.service';
import { DatabaseQuestion } from '../../types/types';

describe('Appeals Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('checkExistingAppeal', () => {
    it('should return true if an appeal exists', async () => {
      const contentId = new ObjectId().toString();
      const appealUser = 'testuser';

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue({
        _id: new ObjectId(),
        contentId: new ObjectId(contentId),
        appealUser,
      } as any);

      const result = await checkExistingAppeal(contentId, appealUser);

      expect(result).toBe(true);
    });

    it('should return false if no appeal exists', async () => {
      const contentId = new ObjectId().toString();
      const appealUser = 'testuser';

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue(null);

      const result = await checkExistingAppeal(contentId, appealUser);

      expect(result).toBe(false);
    });
  });

  describe('submitAppeal', () => {
    const contentId = new ObjectId().toString();
    const contentType = 'question' as const;
    const appealUser = 'testuser';
    const validReason =
      'This is a valid appeal reason that contains at least three words and is between fifty and five hundred characters in length to meet the requirements.';

    it('should successfully submit an appeal', async () => {
      const mockQuestion: DatabaseQuestion = {
        _id: new ObjectId(contentId) as any,
        title: 'Test Question',
        text: 'Test content',
        tags: [],
        askedBy: appealUser,
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        community: null,
        deleted: {
          isDeleted: true,
          deletedBy: 'moderator',
          deleteReason: 'Violation',
          deletedAt: new Date(),
        },
      };

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(QuestionModel, 'findById').mockResolvedValue(mockQuestion as any);
      jest.spyOn(AppealModel, 'create').mockResolvedValue({
        _id: new ObjectId(),
        contentId: new ObjectId(contentId),
        contentType,
        appealUser,
        reason: validReason,
        status: 'pending',
        timestamp: new Date(),
      } as any);
      jest.spyOn(UserModel, 'find').mockResolvedValue([
        { username: 'moderator1', role: 'moderator' },
        { username: 'admin1', role: 'admin' },
      ] as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      const result = await submitAppeal(contentId, contentType, appealUser, validReason);

      expect(result.success).toBe(true);
      expect(AppealModel.create).toHaveBeenCalled();
    });

    it('should reject appeal with reason less than 50 characters', async () => {
      const shortReason = 'Too short';

      const result = await submitAppeal(contentId, contentType, appealUser, shortReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('50 and 500 characters');
    });

    it('should reject appeal with reason more than 500 characters', async () => {
      const longReason = 'a'.repeat(501);

      const result = await submitAppeal(contentId, contentType, appealUser, longReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('50 and 500 characters');
    });

    it('should reject appeal with less than 3 words', async () => {
      const twoWordReason = 'a'.repeat(25) + ' ' + 'b'.repeat(25); // 51 characters but only 2 words
      const mockQuestion: DatabaseQuestion = {
        _id: new ObjectId(contentId) as any,
        title: 'Test Question',
        text: 'Test content',
        tags: [],
        askedBy: appealUser,
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        community: null,
        deleted: {
          isDeleted: true,
          deletedBy: 'moderator',
          deleteReason: 'Violation',
          deletedAt: new Date(),
        },
      };

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(QuestionModel, 'findById').mockResolvedValue(mockQuestion as any);

      const result = await submitAppeal(contentId, contentType, appealUser, twoWordReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 3 words');
    });

    it('should reject appeal if user already appealed', async () => {
      jest.spyOn(AppealModel, 'findOne').mockResolvedValue({
        _id: new ObjectId(),
        contentId: new ObjectId(contentId),
        appealUser,
      } as any);

      const result = await submitAppeal(contentId, contentType, appealUser, validReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already submitted');
    });

    it('should reject appeal if content is not deleted', async () => {
      const mockQuestion: DatabaseQuestion = {
        _id: new ObjectId(contentId) as any,
        title: 'Test Question',
        text: 'Test content',
        tags: [],
        askedBy: appealUser,
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        community: null,
        deleted: {
          isDeleted: false,
        },
      };

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(QuestionModel, 'findById').mockResolvedValue(mockQuestion as any);

      const result = await submitAppeal(contentId, contentType, appealUser, validReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not deleted');
    });

    it('should reject appeal if user is not the author', async () => {
      const mockQuestion: DatabaseQuestion = {
        _id: new ObjectId(contentId) as any,
        title: 'Test Question',
        text: 'Test content',
        tags: [],
        askedBy: 'otheruser',
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        community: null,
        deleted: {
          isDeleted: true,
        },
      };

      jest.spyOn(AppealModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(QuestionModel, 'findById').mockResolvedValue(mockQuestion as any);

      const result = await submitAppeal(contentId, contentType, appealUser, validReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('only appeal your own');
    });
  });

  describe('getAppeals', () => {
    it('should return all pending appeals', async () => {
      const contentId = new ObjectId();
      const mockAppeals = [
        {
          _id: new ObjectId(),
          contentId: contentId,
          contentType: 'question',
          appealUser: 'user1',
          reason: 'Valid reason here',
          status: 'pending',
          timestamp: new Date(),
        },
      ];

      const mockQuestion: DatabaseQuestion = {
        _id: contentId as any,
        title: 'Test Question',
        text: 'Test content',
        tags: [],
        askedBy: 'user1',
        askDateTime: new Date(),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        community: null,
      };

      jest.spyOn(AppealModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAppeals),
      } as any);
      jest.spyOn(QuestionModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockQuestion),
      } as any);

      const result = await getAppeals();

      expect(result.appeals).toHaveLength(1);
      expect(result.appeals[0].status).toBe('pending');
    });

    it('should return empty array when no appeals exist', async () => {
      jest.spyOn(AppealModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await getAppeals();

      expect(result.appeals).toHaveLength(0);
    });
  });

  describe('approveAppeal', () => {
    const appealId = new ObjectId().toString();
    const moderatorUsername = 'moderator1';
    const contentId = new ObjectId().toString();

    it('should successfully approve an appeal and restore content', async () => {
      const mockAppeal = {
        _id: new ObjectId(appealId),
        contentId: new ObjectId(contentId),
        contentType: 'question' as const,
        appealUser: 'testuser',
        reason: 'Valid reason',
        status: 'pending' as const,
        timestamp: new Date(),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'moderator',
      } as any);
      jest.spyOn(AppealModel, 'findById').mockResolvedValue(mockAppeal as any);
      jest.spyOn(AppealModel, 'findByIdAndUpdate').mockResolvedValue({
        ...mockAppeal,
        status: 'approved',
      } as any);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValue({
        _id: new ObjectId(contentId),
        deleted: { isDeleted: false },
      } as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      const result = await approveAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(true);
      expect(QuestionModel.findByIdAndUpdate).toHaveBeenCalled();
      const updateCall = (QuestionModel.findByIdAndUpdate as jest.Mock).mock.calls[0];
      expect(updateCall[0].toString()).toBe(contentId);
      expect(updateCall[1]['deleted.isDeleted']).toBe(false);
      expect(updateCall[1]['deleted.restoredAt']).toBeInstanceOf(Date);
    });

    it('should reject approval if user is not moderator', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'user',
      } as any);

      const result = await approveAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should reject approval if appeal not found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'moderator',
      } as any);
      jest.spyOn(AppealModel, 'findById').mockResolvedValue(null);

      const result = await approveAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject approval if appeal already processed', async () => {
      const mockAppeal = {
        _id: new ObjectId(appealId),
        contentId: new ObjectId(contentId),
        contentType: 'question' as const,
        appealUser: 'testuser',
        reason: 'Valid reason',
        status: 'approved' as const,
        timestamp: new Date(),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'moderator',
      } as any);
      jest.spyOn(AppealModel, 'findById').mockResolvedValue(mockAppeal as any);

      const result = await approveAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been processed');
    });
  });

  describe('rejectAppeal', () => {
    const appealId = new ObjectId().toString();
    const moderatorUsername = 'moderator1';

    it('should successfully reject an appeal', async () => {
      const mockAppeal = {
        _id: new ObjectId(appealId),
        contentId: new ObjectId(),
        contentType: 'question' as const,
        appealUser: 'testuser',
        reason: 'Valid reason',
        status: 'pending' as const,
        timestamp: new Date(),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'moderator',
      } as any);
      jest.spyOn(AppealModel, 'findById').mockResolvedValue(mockAppeal as any);
      jest.spyOn(AppealModel, 'findByIdAndUpdate').mockResolvedValue({
        ...mockAppeal,
        status: 'rejected',
      } as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValue({} as any);

      const result = await rejectAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(true);
      expect(AppealModel.findByIdAndUpdate).toHaveBeenCalledWith(
        appealId,
        expect.objectContaining({
          status: 'rejected',
          modResponse: expect.any(String),
          processedBy: moderatorUsername,
          processedAt: expect.any(Date),
        }),
      );
    });

    it('should reject if user is not moderator', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        username: moderatorUsername,
        role: 'user',
      } as any);

      const result = await rejectAppeal(appealId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });
  });
});
