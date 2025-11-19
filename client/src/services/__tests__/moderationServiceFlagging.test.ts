import { describe, it, expect, beforeEach } from '@jest/globals';
import { flagQuestion, flagAnswer, flagComment } from '../moderationService';
import api from '../config';

jest.mock('../config');

describe('moderationService - COS 4.8: Flagging Content', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('flagQuestion', () => {
    it('should flag a question successfully (COS 4.8)', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Question flagged successfully' },
      });

      const result = await flagQuestion('question1', 'user1');

      expect(result.success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/question', {
        questionId: 'question1',
        username: 'user1',
      });
    });

    it('should throw error when flagging fails', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'Question not found' },
      });

      await expect(flagQuestion('invalid', 'user1')).rejects.toThrow('Question not found');
    });

    it('should prevent flagging the same question multiple times (COS 4.10)', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'You have already flagged this question' },
      });

      await expect(flagQuestion('question1', 'user1')).rejects.toThrow(
        'You have already flagged this question',
      );
    });
  });

  describe('flagAnswer', () => {
    it('should flag an answer successfully', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Answer flagged successfully' },
      });

      const result = await flagAnswer('answer1', 'user1');

      expect(result.success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/answer', {
        answerId: 'answer1',
        username: 'user1',
      });
    });

    it('should throw error when flagging fails', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'Answer not found' },
      });

      await expect(flagAnswer('invalid', 'user1')).rejects.toThrow('Answer not found');
    });

    it('should prevent flagging the same answer multiple times (COS 4.10)', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'You have already flagged this answer' },
      });

      await expect(flagAnswer('answer1', 'user1')).rejects.toThrow(
        'You have already flagged this answer',
      );
    });
  });

  describe('flagComment', () => {
    it('should flag a comment successfully', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Comment flagged successfully' },
      });

      const result = await flagComment('comment1', 'user1');

      expect(result.success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/api/moderation/flag/comment', {
        commentId: 'comment1',
        username: 'user1',
      });
    });

    it('should throw error when flagging fails', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'Comment not found' },
      });

      await expect(flagComment('invalid', 'user1')).rejects.toThrow('Comment not found');
    });

    it('should prevent flagging the same comment multiple times (COS 4.10)', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: 'You have already flagged this comment' },
      });

      await expect(flagComment('comment1', 'user1')).rejects.toThrow(
        'You have already flagged this comment',
      );
    });
  });
});

