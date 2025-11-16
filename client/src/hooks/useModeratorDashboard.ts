import { useState, useEffect } from 'react';
import useUserContext from './useUserContext';
import {
  getFlaggedContent,
  markAsReviewed,
  dismissFlag,
  deleteQuestion,
  deleteAnswer,
  deleteComment,
} from '../services/moderationService';
import DeleteContentModal from '../components/main/moderation/DeleteContentModal';
import { useNavigate } from 'react-router-dom';

interface FlaggedItem {
  _id: string;
  contentType: 'question' | 'answer' | 'comment';
  content: any;
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

  const navigate = useNavigate();

  // Check if user is moderator or admin
  const isModerator = user.role === 'moderator' || user.role === 'admin';

  if (!isModerator) {
    navigate('/moderator/NoAccess');
    return;
  }

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

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  useEffect(() => {
    const handleModerationUpdate = () => {
      fetchFlaggedContent();
    };

    socket.on('moderationUpdate', handleModerationUpdate);

    return () => {
      socket.off('moderationUpdate', handleModerationUpdate);
    };
  }, [socket]);

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

  return {
    flaggedContent,
    loading,
    error,
    handleMarkAsReviewed,
    handleDismissFlag,
    handleDeleteClick,
    deleteModal,
    setDeleteModal,
    handleDeleteConfirm,
    fetchFlaggedContent,
  };
};

export default useModeratorDashboard;
