import { ObjectId } from 'mongodb';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import CommentModel from '../../models/comments.model';
import UserModel from '../../models/users.model';
import NotificationModel from '../../models/notifications.model';
import {
  isModerator,
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  flagQuestion,
  flagAnswer,
  flagComment,
  getFlaggedContent,
  markAsReviewed,
  dismissFlag,
} from '../../services/moderation.service';
import { DatabaseUser, DatabaseQuestion, DatabaseAnswer, DatabaseComment } from '../../types/types';
import { QUESTIONS, ans1, com1 } from '../mockData.models';

describe('Moderation Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('isModerator', () => {
    it('should return true for moderator user', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'moderator1',
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);

      const result = await isModerator('moderator1');

      expect(result).toBe(true);
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'moderator1' });
    });

    it('should return true for admin user', async () => {
      const adminUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'admin1',
        password: 'password',
        dateJoined: new Date(),
        role: 'admin',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(adminUser);

      const result = await isModerator('admin1');

      expect(result).toBe(true);
    });

    it('should return false for regular user', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await isModerator('user1');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await isModerator('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await isModerator('user1');

      expect(result).toBe(false);
    });
  });

  describe('deleteQuestion', () => {
    const questionId = QUESTIONS[0]._id.toString();
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete a question', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      const question: DatabaseQuestion = {
        ...QUESTIONS[0],
        askedBy: 'author1',
      };

      const updatedQuestion: DatabaseQuestion = {
        ...question,
        deleted: {
          isDeleted: true,
          deletedBy: moderatorUsername,
          deleteReason,
          deletedAt: new Date(),
        },
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedQuestion);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await deleteQuestion(questionId, moderatorUsername, deleteReason);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Question deleted successfully');
      expect(QuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        questionId,
        expect.objectContaining({
          'deleted.isDeleted': true,
          'deleted.deletedBy': moderatorUsername,
          'deleted.deleteReason': deleteReason,
        }),
        { new: true },
      );
    });

    it('should return error if user is not moderator', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await deleteQuestion(questionId, 'user1', deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(QuestionModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return error if question not found', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await deleteQuestion(questionId, moderatorUsername, deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
    });

    it('should handle errors gracefully', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB error'));

      const result = await deleteQuestion(questionId, moderatorUsername, deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Error deleting question');
    });
  });

  describe('deleteAnswer', () => {
    const answerId = ans1._id.toString();
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete an answer', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      const answer: DatabaseAnswer = {
        ...ans1,
        ansBy: 'author1',
      };

      const updatedAnswer: DatabaseAnswer = {
        ...answer,
        deleted: {
          isDeleted: true,
          deletedBy: moderatorUsername,
          deleteReason,
          deletedAt: new Date(),
        },
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(AnswerModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedAnswer);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await deleteAnswer(answerId, moderatorUsername, deleteReason);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Answer deleted successfully');
    });

    it('should return error if user is not moderator', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await deleteAnswer(answerId, 'user1', deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return error if answer not found', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(AnswerModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await deleteAnswer(answerId, moderatorUsername, deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Answer not found');
    });
  });

  describe('deleteComment', () => {
    const commentId = com1._id.toString();
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete a comment', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      const comment: DatabaseComment = {
        ...com1,
        commentBy: 'author1',
      };

      const updatedComment: DatabaseComment = {
        ...comment,
        deleted: {
          isDeleted: true,
          deletedBy: moderatorUsername,
          deleteReason,
          deletedAt: new Date(),
        },
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedComment);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await deleteComment(commentId, moderatorUsername, deleteReason);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Comment deleted successfully');
    });

    it('should return error if user is not moderator', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await deleteComment(commentId, 'user1', deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return error if comment not found', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await deleteComment(commentId, moderatorUsername, deleteReason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Comment not found');
    });
  });

  describe('flagQuestion', () => {
    const questionId = QUESTIONS[0]._id.toString();
    const username = 'user1';

    it('should successfully flag a question', async () => {
      const question: DatabaseQuestion = {
        ...QUESTIONS[0],
        flagged: {
          isFlagged: false,
          flaggedBy: [],
          flaggedAt: [],
        },
      };

      const updatedQuestion: DatabaseQuestion = {
        ...question,
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(question);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedQuestion);
      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await flagQuestion(questionId, username);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Question flagged successfully');
      expect(QuestionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        questionId,
        expect.objectContaining({
          'flagged.isFlagged': true,
        }),
        { new: true },
      );
    });

    it('should return error if question not found', async () => {
      jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(null);

      const result = await flagQuestion(questionId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
    });

    it('should return error if user already flagged', async () => {
      const question: DatabaseQuestion = {
        ...QUESTIONS[0],
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(QuestionModel, 'findById').mockResolvedValueOnce(question);

      const result = await flagQuestion(questionId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already flagged this question');
      expect(QuestionModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(QuestionModel, 'findById').mockRejectedValueOnce(new Error('DB error'));

      const result = await flagQuestion(questionId, username);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Error flagging question');
    });
  });

  describe('flagAnswer', () => {
    const answerId = ans1._id.toString();
    const username = 'user1';

    it('should successfully flag an answer', async () => {
      const answer: DatabaseAnswer = {
        ...ans1,
        flagged: {
          isFlagged: false,
          flaggedBy: [],
          flaggedAt: [],
        },
      };

      const updatedAnswer: DatabaseAnswer = {
        ...answer,
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce(answer);
      jest.spyOn(AnswerModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedAnswer);
      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await flagAnswer(answerId, username);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Answer flagged successfully');
    });

    it('should return error if answer not found', async () => {
      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce(null);

      const result = await flagAnswer(answerId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Answer not found');
    });

    it('should return error if user already flagged', async () => {
      const answer: DatabaseAnswer = {
        ...ans1,
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(AnswerModel, 'findById').mockResolvedValueOnce(answer);

      const result = await flagAnswer(answerId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already flagged this answer');
    });
  });

  describe('flagComment', () => {
    const commentId = com1._id.toString();
    const username = 'user1';

    it('should successfully flag a comment', async () => {
      const comment: DatabaseComment = {
        ...com1,
        flagged: {
          isFlagged: false,
          flaggedBy: [],
          flaggedAt: [],
        },
      };

      const updatedComment: DatabaseComment = {
        ...comment,
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce(comment);
      jest.spyOn(CommentModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedComment);
      jest.spyOn(UserModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);
      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = await flagComment(commentId, username);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Comment flagged successfully');
    });

    it('should return error if comment not found', async () => {
      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce(null);

      const result = await flagComment(commentId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Comment not found');
    });

    it('should return error if user already flagged', async () => {
      const comment: DatabaseComment = {
        ...com1,
        flagged: {
          isFlagged: true,
          flaggedBy: [username],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(CommentModel, 'findById').mockResolvedValueOnce(comment);

      const result = await flagComment(commentId, username);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already flagged this comment');
    });
  });

  describe('getFlaggedContent', () => {
    it('should return all flagged content', async () => {
      const flaggedQuestion: DatabaseQuestion = {
        ...QUESTIONS[0],
        flagged: {
          isFlagged: true,
          flaggedBy: ['user1'],
          flaggedAt: [new Date()],
        },
      };

      const flaggedAnswer: DatabaseAnswer = {
        ...ans1,
        flagged: {
          isFlagged: true,
          flaggedBy: ['user2'],
          flaggedAt: [new Date()],
        },
      };

      jest.spyOn(QuestionModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([flaggedQuestion]),
      } as any);

      jest.spyOn(AnswerModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([flaggedAnswer]),
      } as any);

      jest.spyOn(CommentModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await getFlaggedContent();

      expect(result.questions).toHaveLength(1);
      expect(result.answers).toHaveLength(1);
      expect(result.comments).toHaveLength(0);
    });

    it('should return empty arrays if no flagged content', async () => {
      jest.spyOn(QuestionModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);

      jest.spyOn(AnswerModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);

      jest.spyOn(CommentModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await getFlaggedContent();

      expect(result.questions).toHaveLength(0);
      expect(result.answers).toHaveLength(0);
      expect(result.comments).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(QuestionModel, 'find').mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      } as any);

      const result = await getFlaggedContent();

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Error fetching flagged content');
    });
  });

  describe('markAsReviewed', () => {
    const questionId = QUESTIONS[0]._id.toString();
    const moderatorUsername = 'moderator1';

    it('should successfully mark question as reviewed', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      const question: DatabaseQuestion = {
        ...QUESTIONS[0],
        flagged: {
          isFlagged: true,
          flaggedBy: ['user1'],
          flaggedAt: [new Date()],
        },
      };

      const updatedQuestion: DatabaseQuestion = {
        ...question,
        flagged: {
          ...question.flagged!,
          reviewedBy: moderatorUsername,
          reviewedAt: new Date(),
        },
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedQuestion);

      const result = await markAsReviewed('question', questionId, moderatorUsername);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Content marked as reviewed');
    });

    it('should return error if user is not moderator', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await markAsReviewed('question', questionId, 'user1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return error if content not found', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await markAsReviewed('question', questionId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content not found');
    });
  });

  describe('dismissFlag', () => {
    const questionId = QUESTIONS[0]._id.toString();
    const moderatorUsername = 'moderator1';

    it('should successfully dismiss a flag', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      const question: DatabaseQuestion = {
        ...QUESTIONS[0],
        flagged: {
          isFlagged: true,
          flaggedBy: ['user1'],
          flaggedAt: [new Date()],
        },
      };

      const updatedQuestion: DatabaseQuestion = {
        ...question,
        flagged: {
          isFlagged: false,
          flaggedBy: [],
          flaggedAt: [],
          reviewedBy: moderatorUsername,
          reviewedAt: new Date(),
        },
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedQuestion);

      const result = await dismissFlag('question', questionId, moderatorUsername);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Flag dismissed successfully');
    });

    it('should return error if user is not moderator', async () => {
      const regularUser: DatabaseUser = {
        _id: new ObjectId(),
        username: 'user1',
        password: 'password',
        dateJoined: new Date(),
        role: 'user',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser);

      const result = await dismissFlag('question', questionId, 'user1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return error if content not found', async () => {
      const moderatorUser: DatabaseUser = {
        _id: new ObjectId(),
        username: moderatorUsername,
        password: 'password',
        dateJoined: new Date(),
        role: 'moderator',
        agreedToGuidelines: true,
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser);
      jest.spyOn(QuestionModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await dismissFlag('question', questionId, moderatorUsername);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Content not found');
    });
  });
});
