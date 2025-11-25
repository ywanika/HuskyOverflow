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
  Textarea,
  Badge,
} from '@chakra-ui/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useModeratorDashboard from '../../../hooks/useModeratorDashboard';
import useUserContext from '../../../hooks/useUserContext';
import DeleteContentModal from '../../moderation/DeleteContentModal';
import { FlaggedContentItem } from '../../../services/moderationService';
import { AppealItem } from '@fake-stack-overflow/shared';
import { getMetaData } from '../../../tool';
import './index.css';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'comments' | 'appeals'>(
    'questions',
  );
  const [appealModResponse, setAppealModResponse] = useState<{ [key: string]: string }>({});
  const [processingAppeal, setProcessingAppeal] = useState<string | null>(null);

  const {
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
    handleApproveAppeal,
    handleRejectAppeal,
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

  const renderAppealItem = (appeal: AppealItem, _index: number) => {
    const content = appeal.content;
    const title = getContentTitle(content, appeal.contentType);
    const text = getContentText(content);
    const author = appeal.appealUser;
    const deletedInfo = content.deleted as
      | { deleteReason?: string; deletedBy?: string }
      | undefined;

    return (
      <Card key={`appeal-${appeal._id}`} mb={4} borderLeft='4px' borderColor='blue.500'>
        <CardHeader>
          <VStack align='start' gap={1} flex={1}>
            <HStack>
              <Badge colorScheme='blue'>APPEAL</Badge>
              <Badge colorScheme='red'>{appeal.contentType.toUpperCase()}</Badge>
            </HStack>
            <Heading size='sm'>{title}</Heading>
            <Text fontSize='sm' color='gray.600'>
              Appealed by {author} • {getMetaData(new Date(appeal.timestamp))}
            </Text>
            {deletedInfo && (
              <Text fontSize='sm' color='red.600'>
                Deleted by {deletedInfo.deletedBy || 'Unknown'} • Reason:{' '}
                {deletedInfo.deleteReason || 'No reason provided'}
              </Text>
            )}
          </VStack>
        </CardHeader>
        <CardBody>
          <Box mb={4} p={3} bg='gray.50' borderRadius='md' maxH='200px' overflowY='auto'>
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <VStack align='start' gap={2} mb={4}>
            <Text fontSize='sm' fontWeight='bold'>
              Appeal Reason:
            </Text>
            <Box p={3} bg='blue.50' borderRadius='md' w='100%'>
              <Text fontSize='sm'>{appeal.reason}</Text>
            </Box>
          </VStack>
          <Box mb={4}>
            <Text fontSize='sm' fontWeight='bold' mb={2}>
              Moderator Response (optional):
            </Text>
            <Textarea
              value={appealModResponse[appeal._id] || ''}
              onChange={e =>
                setAppealModResponse({ ...appealModResponse, [appeal._id]: e.target.value })
              }
              placeholder='Optional response to the user...'
              rows={3}
              disabled={processingAppeal === appeal._id}
            />
          </Box>
          <HStack gap={2} flexWrap='wrap'>
            {appeal.contentType === 'question' && (
              <Button
                size='sm'
                colorScheme='blue'
                variant='outline'
                onClick={() => navigate(`/question/${appeal.contentId}`)}>
                View Question
              </Button>
            )}
            <Button
              size='sm'
              colorScheme='green'
              variant='solid'
              onClick={async () => {
                setProcessingAppeal(appeal._id);
                await handleApproveAppeal(appeal._id, appealModResponse[appeal._id] || undefined);
                setAppealModResponse({ ...appealModResponse, [appeal._id]: '' });
                setProcessingAppeal(null);
              }}
              disabled={processingAppeal === appeal._id}
              loading={processingAppeal === appeal._id}
              loadingText='Approving...'>
              Approve Appeal
            </Button>
            <Button
              size='sm'
              colorScheme='red'
              variant='solid'
              onClick={async () => {
                setProcessingAppeal(appeal._id);
                await handleRejectAppeal(appeal._id, appealModResponse[appeal._id] || undefined);
                setAppealModResponse({ ...appealModResponse, [appeal._id]: '' });
                setProcessingAppeal(null);
              }}
              disabled={processingAppeal === appeal._id}
              loading={processingAppeal === appeal._id}
              loadingText='Rejecting...'>
              Reject Appeal
            </Button>
          </HStack>
        </CardBody>
      </Card>
    );
  };

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
            <Button
              variant={activeTab === 'appeals' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'appeals' ? 'blue' : 'gray'}
              onClick={() => setActiveTab('appeals')}>
              Appeals ({appeals.length})
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
            {activeTab === 'appeals' && (
              <Box>
                {appeals.length === 0 ? (
                  <Text color='gray.500' textAlign='center' py={8}>
                    No pending appeals
                  </Text>
                ) : (
                  appeals.map((appeal, index) => renderAppealItem(appeal, index))
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
