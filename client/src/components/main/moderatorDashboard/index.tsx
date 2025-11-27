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

/**
 * ModeratorDashboard component allows moderators to review and manage flagged content
 * including questions, answers, comments, and user appeals.
 */

type FlaggableContentType = 'question' | 'answer' | 'comment';
type FlaggedSubTabType = 'questions' | 'answers' | 'comments';
type TabType = 'flagged' | 'appeals' | 'deleted';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<TabType>('flagged');
  const [flaggedSubTab, setFlaggedSubTab] = useState<FlaggedSubTabType>('questions');
  const [appealModResponse, setAppealModResponse] = useState<Record<string, string>>({});
  const [processingAppeal, setProcessingAppeal] = useState<string | null>(null);

  const {
    flaggedContent,
    appeals,
    deletedContent,
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
    handleRestoreContent,
  } = useModeratorDashboard();

  // Check if user is moderator or admin
  const isModerator = user.role === 'moderator' || user.role === 'admin';

  if (!isModerator) {
    return <Navigate to='/home' />;
  }

  const getContentTitle = (
    item: Record<string, unknown>,
    contentType: FlaggableContentType,
  ): string => {
    if (contentType === 'question') {
      return typeof item.title === 'string' ? item.title : 'Untitled Question';
    }
    const text = typeof item.text === 'string' ? item.text : '';
    return text || (contentType === 'answer' ? 'Answer' : 'Comment');
  };

  const getContentText = (item: Record<string, unknown>): string => {
    if (typeof item.text === 'string') return item.text;
    if (typeof item.title === 'string') return item.title;
    return 'No content';
  };

  const getContentTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      question: 'blue',
      answer: 'green',
      comment: 'purple',
      message: 'orange',
    };
    return colorMap[type] || 'gray';
  };

  const getAuthor = (item: Record<string, unknown>): string => {
    return (
      (typeof item.askedBy === 'string' ? item.askedBy : null) ||
      (typeof item.ansBy === 'string' ? item.ansBy : null) ||
      (typeof item.commentBy === 'string' ? item.commentBy : null) ||
      'Unknown'
    );
  };

  const getDate = (item: Record<string, unknown>): Date => {
    return (
      (item.askDateTime instanceof Date ? item.askDateTime : null) ||
      (item.ansDateTime instanceof Date ? item.ansDateTime : null) ||
      (item.commentDateTime instanceof Date ? item.commentDateTime : null) ||
      new Date()
    );
  };

  const renderFlaggedItem = (item: FlaggedContentItem, contentType: FlaggableContentType) => {
    const title = getContentTitle(item.content, contentType);
    const text = getContentText(item.content);
    const author = getAuthor(item.content);
    const date = getDate(item.content);

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

  const renderAppealItem = (appeal: AppealItem) => {
    const { content, contentType, appealUser, _id: appealId, timestamp } = appeal;
    const title = getContentTitle(content, contentType);
    const text = getContentText(content);
    const deletedInfo = content.deleted as
      | { deleteReason?: string; deletedBy?: string }
      | undefined;

    return (
      <Card key={`appeal-${appealId}`} className='appeal-card'>
        <CardHeader>
          <VStack align='start' gap={1} flex={1}>
            <HStack>
              <Badge colorScheme='blue'>APPEAL</Badge>
              <Badge colorScheme='red'>{contentType.toUpperCase()}</Badge>
            </HStack>
            <Heading size='sm'>{title}</Heading>
            <Text className='appeal-meta'>
              Appealed by {appealUser} • {getMetaData(new Date(timestamp))}
            </Text>
            {deletedInfo && (
              <Text className='appeal-deleted-info'>
                Deleted by {deletedInfo.deletedBy || 'Unknown'} • Reason:{' '}
                {deletedInfo.deleteReason || 'No reason provided'}
              </Text>
            )}
          </VStack>
        </CardHeader>
        <CardBody>
          <Box className='appeal-content-box'>
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <VStack align='start' gap={2} className='appeal-reason-section'>
            <Text className='appeal-reason-label'>Appeal Reason:</Text>
            <Box className='appeal-reason-box'>
              <Text className='appeal-reason-text'>{appeal.reason}</Text>
            </Box>
          </VStack>
          <Box className='appeal-response-section'>
            <Text className='appeal-response-label'>Moderator Response (optional):</Text>
            <Textarea
              className='appeal-response-textarea'
              value={appealModResponse[appealId] || ''}
              onChange={e =>
                setAppealModResponse({ ...appealModResponse, [appealId]: e.target.value })
              }
              placeholder='Optional response to the user...'
              rows={3}
              disabled={processingAppeal === appealId}
            />
          </Box>
          <HStack gap={2} flexWrap='wrap'>
            <Button
              size='sm'
              colorScheme='green'
              variant='solid'
              onClick={async () => {
                setProcessingAppeal(appealId);
                await handleApproveAppeal(appealId, appealModResponse[appealId] || undefined);
                setAppealModResponse({ ...appealModResponse, [appealId]: '' });
                setProcessingAppeal(null);
              }}
              disabled={processingAppeal === appealId}
              loading={processingAppeal === appealId}
              loadingText='Approving...'>
              Approve Appeal
            </Button>
            <Button
              size='sm'
              colorScheme='red'
              variant='solid'
              onClick={async () => {
                setProcessingAppeal(appealId);
                await handleRejectAppeal(appealId, appealModResponse[appealId] || undefined);
                setAppealModResponse({ ...appealModResponse, [appealId]: '' });
                setProcessingAppeal(null);
              }}
              disabled={processingAppeal === appealId}
              loading={processingAppeal === appealId}
              loadingText='Rejecting...'>
              Reject Appeal
            </Button>
          </HStack>
        </CardBody>
      </Card>
    );
  };

  const renderDeletedItem = (item: {
    _id: string;
    contentType: FlaggableContentType;
    content: Record<string, unknown>;
    contentPreview: string;
    authorUsername: string;
    deleteReason: string;
    deletedAt: Date;
  }) => {
    const { _id: deletedId, contentType, content, authorUsername, deleteReason, deletedAt } = item;
    const text = getContentText(content);
    const title = getContentTitle(content, contentType);
    return (
      <Card key={`deleted-${deletedId}`} className='deleted-card'>
        <CardHeader>
          <HStack justify='space-between' align='start'>
            <VStack align='start' gap={1} flex={1}>
              <HStack>
                <Badge colorScheme='red'>DELETED</Badge>
                <Badge colorScheme={getContentTypeColor(contentType)}>
                  {contentType.toUpperCase()}
                </Badge>
              </HStack>
              <Heading size='sm'>{title}</Heading>
              <Text className='deleted-meta'>
                Posted by {authorUsername} • Deleted {getMetaData(new Date(deletedAt))}
              </Text>
              <Text className='deleted-reason'>Reason: {deleteReason}</Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box className='deleted-content-box'>
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <HStack gap={2} flexWrap='wrap'>
            <Button
              size='sm'
              colorScheme='green'
              variant='solid'
              onClick={() => handleRestoreContent(contentType, deletedId)}>
              Restore Content
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
          <HStack gap={2} className='main-tabs' mb={4}>
            <Button
              className={activeTab === 'flagged' ? 'main-tab main-tab-active' : 'main-tab'}
              onClick={() => setActiveTab('flagged')}>
              Flagged ({totalFlagged})
            </Button>
            <Button
              className={activeTab === 'appeals' ? 'main-tab main-tab-active' : 'main-tab'}
              onClick={() => setActiveTab('appeals')}>
              Appeals ({appeals.length})
            </Button>
            <Button
              className={activeTab === 'deleted' ? 'main-tab main-tab-active' : 'main-tab'}
              onClick={() => setActiveTab('deleted')}>
              Delete History ({deletedContent.length})
            </Button>
          </HStack>

          {activeTab === 'flagged' && (
            <Box>
              <HStack gap={2} mb={4}>
                <Button
                  size='sm'
                  className={`sub-tab ${flaggedSubTab === 'questions' ? 'sub-tab-active' : ''}`}
                  onClick={() => setFlaggedSubTab('questions')}>
                  Questions ({flaggedContent.questions.length})
                </Button>
                <Button
                  size='sm'
                  className={`sub-tab ${flaggedSubTab === 'answers' ? 'sub-tab-active' : ''}`}
                  onClick={() => setFlaggedSubTab('answers')}>
                  Answers ({flaggedContent.answers.length})
                </Button>
                <Button
                  size='sm'
                  className={`sub-tab ${flaggedSubTab === 'comments' ? 'sub-tab-active' : ''}`}
                  onClick={() => setFlaggedSubTab('comments')}>
                  Comments ({flaggedContent.comments.length})
                </Button>
              </HStack>

              <Box>
                {flaggedSubTab === 'questions' && (
                  <Box>
                    {flaggedContent.questions.length === 0 ? (
                      <Text className='empty-state'>No flagged questions</Text>
                    ) : (
                      flaggedContent.questions.map(item => renderFlaggedItem(item, 'question'))
                    )}
                  </Box>
                )}
                {flaggedSubTab === 'answers' && (
                  <Box>
                    {flaggedContent.answers.length === 0 ? (
                      <Text className='empty-state'>No flagged answers</Text>
                    ) : (
                      flaggedContent.answers.map(item => renderFlaggedItem(item, 'answer'))
                    )}
                  </Box>
                )}
                {flaggedSubTab === 'comments' && (
                  <Box>
                    {flaggedContent.comments.length === 0 ? (
                      <Text className='empty-state'>No flagged comments</Text>
                    ) : (
                      flaggedContent.comments.map(item => renderFlaggedItem(item, 'comment'))
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box>
            {activeTab === 'appeals' && (
              <Box>
                {appeals.length === 0 ? (
                  <Text className='empty-state'>No pending appeals</Text>
                ) : (
                  appeals.map(appeal => renderAppealItem(appeal))
                )}
              </Box>
            )}
            {activeTab === 'deleted' && (
              <Box>
                {deletedContent.length === 0 ? (
                  <Text className='empty-state'>No deleted content</Text>
                ) : (
                  deletedContent.map(item => renderDeletedItem(item))
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
