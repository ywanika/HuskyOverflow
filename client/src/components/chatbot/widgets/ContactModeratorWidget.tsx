import React, { useState } from 'react';
import {
  Box,
  Text,
  Textarea,
  Button,
  VStack,
  AlertRoot as Alert,
  AlertDescription,
} from '@chakra-ui/react';
import { useTheme } from '../../../contexts/ThemeContext';
import useUserContext from '../../../hooks/useUserContext';
import contactModerator from '../../../services/chatbotService';
import type { BaseWidgetProps, ChatbotState } from '../types';

interface ContactModeratorWidgetProps extends BaseWidgetProps {
  onSubmit?: () => void;
}

const ContactModeratorWidget: React.FC<ContactModeratorWidgetProps> = ({
  setState,
  scrollIntoView,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const { user } = useUserContext();
  const isDark = theme === 'dark';
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!user) {
      setError('You must be logged in to contact a moderator');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await contactModerator(user.username, message.trim());
      setSuccess(true);
      setMessage('');

      // Add bot confirmation message
      if (setState) {
        const confirmationMessage = {
          message: 'Your message has been sent to a moderator.',
          type: 'bot' as const,
        };

        setState((prev: ChatbotState) => ({
          ...prev,
          messages: [...prev.messages, confirmationMessage],
        }));
      }

      // Reset success message after 3 seconds to allow another message
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      // Call onSubmit callback if provided
      if (onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 1500);
      }

      if (scrollIntoView) {
        setTimeout(() => scrollIntoView(), 100);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      p={4}
      bg={isDark ? 'gray.900' : 'gray.50'}
      borderRadius='md'
      border={isDark ? '1px solid' : 'none'}
      borderColor={isDark ? 'gray.700' : 'transparent'}>
      <Text mb={3} fontWeight='semibold' fontSize='sm' color={isDark ? 'white' : 'gray.800'}>
        Contact a Moderator
      </Text>
      <Text mb={3} fontSize='xs' color={isDark ? 'gray.400' : 'gray.600'}>
        Send a message to the moderation team. They will review your message and respond if needed.
      </Text>

      {success && (
        <Alert status='success' mb={3} borderRadius='md'>
          <AlertDescription>Your message has been sent to a moderator.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert status='error' mb={3} borderRadius='md'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VStack gap={3} align='stretch'>
        <Textarea
          value={message}
          onChange={e => {
            setMessage(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          placeholder='Enter your message here...'
          minH='120px'
          bg={isDark ? 'gray.800' : 'white'}
          borderColor={isDark ? 'gray.600' : 'gray.200'}
          color={isDark ? 'white' : 'gray.800'}
          _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px blue.500',
          }}
          disabled={isSubmitting}
        />

        <Button
          colorScheme='blue'
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!message.trim() || success}
          size='sm'>
          Send Message
        </Button>
      </VStack>
    </Box>
  );
};

export default ContactModeratorWidget;
