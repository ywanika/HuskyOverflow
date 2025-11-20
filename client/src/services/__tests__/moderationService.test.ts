import {
  getFlaggedContent,
  markAsReviewed,
  dismissFlag,
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  flagQuestion,
  flagAnswer,
  flagComment,
} from '../moderationService';
import api from '../config';

jest.mock('../config');

describe('moderationService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFlaggedContent', () => {
    it('should fetch flagged content successfully', async () => {
      const mockFlaggedContent = {
        questions: [
          {
            _id: 'q1',
            contentType: 'question' as const,
            content: { _id: 'q1', title: 'Test Question', text: 'Question text' },
            flaggedBy: ['user1', 'user2'],
            flaggedAt: [new Date('2024-01-01'), new Date('2024-01-02')],
          },
        ],
        answers: [
          {
            _id: 'a1',
            contentType: 'answer' as const,
            content: { _id: 'a1', text: 'Answer text' },
            flaggedBy: ['user3'],
            flaggedAt: [new Date('2024-01-03')],
          },
        ],
        comments: [
          {
            _id: 'c1',
            contentType: 'comment' as const,
            content: { _id: 'c1', text: 'Comment text' },
            flaggedBy: ['user4'],
            flaggedAt: [new Date('2024-01-04')],
          },
        ],
      };

      mockApi.get.mockResolvedValueOnce({ status: 200, data: mockFlaggedContent });

      const result = await getFlaggedContent();

      expect(result).toEqual(mockFlaggedContent);
      expect(mockApi.get).toHaveBeenCalledWith('/api/moderation/flagged');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.get.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(getFlaggedContent()).rejects.toThrow('Error while fetching flagged content');
      expect(mockApi.get).toHaveBeenCalledWith('/api/moderation/flagged');
    });

    it('should handle empty flagged content', async () => {
      const mockEmptyContent = {
        questions: [],
        answers: [],
        comments: [],
      };

      mockApi.get.mockResolvedValueOnce({ status: 200, data: mockEmptyContent });

      const result = await getFlaggedContent();

      expect(result).toEqual(mockEmptyContent);
      expect(result.questions).toHaveLength(0);
      expect(result.answers).toHaveLength(0);
      expect(result.comments).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getFlaggedContent()).rejects.toThrow('Network error');
    });
  });

  describe('markAsReviewed', () => {
    it('should mark question as reviewed successfully', async () => {
      const mockResponse = { success: true, message: 'Question marked as reviewed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await markAsReviewed('question', 'q1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/review', {
        contentType: 'question',
        contentId: 'q1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should mark answer as reviewed successfully', async () => {
      const mockResponse = { success: true, message: 'Answer marked as reviewed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await markAsReviewed('answer', 'a1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/review', {
        contentType: 'answer',
        contentId: 'a1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should mark comment as reviewed successfully', async () => {
      const mockResponse = { success: true, message: 'Comment marked as reviewed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await markAsReviewed('comment', 'c1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/review', {
        contentType: 'comment',
        contentId: 'c1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(markAsReviewed('question', 'q1', 'moderator1')).rejects.toThrow(
        'Error while marking content as reviewed',
      );
    });

    it('should handle API errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(markAsReviewed('question', 'q1', 'moderator1')).rejects.toThrow('Network error');
    });
  });

  describe('dismissFlag', () => {
    it('should dismiss flag for question successfully', async () => {
      const mockResponse = { success: true, message: 'Flag dismissed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await dismissFlag('question', 'q1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/dismiss', {
        contentType: 'question',
        contentId: 'q1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should dismiss flag for answer successfully', async () => {
      const mockResponse = { success: true, message: 'Flag dismissed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await dismissFlag('answer', 'a1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/dismiss', {
        contentType: 'answer',
        contentId: 'a1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should dismiss flag for comment successfully', async () => {
      const mockResponse = { success: true, message: 'Flag dismissed' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await dismissFlag('comment', 'c1', 'moderator1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/dismiss', {
        contentType: 'comment',
        contentId: 'c1',
        moderatorUsername: 'moderator1',
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(dismissFlag('question', 'q1', 'moderator1')).rejects.toThrow(
        'Error while dismissing flag',
      );
    });

    it('should handle API errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(dismissFlag('question', 'q1', 'moderator1')).rejects.toThrow('Network error');
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question successfully', async () => {
      const mockResponse = { success: true, message: 'Question deleted' };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await deleteQuestion('q1', 'moderator1', 'Inappropriate content');

      expect(result).toEqual(mockResponse);
      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/question/q1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason: 'Inappropriate content',
        },
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.delete.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(deleteQuestion('q1', 'moderator1', 'Reason')).rejects.toThrow(
        'Error while deleting question',
      );
    });

    it('should handle API errors', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteQuestion('q1', 'moderator1', 'Reason')).rejects.toThrow('Network error');
    });

    it('should send delete reason in request body', async () => {
      const mockResponse = { success: true };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const deleteReason = 'Contains profanity and hate speech';
      await deleteQuestion('q1', 'moderator1', deleteReason);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/question/q1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason,
        },
      });
    });
  });

  describe('deleteAnswer', () => {
    it('should delete answer successfully', async () => {
      const mockResponse = { success: true, message: 'Answer deleted' };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await deleteAnswer('a1', 'moderator1', 'Spam content');

      expect(result).toEqual(mockResponse);
      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/answer/a1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason: 'Spam content',
        },
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.delete.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(deleteAnswer('a1', 'moderator1', 'Reason')).rejects.toThrow(
        'Error while deleting answer',
      );
    });

    it('should handle API errors', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteAnswer('a1', 'moderator1', 'Reason')).rejects.toThrow('Network error');
    });

    it('should send delete reason in request body', async () => {
      const mockResponse = { success: true };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const deleteReason = 'Off-topic answer';
      await deleteAnswer('a1', 'moderator1', deleteReason);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/answer/a1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason,
        },
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      const mockResponse = { success: true, message: 'Comment deleted' };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await deleteComment('c1', 'moderator1', 'Harassment');

      expect(result).toEqual(mockResponse);
      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/comment/c1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason: 'Harassment',
        },
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.delete.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(deleteComment('c1', 'moderator1', 'Reason')).rejects.toThrow(
        'Error while deleting comment',
      );
    });

    it('should handle API errors', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteComment('c1', 'moderator1', 'Reason')).rejects.toThrow('Network error');
    });

    it('should send delete reason in request body', async () => {
      const mockResponse = { success: true };
      mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const deleteReason = 'Personal attack';
      await deleteComment('c1', 'moderator1', deleteReason);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/moderation/delete/comment/c1', {
        data: {
          moderatorUsername: 'moderator1',
          deleteReason,
        },
      });
    });
  });

  describe('flagQuestion', () => {
    it('should flag question successfully', async () => {
      const mockResponse = { success: true, message: 'Question flagged' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await flagQuestion('q1', 'user1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/question/q1', {
        username: 'user1',
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(flagQuestion('q1', 'user1')).rejects.toThrow('Error while flagging question');
    });

    it('should handle API errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(flagQuestion('q1', 'user1')).rejects.toThrow('Network error');
    });
  });

  describe('flagAnswer', () => {
    it('should flag answer successfully', async () => {
      const mockResponse = { success: true, message: 'Answer flagged' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await flagAnswer('a1', 'user1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/answer/a1', {
        username: 'user1',
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(flagAnswer('a1', 'user1')).rejects.toThrow('Error while flagging answer');
    });

    it('should handle API errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(flagAnswer('a1', 'user1')).rejects.toThrow('Network error');
    });
  });

  describe('flagComment', () => {
    it('should flag comment successfully', async () => {
      const mockResponse = { success: true, message: 'Comment flagged' };
      mockApi.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const result = await flagComment('c1', 'user1');

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/comment/c1', {
        username: 'user1',
      });
    });

    it('should throw error when API response status is not 200', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

      await expect(flagComment('c1', 'user1')).rejects.toThrow('Error while flagging comment');
    });

    it('should handle API errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(flagComment('c1', 'user1')).rejects.toThrow('Network error');
    });
  });
});
