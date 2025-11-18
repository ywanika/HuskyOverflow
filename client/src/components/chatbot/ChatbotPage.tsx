import { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import { Box, Button } from '@chakra-ui/react';
import { useTheme } from '../../contexts/ThemeContext';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [showBot, setShowBot] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <Box
      p={8}
      minH='100vh'
      bg={isDark ? 'gray.900' : 'white'}
      color={isDark ? 'white' : 'black'}>
      <Box mb={4}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Chatbot Assistant
        </h1>
        <p style={{ marginBottom: '1rem', color: isDark ? 'gray.300' : 'gray.600' }}>
          Get help with FakeStackOverflow features and navigation.
        </p>
        <Button
          onClick={() => setShowBot((prev) => !prev)}
          colorScheme='blue'
          size='lg'
          mb={4}>
          {showBot ? 'Hide Chatbot' : 'Show Chatbot'}
        </Button>
      </Box>

      {showBot && (
        <Box
          maxW='800px'
          mx='auto'
          border='1px'
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          borderRadius='md'
          overflow='hidden'
          bg={isDark ? 'gray.800' : 'white'}>
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
    </Box>
  );
};

export default ChatbotPage;

