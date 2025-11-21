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
            Review and manage flagged content. Total flagged items: {totalFlagged}
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
