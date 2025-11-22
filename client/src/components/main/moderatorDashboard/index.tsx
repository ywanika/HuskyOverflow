import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Spinner,
  CardRoot as Card,
  CardBody,
  CardHeader,
  AlertRoot as Alert,
} from '@chakra-ui/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useModeratorDashboard from '../../../hooks/useModeratorDashboard';
import useUserContext from '../../../hooks/useUserContext';
import DeleteContentModal from '../../moderation/DeleteContentModal';
import { FlaggedContentItem } from '../../../services/moderationService';
import { getMetaData } from '../../../tool';
import './index.css';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'comments'>('questions');

  const {
    flaggedContent,
    loading,
    error,
    handleMarkAsReviewed,
    handleDismissFlag,
    handleDeleteClick,
    deleteModal,
    setDeleteModal,
    handleDeleteConfirm,
  } = useModeratorDashboard();

  // Check if user is moderator or admin
  const isModerator = user.role === 'moderator' || user.role === 'admin';

  if (!isModerator) {
    return <Navigate to='/home' />;
  }

  const getContentTitle = (
    item: Record<string, unknown>,
    contentType: 'question' | 'answer' | 'comment',
  ): string => {
    if (contentType === 'question') {
      return (
        (typeof item.title === 'string' ? item.title : 'Untitled Question') || 'Untitled Question'
      );
    } else if (contentType === 'answer') {
      const text = typeof item.text === 'string' ? item.text : '';
      return text.substring(0, 50) || 'Answer';
    } else {
      const text = typeof item.text === 'string' ? item.text : '';
      return text.substring(0, 50) || 'Comment';
    }
  };

  const getContentText = (item: Record<string, unknown>): string => {
    if (typeof item.text === 'string') {
      return item.text;
    }
    if (typeof item.title === 'string') {
      return item.title;
    }
    return 'No content';
  };

  const renderFlaggedItem = (
    item: FlaggedContentItem,
    contentType: 'question' | 'answer' | 'comment',
    _index: number,
  ) => {
    const title = getContentTitle(item.content, contentType);
    const text = getContentText(item.content);
    const author =
      (typeof item.content.askedBy === 'string' ? item.content.askedBy : null) ||
      (typeof item.content.ansBy === 'string' ? item.content.ansBy : null) ||
      (typeof item.content.commentBy === 'string' ? item.content.commentBy : null) ||
      'Unknown';
    const date =
      (item.content.askDateTime instanceof Date ? item.content.askDateTime : null) ||
      (item.content.ansDateTime instanceof Date ? item.content.ansDateTime : null) ||
      (item.content.commentDateTime instanceof Date ? item.content.commentDateTime : null) ||
      new Date();

    return (
      <Card key={`${contentType}-${item._id}`} className='flagged-card'>
        <CardHeader>
          <div className='flagged-card-header'>
            <VStack align='start' gap={1} flex={1}>
              <div className='flagged-card-badges'>
                <span className='badge-content-type'>{contentType}</span>
                <span className='badge-flag-count'>
                  {item.flaggedBy.length} flag{item.flaggedBy.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Heading className='flagged-card-title'>{title}</Heading>
              <Text className='flagged-card-meta'>
                By {author} • {getMetaData(new Date(date))}
              </Text>
            </VStack>
          </div>
        </CardHeader>
        <CardBody>
          <Box className='flagged-content-box'>
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <div className='flagged-by-section'>
            <Text className='flagged-by-label'>Flagged by:</Text>
            <div className='flagged-by-users'>
              {item.flaggedBy.map((username: string, idx: number) => (
                <span key={idx} className='badge-user-outline'>
                  {username}
                </span>
              ))}
            </div>
            <Text className='flagged-date'>
              First flagged: {getMetaData(new Date(item.flaggedAt[0]))}
            </Text>
          </div>
          <div className='flagged-actions'>
            {contentType === 'question' && (
              <Button
                className='btn-view-question'
                onClick={() => navigate(`/question/${item._id}`)}>
                View Question
              </Button>
            )}
            <Button
              className='btn-mark-reviewed'
              onClick={() => handleMarkAsReviewed(contentType, item._id)}>
              Mark as Reviewed
            </Button>
            <Button
              className='btn-dismiss-flag'
              onClick={() => handleDismissFlag(contentType, item._id)}>
              Dismiss Flag
            </Button>
            <Button
              className='btn-delete-content'
              onClick={() => handleDeleteClick(contentType, item._id, title)}>
              Delete
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box className='moderator-loading'>
        <Spinner size='xl' />
        <Text className='moderator-loading-text'>Loading flagged content...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className='moderator-error'>
        <Alert status='error'>{error}</Alert>
      </Box>
    );
  }

  const totalFlagged =
    flaggedContent.questions.length +
    flaggedContent.answers.length +
    flaggedContent.comments.length;

  return (
    <Box className='moderator-dashboard'>
      <VStack align='stretch' gap={6}>
        <Box className='moderator-dashboard-header'>
          <Heading size='lg' mb={2}>
            Moderator Dashboard
          </Heading>
          <Text className='moderator-dashboard-subtitle'>
            Review and manage flagged content. Total flagged items: {totalFlagged}
          </Text>
        </Box>

        <Box>
          <HStack gap={2} className='moderator-tabs'>
            <Button
              className={`moderator-tab ${activeTab === 'questions' ? 'moderator-tab-active' : ''}`}
              onClick={() => setActiveTab('questions')}>
              Questions ({flaggedContent.questions.length})
            </Button>
            <Button
              className={`moderator-tab ${activeTab === 'answers' ? 'moderator-tab-active' : ''}`}
              onClick={() => setActiveTab('answers')}>
              Answers ({flaggedContent.answers.length})
            </Button>
            <Button
              className={`moderator-tab ${activeTab === 'comments' ? 'moderator-tab-active' : ''}`}
              onClick={() => setActiveTab('comments')}>
              Comments ({flaggedContent.comments.length})
            </Button>
          </HStack>

          <Box>
            {activeTab === 'questions' && (
              <Box>
                {flaggedContent.questions.length === 0 ? (
                  <Text className='empty-state'>No flagged questions</Text>
                ) : (
                  flaggedContent.questions.map((item, index) =>
                    renderFlaggedItem(item, 'question', index),
                  )
                )}
              </Box>
            )}
            {activeTab === 'answers' && (
              <Box>
                {flaggedContent.answers.length === 0 ? (
                  <Text className='empty-state'>No flagged answers</Text>
                ) : (
                  flaggedContent.answers.map((item, index) =>
                    renderFlaggedItem(item, 'answer', index),
                  )
                )}
              </Box>
            )}
            {activeTab === 'comments' && (
              <Box>
                {flaggedContent.comments.length === 0 ? (
                  <Text className='empty-state'>No flagged comments</Text>
                ) : (
                  flaggedContent.comments.map((item, index) =>
                    renderFlaggedItem(item, 'comment', index),
                  )
                )}
              </Box>
            )}
          </Box>
        </Box>
      </VStack>

      <DeleteContentModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        contentType={deleteModal.type}
        contentTitle={deleteModal.contentTitle}
      />
    </Box>
  );
};

export default ModeratorDashboard;
