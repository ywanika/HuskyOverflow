import { useState, useEffect } from 'react';
import useUserContext from './useUserContext';
import {
  getFlaggedContent,
  markAsReviewed,
  dismissFlag,
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  getAppeals,
  approveAppeal,
  rejectAppeal,
} from '../services/moderationService';
import { AppealItem } from '@fake-stack-overflow/shared';

interface FlaggedItem {
  _id: string;
  contentType: 'question' | 'answer' | 'comment';
  content: Record<string, unknown>;
  flaggedBy: string[];
  flaggedAt: Date[];
}

const useModeratorDashboard = () => {
  const { user, socket } = useUserContext();
  const [flaggedContent, setFlaggedContent] = useState<{
    questions: FlaggedItem[];
    answers: FlaggedItem[];
    comments: FlaggedItem[];
  }>({
    questions: [],
    answers: [],
    comments: [],
  });
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'question' | 'answer' | 'comment';
    contentId: string;
    contentTitle?: string;
  }>({
    isOpen: false,
    type: 'question',
    contentId: '',
  });

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getFlaggedContent();
      setFlaggedContent(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch flagged content');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppeals = async () => {
    try {
      setError('');
      const data = await getAppeals();
      setAppeals(data.appeals || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch appeals');
    }
  };

  useEffect(() => {
    fetchFlaggedContent();
    fetchAppeals();
  }, []);

  useEffect(() => {
    const handleModerationUpdate = () => {
      fetchFlaggedContent();
      fetchAppeals();
    };

    socket.on('moderationUpdate', handleModerationUpdate);

    return () => {
      socket.off('moderationUpdate', handleModerationUpdate);
    };
  }, [socket]);

  // Poll every 60 seconds to ensure updates within 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFlaggedContent();
      fetchAppeals();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsReviewed = async (
    contentType: 'question' | 'answer' | 'comment',
    contentId: string,
  ) => {
    try {
      await markAsReviewed(contentType, contentId, user.username);
      await fetchFlaggedContent();
    } catch (err) {
      setError((err as Error).message || 'Failed to mark as reviewed');
    }
  };

  const handleDismissFlag = async (
    contentType: 'question' | 'answer' | 'comment',
    contentId: string,
  ) => {
    try {
      await dismissFlag(contentType, contentId, user.username);
      await fetchFlaggedContent();
    } catch (err) {
      setError((err as Error).message || 'Failed to dismiss flag');
    }
  };

  const handleDeleteClick = (
    type: 'question' | 'answer' | 'comment',
    contentId: string,
    contentTitle?: string,
  ) => {
    setDeleteModal({ isOpen: true, type, contentId, contentTitle });
  };

  const handleDeleteConfirm = async (deleteReason: string) => {
    try {
      if (deleteModal.type === 'question') {
        await deleteQuestion(deleteModal.contentId, user.username, deleteReason);
      } else if (deleteModal.type === 'answer') {
        await deleteAnswer(deleteModal.contentId, user.username, deleteReason);
      } else if (deleteModal.type === 'comment') {
        await deleteComment(deleteModal.contentId, user.username, deleteReason);
      }
      setDeleteModal({ ...deleteModal, isOpen: false });
      await fetchFlaggedContent();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete content');
    }
  };

  const handleApproveAppeal = async (appealId: string, modResponse?: string) => {
    try {
      await approveAppeal(appealId, user.username, modResponse);
      await fetchAppeals();
      await fetchFlaggedContent();
    } catch (err) {
      setError((err as Error).message || 'Failed to approve appeal');
    }
  };

  const handleRejectAppeal = async (appealId: string, modResponse?: string) => {
    try {
      await rejectAppeal(appealId, user.username, modResponse);
      await fetchAppeals();
    } catch (err) {
      setError((err as Error).message || 'Failed to reject appeal');
    }
  };

  return {
    flaggedContent,
    appeals,
    loading,
    error,
    handleMarkAsReviewed,
    handleDismissFlag,
    handleDeleteClick,
    deleteModal,
    setDeleteModal,
    handleDeleteConfirm,
    fetchFlaggedContent,
    handleApproveAppeal,
    handleRejectAppeal,
  };
};

export default useModeratorDashboard;
