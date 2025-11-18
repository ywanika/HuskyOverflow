import { useState, useEffect } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import { Box, IconButton } from '@chakra-ui/react';
import { useTheme } from '../../contexts/ThemeContext';
import './FloatingChatbot.css';

const FloatingChatbot = () => {
  const [showBot, setShowBot] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const saveMessages = (messages: any[], _HTMLString?: string) => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages));
  };

  const loadMessages = () => {
    const messages = localStorage.getItem('chatbot_messages');
    if (messages) {
      try {
        return JSON.parse(messages);
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
          onClick={() => setShowBot((prev) => !prev)}
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
          bottom='100px'
          right='24px'
          width='380px'
          height='600px'
          zIndex={1001}
          className='floating-chatbot-modal'
          bg={isDark ? 'gray.800' : 'white'}
          border='1px'
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          borderRadius='lg'
          boxShadow='2xl'
          display='flex'
          flexDirection='column'>
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
            messageHistory={loadMessages()}
            saveMessages={saveMessages}
            headerText='FakeStackOverflow Assistant'
            placeholderText='Type your message here...'
          />
        </Box>
      )}
    </>
  );
};

export default FloatingChatbot;

