import { useState, useEffect, useRef } from 'react';
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';
import { createChatBotMessage } from 'react-chatbot-kit';
import config from './config';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  message: string;
  type: 'user' | 'bot';
  widget?: string;
  payload?: any;
}

interface CustomChatbotProps {
  messageHistory?: any[];
  saveMessages?: (messages: any[]) => void;
  headerText?: string;
  placeholderText?: string;
}

const CustomChatbot: React.FC<CustomChatbotProps> = ({
  messageHistory = [],
  saveMessages,
  headerText = 'Assistant',
  placeholderText = 'Type your message here...',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<any>(null);
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

  // Create message wrapper
  const createChatBotMessageWrapper = (message: string, options?: any) => {
    return createChatBotMessage(message, options);
  };

  // State wrapper that updates messages
  const setStateWrapper = (updater: (prev: any) => any) => {
    setMessages((prevMessages) => {
      const prevState = { messages: prevMessages };
      const newState = updater(prevState);
      const newMessages = newState.messages || prevMessages;
      return newMessages.map((msg: any) => ({
        message: msg.message || '',
        type: msg.type === 'user' ? 'user' : 'bot',
        widget: msg.widget,
        payload: msg.payload,
      }));
    });
  };

  // Initialize messages
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0) {
      const convertedMessages = messageHistory.map((msg: any) => ({
        message: msg.message || '',
        type: msg.type === 'user' ? 'user' : 'bot',
        widget: msg.widget,
        payload: msg.payload,
      }));
      setMessages(convertedMessages);
    } else {
      // Use initial messages from config
      const initialMessages = config.initialMessages.map((msg: any) => ({
        message: msg.message || '',
        type: 'bot' as const,
        widget: msg.widget,
        payload: msg.payload,
      }));
      setMessages(initialMessages);
    }
  }, [messageHistory]);

  // Initialize actions and parser
  useEffect(() => {
    // Create a component to capture actions and parse function
    let capturedActions: any = null;
    let capturedParse: ((message: string) => void) | null = null;

    const ActionsCapture = ({ actions }: { actions: any }) => {
      useEffect(() => {
        capturedActions = actions;
        actionsRef.current = actions;
      }, [actions]);
      return null;
    };

    const ParseCapture = ({ parse }: { parse: (message: string) => void }) => {
      useEffect(() => {
        capturedParse = parse;
        parseRef.current = parse;
      }, [parse]);
      return null;
    };

    // Render ActionProvider and MessageParser to capture their functions
    const provider = (
      <ActionProvider createChatBotMessage={createChatBotMessageWrapper} setState={setStateWrapper}>
        <MessageParser actions={capturedActions || {}}>
          <ActionsCapture actions={capturedActions || {}} />
          <ParseCapture parse={capturedParse || (() => {})} />
        </MessageParser>
      </ActionProvider>
    );
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages
  useEffect(() => {
    if (saveMessages && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      message: inputValue.trim(),
      type: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue('');

    // Use the parse function if available
    if (parseRef.current) {
      parseRef.current(messageToSend);
    } else {
      // Fallback: create actions on the fly
      const tempActions: any = {};
      const TestChild = ({ parse }: { parse: (msg: string) => void }) => {
        useEffect(() => {
          parse(messageToSend);
        }, []);
        return null;
      };

      const parser = (
        <ActionProvider createChatBotMessage={createChatBotMessageWrapper} setState={setStateWrapper}>
          <MessageParser actions={tempActions}>
            <TestChild parse={() => {}} />
          </MessageParser>
        </ActionProvider>
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg: Message, index: number) => {
    if (msg.widget) {
      const widget = config.widgets.find((w: any) => w.widgetName === msg.widget);
      if (widget && widget.widgetFunc) {
        const WidgetComponent = widget.widgetFunc;
        return (
          <Box key={`widget-${index}`} my={2}>
            <WidgetComponent
              actionProvider={{ actions: actionsRef.current }}
              setState={(updater: any) => {
                setMessages((prev) => {
                  const prevState = { messages: prev };
                  const newState = updater(prevState);
                  return newState.messages || prev;
                });
              }}
              state={{ messages }}
              payload={msg.payload}
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

  return (
    <Box
      height='100%'
      display='flex'
      flexDirection='column'
      bg={bgColor}
      borderRadius='lg'
      overflow='hidden'>
      {/* Header */}
      <Box
        bg={headerBg}
        color='white'
        px={5}
        py={4}
        fontWeight='semibold'
        fontSize='lg'
        borderRadius='lg 0 0 0'
        flexShrink={0}>
        {headerText}
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
        <VStack spacing={2} align='stretch'>
          {messages.map((msg, index) => renderMessage(msg, index))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Divider */}
      <Box borderTop='1px' borderColor={isDark ? 'gray.700' : 'gray.200'} />

      {/* Input Container */}
      <Box p={4} flexShrink={0} bg={bgColor}>
        <HStack spacing={2}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
            isDisabled={!inputValue.trim()}
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

export default CustomChatbot;
