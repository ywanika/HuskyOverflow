import { useState, useEffect, useRef } from 'react';
import ChatbotWrapper from './ChatbotWrapper';
import type { ChatbotMessage } from './types';
import { Box, IconButton } from '@chakra-ui/react';
import { useTheme } from '../../contexts/ThemeContext';
import useUserContext from '../../hooks/useUserContext';
import config from './config';

const FloatingChatbot = () => {
  const [showBot, setShowBot] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96); // Default header height
  const { theme } = useTheme();
  const { user } = useUserContext();
  const isDark = theme === 'dark';
  const previousUsernameRef = useRef<string | null>(null);
  const [chatbotKey, setChatbotKey] = useState(0); // Force re-render on user change

  // Get user-specific localStorage key
  const getStorageKey = (username: string) => `chatbot_messages_${username}`;

  // Reset chatbot when user changes (new login)
  useEffect(() => {
    if (user && user.username !== previousUsernameRef.current) {
      // Clear old messages for new user session
      if (previousUsernameRef.current) {
        // Clear previous user's messages if switching users
        const oldKey = getStorageKey(previousUsernameRef.current);
        localStorage.removeItem(oldKey);
      }

      // Clear current user's messages to start fresh session on login
      const currentKey = getStorageKey(user.username);
      localStorage.removeItem(currentKey);

      // Also clear session flag to indicate new login
      localStorage.removeItem(`chatbot_session_${user.username}`);

      // Update ref and force chatbot re-render
      previousUsernameRef.current = user.username;
      setChatbotKey(prev => prev + 1);
    }
  }, [user]);

  // Measure header height for positioning
  useEffect(() => {
    const measureHeader = () => {
      const header = document.getElementById('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    measureHeader();
    window.addEventListener('resize', measureHeader);
    return () => window.removeEventListener('resize', measureHeader);
  }, []);

  // Prevent body scroll when chatbot is open
  useEffect(() => {
    if (showBot) {
      document.body.classList.add('chatbot-open');
    } else {
      document.body.classList.remove('chatbot-open');
    }
    return () => {
      document.body.classList.remove('chatbot-open');
    };
  }, [showBot]);

  const saveMessages = (messages: ChatbotMessage[], _HTMLString?: string) => {
    if (!user) return;
    const storageKey = getStorageKey(user.username);
    localStorage.setItem(storageKey, JSON.stringify(messages));
    // Mark that user has started a session
    localStorage.setItem(`chatbot_session_${user.username}`, 'true');
  };

  const loadMessages = () => {
    if (!user) return [];

    // Check if this is a new session (no session flag)
    const sessionKey = `chatbot_session_${user.username}`;
    const hasSession = localStorage.getItem(sessionKey);

    // If no session exists, return empty to trigger initial messages
    if (!hasSession) {
      return [];
    }

    // Otherwise, load saved messages for this user
    const storageKey = getStorageKey(user.username);
    const messages = localStorage.getItem(storageKey);
    if (messages) {
      try {
        const parsed = JSON.parse(messages);
        // Only return if we have messages (not just initial ones)
        // If empty or only initial messages, return empty to show fresh greeting
        if (parsed.length > config.initialMessages.length) {
          return parsed;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  return (
    <>
      {/* Floating Button */}
      <Box
        position='fixed'
        bottom='24px'
        right='24px'
        zIndex={1000}
        className='floating-chatbot-button-container'>
        <IconButton
          aria-label={showBot ? 'Close chatbot assistant' : 'Open chatbot assistant'}
          onClick={() => setShowBot(prev => !prev)}
          size='lg'
          borderRadius='full'
          bg={isDark ? 'blue.500' : 'blue.600'}
          color='white'
          _hover={{
            bg: isDark ? 'blue.600' : 'blue.700',
            transform: 'scale(1.05)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          boxShadow='lg'
          transition='all 0.2s'
          className='floating-chatbot-button'>
          {showBot ? (
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M18 6L6 18M6 6L18 18'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          ) : (
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}
        </IconButton>
      </Box>

      {/* Chatbot Modal */}
      {showBot && (
        <Box
          position='fixed'
          top={`${headerHeight}px`}
          right='24px'
          width='380px'
          height={`calc(100vh - ${headerHeight + 24}px)`}
          maxHeight='600px'
          zIndex={1001}
          className='floating-chatbot-modal'
          bg={isDark ? 'gray.800' : 'white'}
          border='1px'
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          borderRadius='lg'
          boxShadow='2xl'
          display='flex'
          flexDirection='column'>
          <ChatbotWrapper
            key={chatbotKey}
            messageHistory={loadMessages()}
            saveMessages={saveMessages}
            headerText='Assistant'
            placeholderText='Type your message here...'
            onClose={() => setShowBot(false)}
          />
        </Box>
      )}
    </>
  );
};

export default FloatingChatbot;
