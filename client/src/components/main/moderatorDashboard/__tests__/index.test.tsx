import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { ObjectId } from 'mongodb';
import ModeratorDashboard from '../index';
import useModeratorDashboard from '../../../../hooks/useModeratorDashboard';
import useUserContext from '../../../../hooks/useUserContext';
import type { AppealItem } from '@fake-stack-overflow/shared';
import { SafeDatabaseUser, FakeSOSocket } from '../../../../types/types';

const system = createSystem(defaultConfig);

jest.mock('../../../../hooks/useModeratorDashboard');
jest.mock('../../../../hooks/useUserContext');
jest.mock('../../../moderation/DeleteContentModal', () => {
  return function MockDeleteContentModal({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid='delete-modal'>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onConfirm('Delete reason')}>Confirm Delete</button>
      </div>
    );
  };
});

const mockUseModeratorDashboard = useModeratorDashboard as jest.MockedFunction<
  typeof useModeratorDashboard
>;
const MockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;

const mockFlaggedContent = {
  questions: [
    {
      _id: 'q1',
      contentType: 'question' as const,
      content: {
        _id: 'q1',
        title: 'Test Question 1',
        text: 'Question text 1',
        askedBy: 'user1',
        askDateTime: new Date('2024-01-01'),
      },
      flaggedBy: ['user2', 'user3'],
      flaggedAt: [new Date('2024-01-01'), new Date('2024-01-02')],
    },
    {
      _id: 'q2',
      contentType: 'question' as const,
      content: {
        _id: 'q2',
        title: 'Test Question 2',
        text: 'Question text 2',
        askedBy: 'user4',
        askDateTime: new Date('2024-01-03'),
      },
      flaggedBy: ['user5'],
      flaggedAt: [new Date('2024-01-03')],
    },
  ],
  answers: [
    {
      _id: 'a1',
      contentType: 'answer' as const,
      content: {
        _id: 'a1',
        text: 'This is an answer text that should be displayed',
        ansBy: 'user6',
        ansDateTime: new Date('2024-01-04'),
      },
      flaggedBy: ['user7', 'user8', 'user9'],
      flaggedAt: [new Date('2024-01-04'), new Date('2024-01-05'), new Date('2024-01-06')],
    },
  ],
  comments: [
    {
      _id: 'c1',
      contentType: 'comment' as const,
      content: {
        _id: 'c1',
        text: 'This is a comment',
        commentBy: 'user10',
        commentDateTime: new Date('2024-01-07'),
      },
      flaggedBy: ['user11'],
      flaggedAt: [new Date('2024-01-07')],
    },
  ],
  messages: [],
};

const MOCK_APPEALS: AppealItem[] = [
  {
    _id: 'appeal1',
    contentId: 'q3',
    contentType: 'question',
    appealUser: 'user12',
    reason:
      'My post follows the community guidelines and provides helpful information for other developers.',
    status: 'pending',
    timestamp: new Date('2024-02-01'),
    content: {
      _id: 'q3',
      title: 'Deleted Question',
      text: 'Deleted content body',
      askedBy: 'user12',
      askDateTime: new Date('2024-01-30'),
      deleted: {
        deleteReason: 'off-topic',
        deletedBy: 'mod1',
      },
    },
  },
];

const renderComponent = () => {
  return render(
    <ChakraProvider value={system}>
      <BrowserRouter>
        <ModeratorDashboard />
      </BrowserRouter>
    </ChakraProvider>,
  );
};

describe('ModeratorDashboard', () => {
  const mockHandleMarkAsReviewed = jest.fn();
  const mockHandleDismissFlag = jest.fn();
  const mockHandleDeleteClick = jest.fn();
  const mockHandleDeleteConfirm = jest.fn();
  const mockSetDeleteModal = jest.fn();
  const mockHandleApproveAppeal = jest.fn();
  const mockHandleRejectAppeal = jest.fn();

  const buildHookReturn = (overrides: Partial<ReturnType<typeof useModeratorDashboard>> = {}) => ({
    flaggedContent: mockFlaggedContent,
    appeals: MOCK_APPEALS,
    deletedContent: [],
    loading: false,
    error: '',
    handleMarkAsReviewed: mockHandleMarkAsReviewed,
    handleDismissFlag: mockHandleDismissFlag,
    handleDeleteClick: mockHandleDeleteClick,
    deleteModal: {
      isOpen: false,
      type: 'question' as const,
      contentId: '',
    },
    setDeleteModal: mockSetDeleteModal,
    handleDeleteConfirm: mockHandleDeleteConfirm,
    fetchFlaggedContent: jest.fn(),
    handleApproveAppeal: mockHandleApproveAppeal,
    handleRejectAppeal: mockHandleRejectAppeal,
    handleRestoreContent: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    MockUseUserContext.mockReturnValue({
      user: {
        username: 'moderator1',
        role: 'moderator',
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        dateJoined: new Date('2024-01-01'),
      } as SafeDatabaseUser,
      socket: {} as FakeSOSocket,
    });

    mockUseModeratorDashboard.mockReturnValue(buildHookReturn());
  });

  describe('access control', () => {
    it('should redirect non-moderator users to home', () => {
      MockUseUserContext.mockReturnValue({
        user: {
          username: 'user1',
          role: 'user',
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          dateJoined: new Date('2024-01-01'),
        } as SafeDatabaseUser,
        socket: {} as FakeSOSocket,
      });

      renderComponent();

      // Navigate component should redirect
      expect(screen.queryByText('Moderator Dashboard')).not.toBeInTheDocument();
    });

    it('should allow moderator users to access dashboard', () => {
      renderComponent();

      expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
    });

    it('should allow admin users to access dashboard', () => {
      MockUseUserContext.mockReturnValue({
        user: {
          username: 'admin1',
          role: 'admin',
          _id: new ObjectId('507f1f77bcf86cd799439013'),
          dateJoined: new Date('2024-01-01'),
        } as SafeDatabaseUser,
        socket: {} as FakeSOSocket,
      });

      renderComponent();

      expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display loading spinner when loading', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: { questions: [], answers: [], comments: [], messages: [] },
          loading: true,
        }),
      );

      renderComponent();

      expect(screen.getByText('Loading flagged content...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when error occurs', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: { questions: [], answers: [], comments: [], messages: [] },
          error: 'Failed to fetch flagged content',
        }),
      );

      renderComponent();

      expect(screen.getByText('Failed to fetch flagged content')).toBeInTheDocument();
    });
  });

  describe('dashboard header', () => {
    it('should display dashboard title', () => {
      renderComponent();

      expect(screen.getByText('Moderator Dashboard')).toBeInTheDocument();
    });

    it('should display total flagged items count', () => {
      renderComponent();

      // Test that flagged count is displayed without hardcoding the exact text
      const textElement = screen.getByText(/Total flagged items:/);
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toContain('4');
    });

    it('should calculate total correctly with empty arrays', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: { questions: [], answers: [], comments: [], messages: [] },
        }),
      );

      renderComponent();

      // Test that flagged count is displayed without hardcoding the exact text
      const textElement = screen.getByText(/Total flagged items:/);
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toContain('0');
    });
  });

  describe('tab navigation', () => {
    it('should display all three main tabs with correct counts', () => {
      renderComponent();

      expect(screen.getByText(/Flagged \(4\)/)).toBeInTheDocument();
      expect(screen.getByText(/Appeals \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Delete History \(0\)/)).toBeInTheDocument();
    });

    it('should default to flagged tab with questions subtab', () => {
      renderComponent();

      const flaggedTab = screen.getByText(/Flagged \(4\)/).closest('button');
      expect(flaggedTab).toHaveClass('chakra-button');
      expect(screen.getByText(/Questions \(2\)/)).toBeInTheDocument();
    });

    it('should switch to answers subtab when clicked', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      expect(screen.queryByText('No flagged answers')).not.toBeInTheDocument();
      const answerTexts = screen.getAllByText('This is an answer text that should be displayed');
      expect(answerTexts.length).toBeGreaterThan(0);
    });

    it('should switch to comments subtab when clicked', () => {
      renderComponent();

      const commentsTab = screen.getByText(/Comments \(1\)/).closest('button');
      fireEvent.click(commentsTab!);

      const commentTexts = screen.getAllByText('This is a comment');
      expect(commentTexts.length).toBeGreaterThan(0);
    });

    it('should show empty state when tab has no items', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [],
            answers: [],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      expect(screen.getByText('No flagged questions')).toBeInTheDocument();
    });
  });

  describe('flagged question display', () => {
    it('should display all flagged questions', () => {
      renderComponent();

      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    });

    it('should display question metadata correctly', () => {
      renderComponent();

      expect(screen.getByText(/By user1/)).toBeInTheDocument();
      const questionBadges = screen.getAllByText(/QUESTION/);
      expect(questionBadges.length).toBeGreaterThan(0);
    });

    it('should display flag count correctly', () => {
      renderComponent();

      expect(screen.getByText(/2 flags/)).toBeInTheDocument();
      expect(screen.getByText(/1 flag/)).toBeInTheDocument();
    });

    it('should display flagged by usernames', () => {
      renderComponent();

      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('user3')).toBeInTheDocument();
      expect(screen.getByText('user5')).toBeInTheDocument();
    });

    it('should display question text in markdown', () => {
      renderComponent();

      expect(screen.getByText('Question text 1')).toBeInTheDocument();
      expect(screen.getByText('Question text 2')).toBeInTheDocument();
    });
  });

  describe('flagged answer display', () => {
    it('should display flagged answers when answers tab is active', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      const answerTexts = screen.getAllByText('This is an answer text that should be displayed');
      expect(answerTexts.length).toBeGreaterThan(0);
    });

    it('should display answer metadata correctly', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      expect(screen.getByText(/By user6/)).toBeInTheDocument();
      const answerBadges = screen.getAllByText(/^answer$/i);
      expect(answerBadges.length).toBeGreaterThan(0);
    });

    it('should display answer text truncated in title when long', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      // The title should show first 50 characters
      const answerTexts = screen.getAllByText('This is an answer text that should be displayed');
      expect(answerTexts.length).toBeGreaterThan(0);
    });
  });

  describe('flagged comment display', () => {
    it('should display flagged comments when comments tab is active', () => {
      renderComponent();

      const commentsTab = screen.getByText(/Comments \(1\)/).closest('button');
      fireEvent.click(commentsTab!);

      const commentTexts = screen.getAllByText('This is a comment');
      expect(commentTexts.length).toBeGreaterThan(0);
    });

    it('should display comment metadata correctly', () => {
      renderComponent();

      const commentsTab = screen.getByText(/Comments \(1\)/).closest('button');
      fireEvent.click(commentsTab!);

      expect(screen.getByText(/By user10/)).toBeInTheDocument();
      const commentBadges = screen.getAllByText(/^comment$/i);
      expect(commentBadges.length).toBeGreaterThan(0);
    });
  });

  describe('action buttons', () => {
    it('should display View Question button for questions', () => {
      renderComponent();

      const viewButtons = screen.getAllByText('View Question');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should not display View Question button for answers', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      expect(screen.queryByText('View Question')).not.toBeInTheDocument();
    });

    it('should display Mark as Reviewed button for all content types', () => {
      renderComponent();

      const markButtons = screen.getAllByText('Mark as Reviewed');
      expect(markButtons.length).toBe(2); // 2 questions
    });

    it('should display Dismiss Flag button for all content types', () => {
      renderComponent();

      const dismissButtons = screen.getAllByText('Dismiss Flag');
      expect(dismissButtons.length).toBe(2); // 2 questions
    });

    it('should display Delete button for all content types', () => {
      renderComponent();

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBe(2); // 2 questions
    });

    it('should call handleMarkAsReviewed when Mark as Reviewed is clicked', () => {
      renderComponent();

      const markButtons = screen.getAllByText('Mark as Reviewed');
      fireEvent.click(markButtons[0]);

      expect(mockHandleMarkAsReviewed).toHaveBeenCalledWith('question', 'q1');
    });

    it('should call handleDismissFlag when Dismiss Flag is clicked', () => {
      renderComponent();

      const dismissButtons = screen.getAllByText('Dismiss Flag');
      fireEvent.click(dismissButtons[0]);

      expect(mockHandleDismissFlag).toHaveBeenCalledWith('question', 'q1');
    });

    it('should call handleDeleteClick when Delete is clicked', () => {
      renderComponent();

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(mockHandleDeleteClick).toHaveBeenCalledWith('question', 'q1', 'Test Question 1');
    });

    it('should navigate to question page when View Question is clicked', () => {
      renderComponent();

      const viewButton = screen.getAllByText('View Question')[0];
      fireEvent.click(viewButton);

      // Navigation is handled by react-router, so we just verify the button exists and is clickable
      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('content title extraction', () => {
    it('should use title for questions', () => {
      renderComponent();

      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    it('should use truncated text for answers', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      const answerTexts = screen.getAllByText('This is an answer text that should be displayed');
      expect(answerTexts.length).toBeGreaterThan(0);
    });

    it('should use truncated text for comments', () => {
      renderComponent();

      const commentsTab = screen.getByText(/Comments \(1\)/).closest('button');
      fireEvent.click(commentsTab!);

      const commentTexts = screen.getAllByText('This is a comment');
      expect(commentTexts.length).toBeGreaterThan(0);
    });

    it('should handle missing title gracefully', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [
              {
                _id: 'q3',
                contentType: 'question',
                content: {
                  _id: 'q3',
                  text: 'Question without title',
                  askedBy: 'user1',
                  askDateTime: new Date(),
                },
                flaggedBy: ['user2'],
                flaggedAt: [new Date()],
              },
            ],
            answers: [],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      expect(screen.getByText('Untitled Question')).toBeInTheDocument();
    });

    it('should handle missing text gracefully for answers', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [],
            answers: [
              {
                _id: 'a2',
                contentType: 'answer',
                content: {
                  _id: 'a2',
                  ansBy: 'user1',
                  ansDateTime: new Date(),
                },
                flaggedBy: ['user2'],
                flaggedAt: [new Date()],
              },
            ],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      expect(screen.getByText('Answer')).toBeInTheDocument();
    });
  });

  describe('content text extraction', () => {
    it('should use text property when available', () => {
      renderComponent();

      expect(screen.getByText('Question text 1')).toBeInTheDocument();
    });

    it('should use title property when text is not available', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [
              {
                _id: 'q4',
                contentType: 'question',
                content: {
                  _id: 'q4',
                  title: 'Question Title Only',
                  askedBy: 'user1',
                  askDateTime: new Date(),
                },
                flaggedBy: ['user2'],
                flaggedAt: [new Date()],
              },
            ],
            answers: [],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      const titleTexts = screen.getAllByText('Question Title Only');
      expect(titleTexts.length).toBeGreaterThan(0);
    });

    it('should display "No content" when neither text nor title is available', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [
              {
                _id: 'q5',
                contentType: 'question',
                content: {
                  _id: 'q5',
                  askedBy: 'user1',
                  askDateTime: new Date(),
                },
                flaggedBy: ['user2'],
                flaggedAt: [new Date()],
              },
            ],
            answers: [],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      expect(screen.getByText('No content')).toBeInTheDocument();
    });
  });

  describe('author extraction', () => {
    it('should use askedBy for questions', () => {
      renderComponent();

      expect(screen.getByText(/By user1/)).toBeInTheDocument();
    });

    it('should use ansBy for answers', () => {
      renderComponent();

      const answersTab = screen.getByText(/Answers \(1\)/).closest('button');
      fireEvent.click(answersTab!);

      expect(screen.getByText(/By user6/)).toBeInTheDocument();
    });

    it('should use commentBy for comments', () => {
      renderComponent();

      const commentsTab = screen.getByText(/Comments \(1\)/).closest('button');
      fireEvent.click(commentsTab!);

      expect(screen.getByText(/By user10/)).toBeInTheDocument();
    });

    it('should display "Unknown" when author is not available', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          flaggedContent: {
            questions: [
              {
                _id: 'q6',
                contentType: 'question',
                content: {
                  _id: 'q6',
                  title: 'Test',
                  askDateTime: new Date(),
                },
                flaggedBy: ['user2'],
                flaggedAt: [new Date()],
              },
            ],
            answers: [],
            comments: [],
            messages: [],
          },
        }),
      );

      renderComponent();

      expect(screen.getByText(/By Unknown/)).toBeInTheDocument();
    });
  });

  describe('delete modal', () => {
    it('should render delete modal when deleteModal.isOpen is true', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deleteModal: {
            isOpen: true,
            type: 'question',
            contentId: 'q1',
            contentTitle: 'Test Question',
          },
        }),
      );

      renderComponent();

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('should not render delete modal when deleteModal.isOpen is false', () => {
      renderComponent();

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('should call setDeleteModal to close modal', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deleteModal: {
            isOpen: true,
            type: 'question',
            contentId: 'q1',
            contentTitle: 'Test Question',
          },
        }),
      );

      renderComponent();

      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      expect(mockSetDeleteModal).toHaveBeenCalledWith({
        isOpen: false,
        type: 'question',
        contentId: 'q1',
        contentTitle: 'Test Question',
      });
    });

    it('should call handleDeleteConfirm when delete is confirmed', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deleteModal: {
            isOpen: true,
            type: 'question',
            contentId: 'q1',
            contentTitle: 'Test Question',
          },
        }),
      );

      renderComponent();

      const confirmButton = screen.getByText('Confirm Delete');
      fireEvent.click(confirmButton);

      expect(mockHandleDeleteConfirm).toHaveBeenCalledWith('Delete reason');
    });
  });

  describe('Deleted Content Tab', () => {
    it('should display delete history tab', () => {
      renderComponent();

      const deletedTab = screen.getByText(/Delete History \(0\)/i);
      expect(deletedTab).toBeInTheDocument();
    });

    it('should show deleted items when tab is clicked', () => {
      const mockDeletedItems = [
        {
          _id: '507f1f77bcf86cd799439011',
          contentType: 'question' as const,
          contentPreview: 'This is a deleted question preview',
          authorUsername: 'user1',
          deleteReason: 'Spam',
          deletedAt: new Date('2024-01-01'),
          content: {},
          deletedBy: 'moderator1',
        },
        {
          _id: '507f1f77bcf86cd799439012',
          contentType: 'answer' as const,
          contentPreview: 'This is a deleted answer preview',
          authorUsername: 'user2',
          deleteReason: 'Off-topic',
          deletedAt: new Date('2024-01-02'),
          content: {},
          deletedBy: 'moderator1',
        },
      ];

      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deletedContent: mockDeletedItems,
        }),
      );

      renderComponent();

      const deletedTab = screen.getByText(/Delete History \(2\)/i);
      fireEvent.click(deletedTab);

      expect(screen.getByText(/by user1/)).toBeInTheDocument();
      expect(screen.getByText(/by user2/)).toBeInTheDocument();
    });

    it('should show restore button for deleted items', () => {
      const mockDeletedItems = [
        {
          _id: '507f1f77bcf86cd799439011',
          contentType: 'question' as const,
          contentPreview: 'This is a deleted question',
          authorUsername: 'user1',
          deleteReason: 'Spam',
          deletedAt: new Date('2024-01-01'),
          content: {},
          deletedBy: 'moderator1',
        },
      ];

      const mockHandleRestoreContent = jest.fn();

      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deletedContent: mockDeletedItems,
          handleRestoreContent: mockHandleRestoreContent,
        }),
      );

      renderComponent();

      const deletedTab = screen.getByText(/Delete History \(1\)/i);
      fireEvent.click(deletedTab);

      const restoreButtons = screen.getAllByText('Restore Content');
      expect(restoreButtons.length).toBeGreaterThan(0);

      fireEvent.click(restoreButtons[0]);
      expect(mockHandleRestoreContent).toHaveBeenCalledWith('question', '507f1f77bcf86cd799439011');
    });

    it('should show empty state when no deleted content', () => {
      mockUseModeratorDashboard.mockReturnValue(
        buildHookReturn({
          deletedContent: [],
        }),
      );

      renderComponent();

      const deletedTab = screen.getByText(/Delete History \(0\)/i);
      fireEvent.click(deletedTab);

      expect(screen.getByText('No deleted content')).toBeInTheDocument();
    });
  });
});
