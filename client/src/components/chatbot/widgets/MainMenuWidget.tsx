import React from 'react';
import { Button, VStack, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface MainMenuWidgetProps {
  actionProvider?: any;
  setState?: (updater: (prev: any) => any) => void;
  scrollIntoView?: () => void;
  state?: any;
}

const MainMenuWidget: React.FC<MainMenuWidgetProps> = ({ actionProvider, setState, scrollIntoView }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  let user: { username: string } | null = null;
  try {
    user = useUserContext().user;
  } catch {
    // User context not available, continue without user
  }

  const menuOptions = [
    { label: 'Browse Questions', action: 'browseQuestions', route: '/home', actionName: 'handleQuestionsFlow' },
    { label: 'Ask a Question', action: 'askQuestion', route: '/new/question', actionName: 'handleAskQuestion' },
    { label: 'Join Communities', action: 'communities', route: '/communities', actionName: 'handleCommunitiesFlow' },
    { label: 'Play Games', action: 'games', route: '/games', actionName: 'handleGamesFlow' },
    { label: 'Send Messages', action: 'messaging', route: '/messaging', actionName: 'handleMessagingFlow' },
    {
      label: 'View Collections',
      action: 'collections',
      route: user ? `/collections/${user.username}` : null,
      actionName: 'handleCollectionsFlow',
    },
    {
      label: 'Manage Profile',
      action: 'profile',
      route: user ? `/user/${user.username}` : null,
      actionName: 'handleProfileFlow',
    },
    { label: 'Help & Support', action: 'help', route: null, actionName: 'handleHelp' },
  ];

  const handleMenuClick = (option: typeof menuOptions[0]) => {
    if (option.route) {
      navigate(option.route);
    } else if (actionProvider?.actions && option.actionName) {
      // Trigger action if available
      const action = actionProvider.actions[option.actionName];
      if (action) {
        action();
      }
    }
    if (scrollIntoView) {
      setTimeout(() => scrollIntoView(), 100);
    }
  };

  return (
    <Box p={4} bg={isDark ? 'gray.900' : 'gray.50'} borderRadius='md' border={isDark ? '1px solid' : 'none'} borderColor={isDark ? 'gray.700' : 'transparent'}>
      <Text mb={3} fontWeight='semibold' fontSize='sm' color={isDark ? 'white' : 'gray.800'}>
        What would you like to do?
      </Text>
      <VStack spacing={2} align='stretch'>
        {menuOptions.map((option, index) => (
          <Button
            key={index}
            size='sm'
            variant='outline'
            colorScheme='blue'
            onClick={() => handleMenuClick(option)}
            bg={isDark ? 'gray.700' : 'white'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
            color={isDark ? 'white' : 'gray.800'}
            _hover={{ 
              bg: isDark ? 'gray.600' : 'blue.50',
              borderColor: isDark ? 'gray.500' : 'blue.300'
            }}
            justifyContent='flex-start'
            textAlign='left'>
            {option.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default MainMenuWidget;

