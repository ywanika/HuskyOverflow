import UserModel from '../../models/users.model';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import CommentModel from '../../models/comments.model';
import TagModel from '../../models/tags.model';
import CommunityModel from '../../models/community.model';
import CollectionModel from '../../models/collection.model';
import MessageModel from '../../models/messages.model';
import { isAdmin, getDashboardMetrics } from '../../services/admin.service';
import { DatabaseUser } from '../../types/types';
import { ObjectId } from 'mongodb';

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin', () => {
    it('should return true if user is admin', async () => {
      const adminUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'adminuser',
        password: 'hashedPassword',
        dateJoined: new Date(),
        role: 'admin',
        biography: '',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(adminUser);

      const result = await isAdmin('adminuser');

      expect(result).toBe(true);
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'adminuser' });
    });

    it('should return false if user is not admin', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'regularuser',
        password: 'hashedPassword',
        dateJoined: new Date(),
        role: 'user',
        biography: '',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await isAdmin('regularuser');

      expect(result).toBe(false);
    });

    it('should return false if user is moderator', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'moderatoruser',
        password: 'hashedPassword',
        dateJoined: new Date(),
        role: 'moderator',
        biography: '',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);

      const result = await isAdmin('moderatoruser');

      expect(result).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await isAdmin('nonexistentuser');

      expect(result).toBe(false);
    });

    it('should return false if database query fails', async () => {
      jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await isAdmin('adminuser');

      expect(result).toBe(false);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return comprehensive dashboard metrics', async () => {
      // Mock user counts
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValueOnce(100); // totalUsers
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValueOnce(10); // newUsersThisWeek
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValueOnce(30); // newUsersThisMonth
      jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce([
        { _id: 'user', count: 80 },
        { _id: 'moderator', count: 15 },
        { _id: 'admin', count: 5 },
      ]);
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValueOnce(50); // activeUsers
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValueOnce(2); // suspendedUsers

      // Mock question counts
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(200); // totalQuestions
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(150); // questionsWithAnswers
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(5); // flaggedQuestions
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(3); // deletedQuestions
      jest.spyOn(QuestionModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce([
          {
            views: ['user1', 'user2'],
            upVotes: ['user1'],
            downVotes: [],
            answers: ['ans1', 'ans2'],
          },
          { views: ['user3'], upVotes: [], downVotes: ['user1'], answers: ['ans3'] },
        ]),
      } as any);

      // Mock answer counts
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(300); // totalAnswers
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(10); // flaggedAnswers
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(5); // deletedAnswers
      jest.spyOn(AnswerModel, 'find').mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValueOnce([{ comments: ['com1', 'com2'] }, { comments: ['com3'] }]),
      } as any);

      // Mock comment counts
      jest.spyOn(CommentModel, 'countDocuments').mockResolvedValueOnce(500); // totalComments
      jest.spyOn(CommentModel, 'countDocuments').mockResolvedValueOnce(8); // flaggedComments
      jest.spyOn(CommentModel, 'countDocuments').mockResolvedValueOnce(4); // deletedComments
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(2); // reviewedQuestions
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(3); // reviewedAnswers
      jest.spyOn(CommentModel, 'countDocuments').mockResolvedValueOnce(1); // reviewedComments

      // Mock tag counts
      jest.spyOn(TagModel, 'countDocuments').mockResolvedValueOnce(50); // totalTags
      jest.spyOn(QuestionModel, 'aggregate').mockResolvedValueOnce([
        { _id: new ObjectId(), count: 20 },
        { _id: new ObjectId(), count: 15 },
      ]);
      jest.spyOn(TagModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce([
          { _id: new ObjectId(), name: 'javascript' },
          { _id: new ObjectId(), name: 'react' },
        ]),
      } as any);

      // Mock community counts
      jest.spyOn(CommunityModel, 'countDocuments').mockResolvedValueOnce(25); // totalCommunities
      jest.spyOn(CommunityModel, 'countDocuments').mockResolvedValueOnce(20); // publicCommunities

      // Mock collection counts
      jest.spyOn(CollectionModel, 'countDocuments').mockResolvedValueOnce(40); // totalCollections

      // Mock message counts
      jest.spyOn(MessageModel, 'countDocuments').mockResolvedValueOnce(1000); // totalMessages

      // Mock growth metrics
      jest.spyOn(QuestionModel, 'aggregate').mockResolvedValueOnce([
        { _id: { year: 2024, week: 1 }, count: 10 },
        { _id: { year: 2024, week: 2 }, count: 15 },
      ]);
      jest.spyOn(UserModel, 'aggregate').mockResolvedValueOnce([
        { _id: { year: 2024, week: 1 }, count: 5 },
        { _id: { year: 2024, week: 2 }, count: 8 },
      ]);

      const metrics = await getDashboardMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.users.total).toBe(100);
      expect(metrics.users.newThisWeek).toBe(10);
      expect(metrics.users.newThisMonth).toBe(30);
      expect(metrics.users.byRole.user).toBe(80);
      expect(metrics.users.byRole.moderator).toBe(15);
      expect(metrics.users.byRole.admin).toBe(5);
      expect(metrics.users.active).toBe(50);
      expect(metrics.users.suspended).toBe(2);

      expect(metrics.content.questions.total).toBe(200);
      expect(metrics.content.questions.withAnswers).toBe(150);
      expect(metrics.content.questions.unanswered).toBe(50);
      expect(metrics.content.questions.flagged).toBe(5);
      expect(metrics.content.questions.deleted).toBe(3);

      expect(metrics.content.answers.total).toBe(300);
      expect(metrics.content.answers.flagged).toBe(10);
      expect(metrics.content.answers.deleted).toBe(5);

      expect(metrics.content.comments.total).toBe(500);
      expect(metrics.content.comments.flagged).toBe(8);
      expect(metrics.content.comments.deleted).toBe(4);

      expect(metrics.engagement.totalViews).toBe(3);
      expect(metrics.engagement.totalUpvotes).toBe(1);
      expect(metrics.engagement.totalDownvotes).toBe(1);

      expect(metrics.moderation.totalFlagged).toBe(23);
      expect(metrics.moderation.totalReviewed).toBe(6);
      expect(metrics.moderation.totalDeleted).toBe(12);
      expect(metrics.moderation.pendingReview).toBe(17);

      expect(metrics.tags.total).toBe(50);
      expect(metrics.communities.total).toBe(25);
      expect(metrics.communities.public).toBe(20);
      expect(metrics.communities.private).toBe(5);
      expect(metrics.collections.total).toBe(40);
      expect(metrics.messages.total).toBe(1000);
    });

    it('should handle empty database gracefully', async () => {
      jest.spyOn(UserModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(CommentModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(TagModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(CommunityModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(CollectionModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(MessageModel, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(UserModel, 'aggregate').mockResolvedValue([]);
      jest.spyOn(QuestionModel, 'aggregate').mockResolvedValue([]);
      jest.spyOn(QuestionModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);
      jest.spyOn(AnswerModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);
      jest.spyOn(TagModel, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      } as any);

      const metrics = await getDashboardMetrics();

      expect(metrics.users.total).toBe(0);
      expect(metrics.content.questions.total).toBe(0);
      expect(metrics.engagement.totalViews).toBe(0);
    });

    it('should throw error if database query fails', async () => {
      jest.spyOn(UserModel, 'countDocuments').mockRejectedValueOnce(new Error('Database error'));

      await expect(getDashboardMetrics()).rejects.toThrow('Error fetching dashboard metrics');
    });
  });
});
