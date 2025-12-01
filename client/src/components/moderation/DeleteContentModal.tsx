import { useState, useEffect } from 'react';
import { Button, Box, Text, VStack, HStack, Textarea } from '@chakra-ui/react';

interface DeleteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteReason: string) => Promise<void>;
  contentType: 'question' | 'answer' | 'comment' | 'message';
  contentTitle?: string;
}

/**
 * Modal component for confirming content deletion by moderators
 */
const DeleteContentModal = ({
  isOpen,
  onClose,
  onConfirm,
  contentType,
  contentTitle,
}: DeleteContentModalProps) => {
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; error?: Error } | null>(
    null,
  );

  // Handle state updates after async operation completes
  useEffect(() => {
    if (deleteResult) {
      if (deleteResult.success) {
        setDeleteReason('');
        setIsDeleting(false);
        onClose();
      } else {
        setError(deleteResult.error?.message || 'Failed to delete content');
        setIsDeleting(false);
      }
      setDeleteResult(null);
    }
  }, [deleteResult, onClose]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await onConfirm(deleteReason.trim());
      // Use setTimeout to defer state update, allowing React to batch it properly
      setTimeout(() => {
        setDeleteResult({ success: true });
      }, 0);
    } catch (err) {
      // Use setTimeout to defer state update, allowing React to batch it properly
      setTimeout(() => {
        setDeleteResult({ success: false, error: err as Error });
      }, 0);
    }
  };

  const handleCancel = () => {
    setDeleteReason('');
    setError('');
    onClose();
  };

  return (
    <Box
      position='fixed'
      top='0'
      left='0'
      right='0'
      bottom='0'
      bg='var(--color-overlay)'
      display='flex'
      alignItems='center'
      justifyContent='center'
      zIndex={1000}
      onClick={handleCancel}>
      <Box
        bg='white'
        p={6}
        borderRadius='md'
        maxW='500px'
        w='90%'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-labelledby='delete-modal-title'
        aria-describedby='delete-modal-description'>
        <VStack gap={4} align='stretch'>
          <Text id='delete-modal-title' fontSize='xl' fontWeight='bold'>
            Delete {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </Text>

          {contentTitle && (
            <Text id='delete-modal-description' color='gray.600'>
              Are you sure you want to delete this {contentType}?
              {contentTitle && (
                <>
                  <br />
                  <strong>{contentTitle}</strong>
                </>
              )}
            </Text>
          )}

          <Box>
            <Text mb={2} fontWeight='semibold'>
              Reason for deletion <span style={{ color: 'red' }}>*</span>
            </Text>
            <Textarea
              value={deleteReason}
              onChange={e => {
                setDeleteReason(e.target.value);
                setError('');
              }}
              placeholder='Enter the reason for deleting this content...'
              rows={4}
              required
              aria-label='Delete reason'
              aria-describedby='delete-reason-help'
            />
            <Text id='delete-reason-help' fontSize='sm' color='gray.500' mt={1}>
              This reason will be sent to the content creator
            </Text>
          </Box>

          {error && (
            <Text color='red.500' role='alert'>
              {error}
            </Text>
          )}

          <HStack gap={4} justify='flex-end'>
            <Button onClick={handleCancel} variant='outline' disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              colorScheme='red'
              loading={isDeleting}
              loadingText='Deleting...'>
              Delete
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default DeleteContentModal;
