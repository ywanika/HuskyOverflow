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
  Spinner,
  CardRoot as Card,
  CardBody,
  CardHeader,
  AlertRoot as Alert,
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
      <Card key={`${contentType}-${item._id}`} mb={4} borderLeft='4px' borderColor='orange.500'>
        <CardHeader>
          <HStack justify='space-between' align='start'>
            <VStack align='start' gap={1} flex={1}>
              <HStack>
                <Badge colorScheme='orange'>{contentType.toUpperCase()}</Badge>
                <Badge colorScheme='red'>
                  {item.flaggedBy.length} flag{item.flaggedBy.length !== 1 ? 's' : ''}
                </Badge>
              </HStack>
              <Heading size='sm'>{title}</Heading>
              <Text fontSize='sm' color='gray.600'>
                By {author} • {getMetaData(new Date(date))}
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box mb={4} p={3} bg='gray.50' borderRadius='md' maxH='200px' overflowY='auto'>
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </Box>
          <VStack align='start' gap={2} mb={4}>
            <Text fontSize='sm' fontWeight='bold'>
              Flagged by:
            </Text>
            <HStack wrap='wrap' gap={2}>
              {item.flaggedBy.map((username: string, idx: number) => (
                <Badge key={idx} colorScheme='orange' variant='outline'>
                  {username}
                </Badge>
              ))}
            </HStack>
            <Text fontSize='xs' color='gray.500'>
              First flagged: {getMetaData(new Date(item.flaggedAt[0]))}
            </Text>
          </VStack>
          <HStack gap={2} flexWrap='wrap'>
            {contentType === 'question' && (
              <Button
                size='sm'
                colorScheme='blue'
                variant='outline'
                onClick={() => navigate(`/question/${item._id}`)}>
                View Question
              </Button>
            )}
            <Button
              size='sm'
              colorScheme='green'
              variant='outline'
              onClick={() => handleMarkAsReviewed(contentType, item._id)}>
              Mark as Reviewed
            </Button>
            <Button
              size='sm'
              colorScheme='orange'
              variant='outline'
              onClick={() => handleDismissFlag(contentType, item._id)}>
              Dismiss Flag
            </Button>
            <Button
              size='sm'
              colorScheme='red'
              variant='outline'
              onClick={() => handleDeleteClick(contentType, item._id, title)}>
              Delete
            </Button>
          </HStack>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box p={8} textAlign='center'>
        <Spinner size='xl' />
        <Text mt={4}>Loading flagged content...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
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
    <Box p={8}>
      <VStack align='stretch' gap={6}>
        <Box>
          <Heading size='lg' mb={2}>
            Moderator Dashboard
          </Heading>
          <Text color='gray.600'>
            Review and manage flagged content and appeals. Total flagged items: {totalFlagged},
            Pending appeals: {appeals.length}
          </Text>
        </Box>

        <Box>
          <HStack gap={2} mb={4} borderBottom='1px' borderColor='gray.200'>
            <Button
              variant={activeTab === 'questions' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'questions' ? 'blue' : 'gray'}
              onClick={() => setActiveTab('questions')}>
              Questions ({flaggedContent.questions.length})
            </Button>
            <Button
              variant={activeTab === 'answers' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'answers' ? 'blue' : 'gray'}
              onClick={() => setActiveTab('answers')}>
              Answers ({flaggedContent.answers.length})
            </Button>
            <Button
              variant={activeTab === 'comments' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'comments' ? 'blue' : 'gray'}
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
                  <Text color='gray.500' textAlign='center' py={8}>
                    No flagged questions
                  </Text>
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
                  <Text color='gray.500' textAlign='center' py={8}>
                    No flagged answers
                  </Text>
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
                  <Text color='gray.500' textAlign='center' py={8}>
                    No flagged comments
                  </Text>
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
