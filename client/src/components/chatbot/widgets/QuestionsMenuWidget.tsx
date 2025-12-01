import React from 'react';
import { Button, VStack, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { BaseWidgetProps } from '../types';

type QuestionsMenuWidgetProps = BaseWidgetProps;

const QuestionsMenuWidget: React.FC<QuestionsMenuWidgetProps> = ({
  actionProvider,
  setState: _setState,
  scrollIntoView,
}) => {
  const navigate = useNavigate();

  const options = [
    { label: 'Browse all questions', action: 'browseAll', route: '/home' },
    { label: 'Search by tags', action: 'searchTags', route: '/tags' },
    { label: 'Find unanswered questions', action: 'unanswered', route: '/home?filter=unanswered' },
    { label: 'Ask a new question', action: 'askNew', route: '/new/question' },
    { label: 'View my questions', action: 'myQuestions', route: null }, // Will need username
  ];

  const handleOptionClick = (option: (typeof options)[0]) => {
    if (option.route) {
      navigate(option.route);
    } else if (actionProvider?.actions) {
      const actionName = `handle${option.action.charAt(0).toUpperCase() + option.action.slice(1)}`;
      const action = actionProvider.actions[actionName];
      if (action && typeof action === 'function') {
        (action as () => void)();
      }
    }
    if (scrollIntoView) {
      setTimeout(() => scrollIntoView(), 100);
    }
  };

  return (
    <Box p={4} bg='gray.50' borderRadius='md' _dark={{ bg: 'gray.700' }}>
      <Text mb={3} fontWeight='semibold' fontSize='sm'>
        What would you like to do with questions?
      </Text>
      <VStack gap={2} align='stretch'>
        {options.map((option, index) => (
          <Button
            key={index}
            size='sm'
            variant='outline'
            colorScheme='blue'
            onClick={() => handleOptionClick(option)}
            _hover={{ bg: 'blue.50', _dark: { bg: 'blue.900' } }}
            justifyContent='flex-start'
            textAlign='left'>
            {option.label}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

export default QuestionsMenuWidget;
