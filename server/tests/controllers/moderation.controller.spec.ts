import supertest from 'supertest';
import { app } from '../../app';
import * as moderationService from '../../services/moderation.service';
import {
  ModerationResponse,
  FlaggedContentResponse,
  DeletedContentResponse,
} from '../../services/moderation.service';

const deleteQuestionSpy = jest.spyOn(moderationService, 'deleteQuestion');
const deleteAnswerSpy = jest.spyOn(moderationService, 'deleteAnswer');
const deleteCommentSpy = jest.spyOn(moderationService, 'deleteComment');
const flagQuestionSpy = jest.spyOn(moderationService, 'flagQuestion');
const flagAnswerSpy = jest.spyOn(moderationService, 'flagAnswer');
const flagCommentSpy = jest.spyOn(moderationService, 'flagComment');
const getFlaggedContentSpy = jest.spyOn(moderationService, 'getFlaggedContent');
const markAsReviewedSpy = jest.spyOn(moderationService, 'markAsReviewed');
const dismissFlagSpy = jest.spyOn(moderationService, 'dismissFlag');
const getDeletedContentByModeratorSpy = jest.spyOn(
  moderationService,
  'getDeletedContentByModerator',
);
const restoreDeletedContentSpy = jest.spyOn(moderationService, 'restoreDeletedContent');

describe('Moderation Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('DELETE /api/moderation/delete/question/:questionId', () => {
    const questionId = '507f191e810c19729de860ea';
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete a question', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Question deleted successfully',
      };

      deleteQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/question/${questionId}`)
        .send({
          moderatorUsername,
          deleteReason,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(deleteQuestionSpy).toHaveBeenCalledWith(questionId, moderatorUsername, deleteReason);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .delete(`/api/moderation/delete/question/${questionId}`)
        .send({
          moderatorUsername,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 403 if user is not authorized', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Unauthorized: Only moderators and admins can delete content',
      };

      deleteQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/question/${questionId}`)
        .send({
          moderatorUsername: 'user1',
          deleteReason,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return 404 if question not found', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Question not found',
      };

      deleteQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/question/${questionId}`)
        .send({
          moderatorUsername,
          deleteReason,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Question not found');
    });

    it('should return 500 on service error', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Database error',
      };

      deleteQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/question/${questionId}`)
        .send({
          moderatorUsername,
          deleteReason,
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /api/moderation/delete/answer/:answerId', () => {
    const answerId = '507f191e810c19729de860eb';
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete an answer', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Answer deleted successfully',
      };

      deleteAnswerSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/answer/${answerId}`)
        .send({
          moderatorUsername,
          deleteReason,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(deleteAnswerSpy).toHaveBeenCalledWith(answerId, moderatorUsername, deleteReason);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .delete(`/api/moderation/delete/answer/${answerId}`)
        .send({
          moderatorUsername,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/moderation/delete/comment/:commentId', () => {
    const commentId = '507f191e810c19729de860ec';
    const moderatorUsername = 'moderator1';
    const deleteReason = 'Inappropriate content';

    it('should successfully delete a comment', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Comment deleted successfully',
      };

      deleteCommentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .delete(`/api/moderation/delete/comment/${commentId}`)
        .send({
          moderatorUsername,
          deleteReason,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(deleteCommentSpy).toHaveBeenCalledWith(commentId, moderatorUsername, deleteReason);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .delete(`/api/moderation/delete/comment/${commentId}`)
        .send({
          moderatorUsername,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/moderation/flag/question/:questionId', () => {
    const questionId = '507f191e810c19729de860ea';
    const username = 'user1';

    it('should successfully flag a question', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Question flagged successfully',
      };

      flagQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .post(`/api/moderation/flag/question/${questionId}`)
        .send({
          username,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(flagQuestionSpy).toHaveBeenCalledWith(questionId, username);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .post(`/api/moderation/flag/question/${questionId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 if user already flagged', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'You have already flagged this question',
      };

      flagQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .post(`/api/moderation/flag/question/${questionId}`)
        .send({
          username,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('You have already flagged this question');
    });

    it('should return 404 if question not found', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Question not found',
      };

      flagQuestionSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .post(`/api/moderation/flag/question/${questionId}`)
        .send({
          username,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Question not found');
    });
  });

  describe('POST /api/moderation/flag/answer/:answerId', () => {
    const answerId = '507f191e810c19729de860eb';
    const username = 'user1';

    it('should successfully flag an answer', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Answer flagged successfully',
      };

      flagAnswerSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post(`/api/moderation/flag/answer/${answerId}`).send({
        username,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(flagAnswerSpy).toHaveBeenCalledWith(answerId, username);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .post(`/api/moderation/flag/answer/${answerId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/moderation/flag/comment/:commentId', () => {
    const commentId = '507f191e810c19729de860ec';
    const username = 'user1';

    it('should successfully flag a comment', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Comment flagged successfully',
      };

      flagCommentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post(`/api/moderation/flag/comment/${commentId}`).send({
        username,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(flagCommentSpy).toHaveBeenCalledWith(commentId, username);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .post(`/api/moderation/flag/comment/${commentId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/moderation/flagged', () => {
    it('should return all flagged content', async () => {
      const mockResponse: FlaggedContentResponse = {
        questions: [],
        answers: [],
        comments: [],
        messages: [],
      };

      getFlaggedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).get('/api/moderation/flagged');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(getFlaggedContentSpy).toHaveBeenCalled();
    });

    it('should return 500 on service error', async () => {
      const mockResponse: FlaggedContentResponse = {
        questions: [],
        answers: [],
        comments: [],
        messages: [],
        error: 'Error fetching flagged content: Database error',
      };

      getFlaggedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).get('/api/moderation/flagged');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Error fetching flagged content');
    });
  });

  describe('POST /api/moderation/review', () => {
    const contentType = 'question';
    const contentId = '507f191e810c19729de860ea';
    const moderatorUsername = 'moderator1';

    it('should successfully mark content as reviewed', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Content marked as reviewed',
      };

      markAsReviewedSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/review').send({
        contentType,
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(markAsReviewedSpy).toHaveBeenCalledWith(contentType, contentId, moderatorUsername);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app).post('/api/moderation/review').send({
        contentType,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 403 if user is not authorized', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Unauthorized: Only moderators and admins can review content',
      };

      markAsReviewedSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/review').send({
        contentType,
        contentId,
        moderatorUsername: 'user1',
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('POST /api/moderation/dismiss', () => {
    const contentType = 'question';
    const contentId = '507f191e810c19729de860ea';
    const moderatorUsername = 'moderator1';

    it('should successfully dismiss a flag', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Flag dismissed successfully',
      };

      dismissFlagSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/dismiss').send({
        contentType,
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(dismissFlagSpy).toHaveBeenCalledWith(contentType, contentId, moderatorUsername);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app).post('/api/moderation/dismiss').send({
        contentType,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request Validation Failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 403 if user is not authorized', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Unauthorized: Only moderators and admins can dismiss flags',
      };

      dismissFlagSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/dismiss').send({
        contentType,
        contentId,
        moderatorUsername: 'user1',
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('GET /api/moderation/deleted', () => {
    const moderatorUsername = 'moderator1';

    it('should successfully get deleted content by moderator', async () => {
      const mockResponse: DeletedContentResponse = {
        items: [
          {
            _id: '507f191e810c19729de860ea',
            contentType: 'question',
            content: {} as any,
            deletedBy: moderatorUsername,
            deleteReason: 'Spam content',
            deletedAt: new Date('2025-01-15T10:00:00Z'),
            authorUsername: 'user1',
            contentPreview: 'How to fix this bug in my code?',
          },
          {
            _id: '507f191e810c19729de860eb',
            contentType: 'answer',
            content: {} as any,
            deletedBy: moderatorUsername,
            deleteReason: 'Inappropriate language',
            deletedAt: new Date('2025-01-14T15:30:00Z'),
            authorUsername: 'user2',
            contentPreview: 'You can fix it by...',
          },
        ],
      };

      getDeletedContentByModeratorSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .get('/api/moderation/deleted')
        .query({ moderatorUsername });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].contentType).toBe('question');
      expect(response.body.items[1].contentType).toBe('answer');
      expect(getDeletedContentByModeratorSpy).toHaveBeenCalledWith(moderatorUsername);
    });

    it('should return 400 if moderatorUsername is missing', async () => {
      const response = await supertest(app).get('/api/moderation/deleted');

      expect(response.status).toBe(400);
      // OpenAPI validator handles this - just check status
    });

    it('should return 403 if user is not authorized', async () => {
      const mockResponse: DeletedContentResponse = {
        items: [],
        error: 'Unauthorized: Only moderators and admins can view deleted content',
      };

      getDeletedContentByModeratorSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .get('/api/moderation/deleted')
        .query({ moderatorUsername: 'user1' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return 500 on service error', async () => {
      const mockResponse: DeletedContentResponse = {
        items: [],
        error: 'Database error',
      };

      getDeletedContentByModeratorSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app)
        .get('/api/moderation/deleted')
        .query({ moderatorUsername });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/moderation/restore', () => {
    const contentType = 'question';
    const contentId = '507f191e810c19729de860ea';
    const moderatorUsername = 'moderator1';

    it('should successfully restore deleted content', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Content restored successfully',
        recipientUsername: 'user1',
      };

      restoreDeletedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType,
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
      expect(restoreDeletedContentSpy).toHaveBeenCalledWith(
        contentType,
        contentId,
        moderatorUsername,
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType,
      });

      expect(response.status).toBe(400);
      // OpenAPI validator handles this - just check status
    });

    it('should return 403 if user is not authorized', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Unauthorized: Only moderators and admins can restore content',
      };

      restoreDeletedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType,
        contentId,
        moderatorUsername: 'user1',
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should return 404 if content not found', async () => {
      const mockResponse: ModerationResponse = {
        success: false,
        error: 'Question not found',
      };

      restoreDeletedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType,
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Question not found');
    });

    it('should successfully restore answer', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Content restored successfully',
      };

      restoreDeletedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType: 'answer',
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
    });

    it('should successfully restore comment', async () => {
      const mockResponse: ModerationResponse = {
        success: true,
        message: 'Content restored successfully',
      };

      restoreDeletedContentSpy.mockResolvedValueOnce(mockResponse);

      const response = await supertest(app).post('/api/moderation/restore').send({
        contentType: 'comment',
        contentId,
        moderatorUsername,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, message: mockResponse.message });
    });
  });
});
