import { renderHook, waitFor, act } from '@testing-library/react';
import { ObjectId } from 'mongodb';
import useModeratorDashboard from '../useModeratorDashboard';
import * as moderationService from '../../services/moderationService';
import useUserContext from '../useUserContext';
import { FakeSOSocket, SafeDatabaseUser } from '../../types/types';

jest.mock('../useUserContext');
jest.mock('../../services/moderationService');

const MockUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;
const mockModerationService = moderationService as jest.Mocked<typeof moderationService>;

describe('useModeratorDashboard', () => {
  const mockUser: SafeDatabaseUser = {
    username: 'moderator1',
    role: 'moderator',
    _id: new ObjectId('507f1f77bcf86cd799439011'),
    dateJoined: new Date('2024-01-01'),
  } as SafeDatabaseUser;

  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockFlaggedContent = {
    questions: [
      {
        _id: 'q1',
        contentType: 'question' as const,
        content: {
          _id: 'q1',
          title: 'Test Question',
          text: 'Question text',
          askedBy: 'user1',
          askDateTime: new Date('2024-01-01'),
        },
        flaggedBy: ['user2', 'user3'],
        flaggedAt: [new Date('2024-01-01'), new Date('2024-01-02')],
      },
    ],
    answers: [
      {
        _id: 'a1',
        contentType: 'answer' as const,
        content: {
          _id: 'a1',
          text: 'Answer text',
          ansBy: 'user4',
          ansDateTime: new Date('2024-01-03'),
        },
        flaggedBy: ['user5'],
        flaggedAt: [new Date('2024-01-03')],
      },
    ],
    comments: [
      {
        _id: 'c1',
        contentType: 'comment' as const,
        content: {
          _id: 'c1',
          text: 'Comment text',
          commentBy: 'user6',
          commentDateTime: new Date('2024-01-04'),
        },
        flaggedBy: ['user7'],
        flaggedAt: [new Date('2024-01-04')],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockUserContext.mockReturnValue({
      user: mockUser,
      socket: mockSocket as unknown as FakeSOSocket,
    });
  });

  describe('initial state and data fetching', () => {
    it('should initialize with empty flagged content and loading state', () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: [],
        answers: [],
        comments: [],
      });

      const { result } = renderHook(() => useModeratorDashboard());

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe('');
      expect(result.current.flaggedContent.questions).toEqual([]);
      expect(result.current.flaggedContent.answers).toEqual([]);
      expect(result.current.flaggedContent.comments).toEqual([]);
    });

    it('should fetch flagged content on mount', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(1);
      expect(result.current.flaggedContent).toEqual(mockFlaggedContent);
    });

    it('should set loading to false after fetch completes', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch flagged content';
      mockModerationService.getFlaggedContent.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.flaggedContent.questions).toEqual([]);
    });

    it('should handle fetch errors with no message', async () => {
      mockModerationService.getFlaggedContent.mockRejectedValueOnce({} as Error);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch flagged content');
    });
  });

  describe('socket event handling', () => {
    it('should listen for moderationUpdate events', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalledWith('moderationUpdate', expect.any(Function));
      });
    });

    it('should refetch flagged content on moderationUpdate event', async () => {
      mockModerationService.getFlaggedContent
        .mockResolvedValueOnce(mockFlaggedContent)
        .mockResolvedValueOnce({
          questions: [],
          answers: [],
          comments: [],
        });

      renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const updateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'moderationUpdate',
      )?.[1] as () => void;

      expect(updateHandler).toBeDefined();
      updateHandler();

      await waitFor(() => {
        expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(2);
      });
    });

    it('should cleanup socket listener on unmount', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { unmount } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      unmount();

      const updateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'moderationUpdate',
      )?.[1] as () => void;

      expect(mockSocket.off).toHaveBeenCalledWith('moderationUpdate', updateHandler);
    });
  });

  describe('handleMarkAsReviewed', () => {
    it('should mark question as reviewed and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.markAsReviewed.mockResolvedValueOnce({
        success: true,
        message: 'Marked as reviewed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: [],
        answers: mockFlaggedContent.answers,
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleMarkAsReviewed('question', 'q1');

      expect(mockModerationService.markAsReviewed).toHaveBeenCalledWith(
        'question',
        'q1',
        'moderator1',
      );
      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(2);
    });

    it('should mark answer as reviewed and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.markAsReviewed.mockResolvedValueOnce({
        success: true,
        message: 'Marked as reviewed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: [],
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleMarkAsReviewed('answer', 'a1');

      expect(mockModerationService.markAsReviewed).toHaveBeenCalledWith(
        'answer',
        'a1',
        'moderator1',
      );
    });

    it('should mark comment as reviewed and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.markAsReviewed.mockResolvedValueOnce({
        success: true,
        message: 'Marked as reviewed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: mockFlaggedContent.answers,
        comments: [],
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleMarkAsReviewed('comment', 'c1');

      expect(mockModerationService.markAsReviewed).toHaveBeenCalledWith(
        'comment',
        'c1',
        'moderator1',
      );
    });

    it('should handle errors when marking as reviewed', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      const errorMessage = 'Failed to mark as reviewed';
      mockModerationService.markAsReviewed.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleMarkAsReviewed('question', 'q1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle errors with no message when marking as reviewed', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.markAsReviewed.mockRejectedValueOnce({} as Error);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleMarkAsReviewed('question', 'q1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to mark as reviewed');
      });
    });
  });

  describe('handleDismissFlag', () => {
    it('should dismiss flag for question and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.dismissFlag.mockResolvedValueOnce({
        success: true,
        message: 'Flag dismissed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: [],
        answers: mockFlaggedContent.answers,
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleDismissFlag('question', 'q1');

      expect(mockModerationService.dismissFlag).toHaveBeenCalledWith(
        'question',
        'q1',
        'moderator1',
      );
      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(2);
    });

    it('should dismiss flag for answer and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.dismissFlag.mockResolvedValueOnce({
        success: true,
        message: 'Flag dismissed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: [],
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleDismissFlag('answer', 'a1');

      expect(mockModerationService.dismissFlag).toHaveBeenCalledWith('answer', 'a1', 'moderator1');
    });

    it('should dismiss flag for comment and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.dismissFlag.mockResolvedValueOnce({
        success: true,
        message: 'Flag dismissed',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: mockFlaggedContent.answers,
        comments: [],
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.handleDismissFlag('comment', 'c1');

      expect(mockModerationService.dismissFlag).toHaveBeenCalledWith('comment', 'c1', 'moderator1');
    });

    it('should handle errors when dismissing flag', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      const errorMessage = 'Failed to dismiss flag';
      mockModerationService.dismissFlag.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDismissFlag('question', 'q1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle errors with no message when dismissing flag', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.dismissFlag.mockRejectedValueOnce({} as Error);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.handleDismissFlag('question', 'q1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to dismiss flag');
      });
    });
  });

  describe('handleDeleteClick', () => {
    it('should open delete modal with question details', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('question', 'q1', 'Test Question');
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.type).toBe('question');
      expect(result.current.deleteModal.contentId).toBe('q1');
      expect(result.current.deleteModal.contentTitle).toBe('Test Question');
    });

    it('should open delete modal with answer details', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('answer', 'a1', 'Answer text');
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.type).toBe('answer');
      expect(result.current.deleteModal.contentId).toBe('a1');
      expect(result.current.deleteModal.contentTitle).toBe('Answer text');
    });

    it('should open delete modal with comment details', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('comment', 'c1', 'Comment text');
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.type).toBe('comment');
      expect(result.current.deleteModal.contentId).toBe('c1');
      expect(result.current.deleteModal.contentTitle).toBe('Comment text');
    });

    it('should open delete modal without content title', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('question', 'q1');
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.contentTitle).toBeUndefined();
    });
  });

  describe('handleDeleteConfirm', () => {
    it('should delete question and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.deleteQuestion.mockResolvedValueOnce({
        success: true,
        message: 'Question deleted',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: [],
        answers: mockFlaggedContent.answers,
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('question', 'q1', 'Test Question');
      });

      await act(async () => {
        await result.current.handleDeleteConfirm('Inappropriate content');
      });

      expect(mockModerationService.deleteQuestion).toHaveBeenCalledWith(
        'q1',
        'moderator1',
        'Inappropriate content',
      );
      await waitFor(() => {
        expect(result.current.deleteModal.isOpen).toBe(false);
      });
      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(2);
    });

    it('should delete answer and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.deleteAnswer.mockResolvedValueOnce({
        success: true,
        message: 'Answer deleted',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: [],
        comments: mockFlaggedContent.comments,
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('answer', 'a1', 'Answer text');
      });

      await act(async () => {
        await result.current.handleDeleteConfirm('Spam content');
      });

      expect(mockModerationService.deleteAnswer).toHaveBeenCalledWith(
        'a1',
        'moderator1',
        'Spam content',
      );
      await waitFor(() => {
        expect(result.current.deleteModal.isOpen).toBe(false);
      });
    });

    it('should delete comment and refetch content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.deleteComment.mockResolvedValueOnce({
        success: true,
        message: 'Comment deleted',
      });
      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: mockFlaggedContent.questions,
        answers: mockFlaggedContent.answers,
        comments: [],
      });

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('comment', 'c1', 'Comment text');
      });

      await act(async () => {
        await result.current.handleDeleteConfirm('Harassment');
      });

      expect(mockModerationService.deleteComment).toHaveBeenCalledWith(
        'c1',
        'moderator1',
        'Harassment',
      );
      await waitFor(() => {
        expect(result.current.deleteModal.isOpen).toBe(false);
      });
    });

    it('should handle errors when deleting content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      const errorMessage = 'Failed to delete content';
      mockModerationService.deleteQuestion.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('question', 'q1', 'Test Question');
      });

      await act(async () => {
        await result.current.handleDeleteConfirm('Reason');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should handle errors with no message when deleting content', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);
      mockModerationService.deleteQuestion.mockRejectedValueOnce({} as Error);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick('question', 'q1', 'Test Question');
      });

      await act(async () => {
        await result.current.handleDeleteConfirm('Reason');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to delete content');
      });
    });
  });

  describe('setDeleteModal', () => {
    it('should allow manual control of delete modal state', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setDeleteModal({
          isOpen: true,
          type: 'question',
          contentId: 'q1',
          contentTitle: 'Test',
        });
      });

      expect(result.current.deleteModal.isOpen).toBe(true);
      expect(result.current.deleteModal.type).toBe('question');
      expect(result.current.deleteModal.contentId).toBe('q1');
      expect(result.current.deleteModal.contentTitle).toBe('Test');

      act(() => {
        result.current.setDeleteModal({
          isOpen: false,
          type: 'question',
          contentId: '',
        });
      });

      expect(result.current.deleteModal.isOpen).toBe(false);
    });
  });

  describe('fetchFlaggedContent', () => {
    it('should expose fetchFlaggedContent function for manual refresh', async () => {
      mockModerationService.getFlaggedContent.mockResolvedValueOnce(mockFlaggedContent);

      const { result } = renderHook(() => useModeratorDashboard());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(1);

      mockModerationService.getFlaggedContent.mockResolvedValueOnce({
        questions: [],
        answers: [],
        comments: [],
      });

      await result.current.fetchFlaggedContent();

      expect(mockModerationService.getFlaggedContent).toHaveBeenCalledTimes(2);
    });
  });
});
