import { useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useModeratorDashboard from '../../../hooks/useModeratorDashboard';
import useUserContext from '../../../hooks/useUserContext';
import DeleteContentModal from '../../moderation/DeleteContentModal';
import { getMetaData } from '../../../tool';
import { Navigate } from 'react-router-dom';
import './index.css';

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  
  // Check if user is moderator or admin
  const isModerator = user.role === 'moderator' || user.role === 'admin';
  
  if (!isModerator) {
    return <Navigate to="/home" />;
  }
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

  const getContentTitle = (item: any, contentType: 'question' | 'answer' | 'comment'): string => {
    if (contentType === 'question') {
      return item.title || 'Untitled Question';
    } else if (contentType === 'answer') {
      return item.text?.substring(0, 50) || 'Answer';
    } else {
      return item.text?.substring(0, 50) || 'Comment';
    }
  };

  const getContentText = (item: any): string => {
    if (item.text) {
      return item.text;
    }
    if (item.title) {
      return item.title;
    }
    return 'No content';
  };

  const renderFlaggedItem = (
    item: any,
    contentType: 'question' | 'answer' | 'comment',
    _index: number,
  ) => {
    const title = getContentTitle(item.content, contentType);
    const text = getContentText(item.content);
    const author = item.content.askedBy || item.content.ansBy || item.content.commentBy || 'Unknown';
    const date =
      item.content.askDateTime || item.content.ansDateTime || item.content.commentDateTime || new Date();

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
                <Badge key={idx} colorScheme="orange" variant="outline">
                  {username}
                </Badge>
              ))}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              First flagged: {getMetaData(new Date(item.flaggedAt[0]))}
            </Text>
          </VStack>
          <HStack gap={2} flexWrap="wrap">
            {contentType === 'question' && (
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => navigate(`/question/${item._id}`)}>
                View Question
              </Button>
            )}
            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              onClick={() => handleMarkAsReviewed(contentType, item._id)}>
              Mark as Reviewed
            </Button>
            <Button
              size="sm"
              colorScheme="orange"
              variant="outline"
              onClick={() => handleDismissFlag(contentType, item._id)}>
              Dismiss Flag
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
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
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading flagged content...</Text>
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

  const totalFlagged =
    flaggedContent.questions.length + flaggedContent.answers.length + flaggedContent.comments.length;

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Moderator Dashboard
          </Heading>
          <Text color="gray.600">
            Review and manage flagged content. Total flagged items: {totalFlagged}
          </Text>
        </Box>

        <Tabs.Root defaultValue="questions">
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

