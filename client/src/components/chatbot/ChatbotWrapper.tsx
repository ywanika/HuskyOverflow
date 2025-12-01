import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Input, Button, Text, IconButton } from '@chakra-ui/react';
import { createChatBotMessage } from 'react-chatbot-kit';
import config from './config';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import { useTheme } from '../../contexts/ThemeContext';

import type { ChatbotMessage, ChatbotActions, ChatbotState } from './types';

interface ChatbotWrapperProps {
  messageHistory?: ChatbotMessage[];
  saveMessages?: (messages: ChatbotMessage[]) => void;
  headerText?: string;
  placeholderText?: string;
  onClose?: () => void;
}

const ChatbotWrapper: React.FC<ChatbotWrapperProps> = ({
  messageHistory = [],
  saveMessages,
  headerText = 'Assistant',
  placeholderText = 'Type your message here...',
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<ChatbotActions | null>(null);
  const parseRef = useRef<((message: string) => void) | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'gray.800' : 'white';
  const headerBg = isDark ? 'blue.500' : 'blue.600';
  const inputBg = isDark ? 'gray.700' : 'white';
  const inputBorder = isDark ? 'gray.600' : 'gray.200';
  const botMessageBg = isDark ? 'blue.600' : 'blue.500';
  const userMessageBg = isDark ? 'gray.700' : 'gray.100';
  const textColor = isDark ? 'white' : 'gray.800';
  const botTextColor = 'white';
  const scrollbarBg = isDark ? 'gray.600' : 'gray.200';

  const createChatBotMessageWrapper = (
    message: string,
    options?: Record<string, unknown>,
  ): ChatbotMessage => {
    return createChatBotMessage(message, options as any) as ChatbotMessage;
  };

  const setStateWrapper = (updater: (prev: ChatbotState) => ChatbotState) => {
    setMessages(prevMessages => {
      const prevState: ChatbotState = {
        messages: prevMessages,
        currentFlow: null,
        userContext: '',
        selectedFeature: null,
        searchQuery: '',
        navigationTarget: null,
      };
      const newState = updater(prevState);
      const newMessages = newState.messages || prevMessages;
      return newMessages.map((msg: ChatbotMessage) => ({
        message: msg.message || '',
        type: msg.type === 'user' ? ('user' as const) : ('bot' as const),
        widget: msg.widget,
        payload: msg.payload,
      }));
    });
  };

  const handleActionsReady = (actions: ChatbotActions) => {
    actionsRef.current = actions;
  };

  const handleParseReady = (parse: (message: string) => void) => {
    parseRef.current = parse;
  };

  // Initialize messages
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0) {
      const convertedMessages: ChatbotMessage[] = messageHistory.map((msg: ChatbotMessage) => ({
        message: msg.message || '',
        type: (msg.type === 'user' ? 'user' : 'bot') as 'user' | 'bot',
        widget: msg.widget,
        payload: msg.payload,
      }));
      setMessages(convertedMessages);
    } else {
      const initialMessages: ChatbotMessage[] = config.initialMessages.map(
        (msg: { message: string; widget?: string; payload?: unknown }) => ({
          message: msg.message || '',
          type: 'bot' as const,
          widget: msg.widget,
          payload: msg.payload,
        }),
      );
      setMessages(initialMessages);
    }
  }, [messageHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (saveMessages && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  const handleSend = () => {
    if (!inputValue.trim() || !parseRef.current) return;

    const userMessage: ChatbotMessage = {
      message: inputValue.trim(),
      type: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');

    parseRef.current(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg: ChatbotMessage, index: number) => {
    if (msg.widget) {
      const widget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === msg.widget,
      );
      if (widget && widget.widgetFunc) {
        const WidgetComponent = widget.widgetFunc;
        return (
          <Box key={`widget-${index}`} my={2}>
            <WidgetComponent
              actionProvider={{ actions: actionsRef.current || ({} as ChatbotActions) }}
              setState={(updater: (prev: ChatbotState) => ChatbotState) => {
                setMessages(prev => {
                  const prevState: ChatbotState = {
                    messages: prev,
                    currentFlow: null,
                    userContext: '',
                    selectedFeature: null,
                    searchQuery: '',
                    navigationTarget: null,
                  };
                  const newState = updater(prevState);
                  return newState.messages || prev;
                });
              }}
              state={{
                messages,
                currentFlow: null,
                userContext: '',
                selectedFeature: null,
                searchQuery: '',
                navigationTarget: null,
              }}
              payload={msg.payload as { searchQuery?: string; maxResults?: number } | undefined}
            />
          </Box>
        );
      }
    }

    if (msg.type === 'bot') {
      return (
        <HStack key={`bot-${index}`} align='flex-start' justify='flex-start' my={2}>
          <Box
            bg={botMessageBg}
            color={botTextColor}
            px={4}
            py={2}
            borderRadius='lg'
            maxW='80%'
            wordBreak='break-word'>
            <Text fontSize='sm' whiteSpace='pre-wrap'>
              {msg.message}
            </Text>
          </Box>
        </HStack>
      );
    } else {
      return (
        <HStack key={`user-${index}`} align='flex-start' justify='flex-end' my={2}>
          <Box
            bg={userMessageBg}
            color={textColor}
            px={4}
            py={2}
            borderRadius='lg'
            maxW='80%'
            wordBreak='break-word'>
            <Text fontSize='sm' whiteSpace='pre-wrap'>
              {msg.message}
            </Text>
          </Box>
        </HStack>
      );
    }
  };

  // Component that receives actions from ActionProvider and parse from MessageParser
  const IntegrationComponent = ({
    actions,
    parse,
  }: {
    actions?: ChatbotActions;
    parse?: (message: string) => void;
  }) => {
    useEffect(() => {
      if (actions) {
        actionsRef.current = actions;
        handleActionsReady(actions);
      }
    }, [actions]);

    useEffect(() => {
      if (parse) {
        parseRef.current = parse;
        handleParseReady(parse);
      }
    }, [parse]);

    return null;
  };

  return (
    <Box
      height='100%'
      display='flex'
      flexDirection='column'
      bg={bgColor}
      borderRadius='lg'
      overflow='hidden'>
      {/* Initialize ActionProvider and MessageParser */}
      <Box
        position='absolute'
        left='-9999px'
        width={1}
        height={1}
        overflow='hidden'
        pointerEvents='none'>
        <ActionProvider
          createChatBotMessage={createChatBotMessageWrapper}
          setState={setStateWrapper}>
          <MessageParser actions={actionsRef.current || ({} as ChatbotActions)}>
            <IntegrationComponent />
          </MessageParser>
        </ActionProvider>
      </Box>

      {/* Header */}
      <Box
        bg={headerBg}
        color='white'
        px={5}
        py={4}
        fontWeight='semibold'
        fontSize='lg'
        borderRadius='lg 0 0 0'
        flexShrink={0}
        display='flex'
        alignItems='center'
        justifyContent='space-between'>
        <Text>{headerText}</Text>
        {onClose && (
          <IconButton
            aria-label='Close chatbot'
            onClick={onClose}
            size='sm'
            variant='ghost'
            color='white'
            minW='32px'
            h='32px'
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
            _active={{ bg: 'rgba(255, 255, 255, 0.3)' }}>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{ display: 'block' }}>
              <path
                d='M18 6L6 18M6 6L18 18'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </IconButton>
        )}
      </Box>

      {/* Messages Container */}
      <Box
        flex='1'
        overflowY='auto'
        px={4}
        py={4}
        bg={bgColor}
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: scrollbarBg,
            borderRadius: '3px',
          },
        }}>
        <VStack gap={2} align='stretch'>
          {messages.map((msg, index) => renderMessage(msg, index))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Divider */}
      <Box borderTop='1px' borderColor={isDark ? 'gray.700' : 'gray.200'} />

      {/* Input Container */}
      <Box p={4} flexShrink={0} bg={bgColor}>
        <HStack gap={2}>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholderText}
            bg={inputBg}
            borderColor={inputBorder}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            _dark={{
              bg: 'gray.700',
              borderColor: 'gray.600',
              color: 'white',
              _placeholder: {
                color: 'gray.400',
              },
            }}
          />
          <Button
            onClick={handleSend}
            colorScheme='blue'
            px={6}
            disabled={!inputValue.trim()}
            _disabled={{
              opacity: 0.4,
              cursor: 'not-allowed',
            }}>
            Send
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default ChatbotWrapper;
