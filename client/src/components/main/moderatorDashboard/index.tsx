import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Badge,
  Card,
  Tabs,
  Spinner,
  Alert,
  Textarea,
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

type FlaggableContentType = 'question' | 'answer' | 'comment' | 'message';
type FlaggedSubTabType = 'questions' | 'answers' | 'comments' | 'messages';
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
    if (contentType === 'message') {
      return 'Global Message';
    }
    const text = typeof item.text === 'string' ? item.text : '';
    return text || (contentType === 'answer' ? 'Answer' : 'Comment');
  };

  const getContentText = (item: Record<string, unknown>): string => {
    if (typeof item.msg === 'string') return item.msg; // For messages
    if (typeof item.text === 'string') return item.text;
    if (typeof item.title === 'string') return item.title;
    return 'No content';
  };

  const getAuthor = (item: Record<string, unknown>): string => {
    if (typeof item.askedBy === 'string') return item.askedBy; // For questions
    if (typeof item.ansBy === 'string') return item.ansBy; // For answers
    if (typeof item.comBy === 'string') return item.comBy; // For comments
    if (typeof item.commentBy === 'string') return item.commentBy; // For comments (alternative)
    if (typeof item.from === 'string') return item.from; // For messages
    return 'Unknown';
  };

  const getDate = (item: Record<string, unknown>): Date => {
    if (item.askDateTime instanceof Date) return item.askDateTime; // For questions
    if (item.ansDateTime instanceof Date) return item.ansDateTime; // For answers
    if (item.comDateTime instanceof Date) return item.comDateTime; // For comments
    if (item.commentDateTime instanceof Date) return item.commentDateTime; // For comments (alternative)
    if (item.timestamp instanceof Date) return item.timestamp; // For messages
    if (typeof item.askDateTime === 'string') return new Date(item.askDateTime);
    if (typeof item.ansDateTime === 'string') return new Date(item.ansDateTime);
    if (typeof item.comDateTime === 'string') return new Date(item.comDateTime);
    if (typeof item.commentDateTime === 'string') return new Date(item.commentDateTime);
    if (typeof item.timestamp === 'string') return new Date(item.timestamp);
    return new Date();
  };

  const getContentTypeColor = (contentType: FlaggableContentType): string => {
    switch (contentType) {
      case 'question':
        return 'blue';
      case 'answer':
        return 'green';
      case 'comment':
        return 'purple';
      case 'message':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const renderFlaggedItem = (
    item: any,
    contentType: 'question' | 'answer' | 'comment',
    _index: number,
  ) => {
    const title = getContentTitle(item.content, contentType);
    const text = getContentText(item.content);
    const author = getAuthor(item.content);
    const date = getDate(item.content);

    return (
      <Card.Root key={`${contentType}-${item._id}`} mb={4} borderLeft="4px" borderColor="orange.500">
        <Card.Header>
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1} flex={1}>
              <HStack>
                <Badge colorScheme="orange">{contentType.toUpperCase()}</Badge>
                <Badge colorScheme="red">{item.flaggedBy.length} flag{item.flaggedBy.length !== 1 ? 's' : ''}</Badge>
              </HStack>
              <Heading size="sm">{title}</Heading>
              <Text fontSize="sm" color="gray.600">
                By {author} • {getMetaData(new Date(date))}
              </Text>
            </VStack>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Box mb={4} p={3} bg="gray.50" borderRadius="md" maxH="200px" overflowY="auto">
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <VStack align="start" gap={2} mb={4}>
            <Text fontSize="sm" fontWeight="bold">
              Flagged by:
            </Text>
            <HStack wrap="wrap" gap={2}>
              {item.flaggedBy.map((username: string, idx: number) => (
                <span key={idx} className='badge-user-outline'>
                  {username}
                </span>
              ))}
            </HStack>
            <Text className='flagged-date'>
              First flagged: {getMetaData(new Date(item.flaggedAt[0]))}
            </Text>
          </VStack>
          <HStack gap={2} flexWrap="wrap">
            {contentType === 'question' && (
              <Button
                className='btn-view-question'
                onClick={() => navigate(`/question/${item._id}`)}>
                View Question
              </Button>
            )}
            {contentType === 'message' && (
              <Button className='btn-view-message' onClick={() => navigate('/messages')}>
                View Messages
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
          </HStack>
        </Card.Body>
      </Card.Root>
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
      <Box p={8}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
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
      <Card.Root key={`appeal-${appealId}`} className='appeal-card'>
        <Card.Header>
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
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card.Root>
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
      <Card.Root key={`deleted-${deletedId}`} className='deleted-card'>
        <Card.Header>
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
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card.Root>
    );
  };

  const totalFlagged =
    flaggedContent.questions.length +
    flaggedContent.answers.length +
    flaggedContent.comments.length +
    flaggedContent.messages.length;

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Moderator Dashboard
          </Heading>
          <Text className='moderator-dashboard-subtitle'>
            Review and manage flagged content. Total flagged items: {totalFlagged}
          </Text>
        </Box>

        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => {
            setActiveTab(e.value as TabType);
            // Reset flagged subtab when switching away from flagged tab
            if (e.value !== 'flagged') {
              setFlaggedSubTab('questions');
            }
          }}
        >
          <Tabs.List>
            <Tabs.Trigger value="flagged">
              Flagged ({totalFlagged})
            </Tabs.Trigger>
            <Tabs.Trigger value="appeals">
              Appeals ({appeals.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="deleted">
              Delete History ({deletedContent.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="flagged">
            <Tabs.Root value={flaggedSubTab} onValueChange={(e) => setFlaggedSubTab(e.value as FlaggedSubTabType)}>
              <Tabs.List>
                <Tabs.Trigger value="questions">
                  Questions ({flaggedContent.questions.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="answers">
                  Answers ({flaggedContent.answers.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="comments">
                  Comments ({flaggedContent.comments.length})
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="questions">
                {flaggedContent.questions.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No flagged questions
                  </Text>
                ) : (
                  flaggedContent.questions.map((item, index) =>
                    renderFlaggedItem(item, 'question', index),
                  )
                )}
              </Tabs.Content>
              <Tabs.Content value="answers">
                {flaggedContent.answers.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No flagged answers
                  </Text>
                ) : (
                  flaggedContent.answers.map((item, index) => renderFlaggedItem(item, 'answer', index))
                )}
              </Tabs.Content>
              <Tabs.Content value="comments">
                {flaggedContent.comments.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No flagged comments
                  </Text>
                ) : (
                  flaggedContent.comments.map((item, index) =>
                    renderFlaggedItem(item, 'comment', index),
                  )
                )}
              </Tabs.Content>
            </Tabs.Root>
          </Tabs.Content>

          <Tabs.Content value="appeals">
            {appeals.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No pending appeals
              </Text>
            ) : (
              appeals.map(appeal => renderAppealItem(appeal))
            )}
          </Tabs.Content>

          <Tabs.Content value="deleted">
            {deletedContent.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No deleted content
              </Text>
            ) : (
              deletedContent.map(item => renderDeletedItem(item))
            )}
          </Tabs.Content>
        </Tabs.Root>
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
