import { useState, useEffect, useRef } from 'react';
import ChatbotWrapper from './ChatbotWrapper';
import { Box, Button } from '@chakra-ui/react';
import { useTheme } from '../../contexts/ThemeContext';
import useUserContext from '../../hooks/useUserContext';
import config from './config';

const ChatbotPage = () => {
  const [showBot, setShowBot] = useState(true); // Show by default on chatbot page
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
      setChatbotKey((prev) => prev + 1);
    }
  }, [user?.username]);

  const saveMessages = (messages: any[], _HTMLString?: string) => {
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
          <ChatbotWrapper
            key={chatbotKey}
            messageHistory={loadMessages()}
            saveMessages={saveMessages}
            headerText='Assistant'
            placeholderText='Type your message here...'
          />
        </Box>
      )}
    </Box>
  );
};

export default ChatbotPage;

