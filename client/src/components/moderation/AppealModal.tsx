import { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Textarea, AlertRoot as Alert } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { submitAppeal, checkExistingAppeal } from '../../services/moderationService';
import profanityService from '../../services/profanityService';
import { checkGuidelinesAgreement } from '../../services/guidelinesCheck';
import useUserContext from '../../hooks/useUserContext';
import './AppealModal.css';

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'question' | 'answer' | 'comment';
  contentId: string;
}

/**
 * Modal component for submitting appeals for deleted content
 */
const AppealModal = ({ isOpen, onClose, contentType, contentId }: AppealModalProps) => {
  const { user } = useUserContext();
  const [appealReason, setAppealReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingAppeal, setHasExistingAppeal] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (isOpen && user?.username && contentId) {
      checkExistingAppeal(contentId, user.username)
        .then(result => {
          setHasExistingAppeal(result.exists);
        })
        .catch(() => {
          // Silently handle error
        });
    }
  }, [isOpen, user?.username, contentId]);

  useEffect(() => {
    const count = appealReason.length;
    setCharCount(count);
    const words = appealReason
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWordCount(words.length);
  }, [appealReason]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user?.username) {
      setError('You must be logged in to submit an appeal');
      return;
    }

    // Check guidelines agreement
    try {
      checkGuidelinesAgreement(user.agreedToGuidelines);
    } catch (err) {
      setError((err as Error).message);
      return;
    }

    // Validate length
    if (appealReason.length < 50 || appealReason.length > 500) {
      setError('Appeal reason must be between 50 and 500 characters');
      return;
    }

    // Validate word count
    const words = appealReason
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    if (words.length < 3) {
      setError('Appeal reason must contain at least 3 words');
      return;
    }

    // Check for profanity
    try {
      await profanityService(appealReason);
    } catch (err) {
      setError((err as Error).message || 'Profanity detected in appeal reason');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitAppeal(contentId, contentType, user.username, appealReason.trim());
      setAppealReason('');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit appeal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAppealReason('');
    setError('');
    setHasExistingAppeal(false);
    onClose();
  };

  const isReasonValid = charCount >= 50 && charCount <= 500 && wordCount >= 3;

  return (
    <Box className='appeal-modal-overlay' onClick={handleCancel}>
      <Box
        className='appeal-modal-content'
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-labelledby='appeal-modal-title'
        aria-describedby='appeal-modal-description'>
        <VStack gap={4} align='stretch'>
          <Text id='appeal-modal-title' className='appeal-modal-title'>
            Appeal Deletion
          </Text>

          <Text id='appeal-modal-description' className='appeal-modal-description'>
            Submit an appeal to request review of your deleted {contentType}. Please explain why you
            believe your content aligns with the{' '}
            <RouterLink to='/guidelines' target='_blank' className='appeal-modal-link'>
              community guidelines
            </RouterLink>
            .
          </Text>

          {hasExistingAppeal && (
            <Alert className='appeal-modal-alert'>
              <Text>
                You have already submitted an appeal for this content. You can only appeal once per
                post.
              </Text>
            </Alert>
          )}

          <Box>
            <Text className='appeal-modal-label'>
              Appeal Reason <span className='appeal-modal-required'>*</span>
            </Text>
            <Textarea
              className='appeal-modal-textarea'
              value={appealReason}
              onChange={e => {
                setAppealReason(e.target.value);
                setError('');
              }}
              placeholder='Explain why your content aligns with the community guidelines (50-500 characters, minimum 3 words)...'
              rows={6}
              required
              disabled={hasExistingAppeal || isSubmitting}
              aria-label='Appeal reason'
              aria-describedby='appeal-reason-help'
            />
            <HStack justify='space-between' mt={1}>
              <Text id='appeal-reason-help' className='appeal-modal-help-text'>
                {charCount < 50
                  ? `Minimum 50 characters (${charCount}/50)`
                  : charCount > 500
                    ? `Maximum 500 characters exceeded (${charCount}/500)`
                    : `${charCount}/500 characters`}
                {wordCount < 3 && ` • Minimum 3 words (${wordCount}/3)`}
              </Text>
              <Text
                className={`appeal-modal-word-count ${
                  isReasonValid
                    ? 'appeal-modal-word-count-valid'
                    : 'appeal-modal-word-count-invalid'
                }`}>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </Text>
            </HStack>
          </Box>

          {error && (
            <Text className='appeal-modal-error' role='alert'>
              {error}
            </Text>
          )}

          <HStack className='appeal-modal-button-group'>
            <button
              type='button'
              className='appeal-modal-button appeal-modal-button-cancel'
              onClick={handleCancel}
              disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type='button'
              className='appeal-modal-button appeal-modal-button-submit'
              onClick={handleSubmit}
              disabled={!isReasonValid || hasExistingAppeal || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default AppealModal;
