import React from 'react';
import { Button, VStack, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { BaseWidgetProps } from '../types';

type GamesMenuWidgetProps = BaseWidgetProps;

const GamesMenuWidget: React.FC<GamesMenuWidgetProps> = ({
  actionProvider,
  setState,
  scrollIntoView,
}) => {
  const navigate = useNavigate();

  const options = [
    { label: 'View available games', action: 'viewGames', route: '/games' },
    { label: 'Create new game', action: 'createGame', route: '/games' },
    { label: 'Join existing game', action: 'joinGame', route: '/games' },
    { label: 'Learn about Nim', action: 'learnNim', route: null },
  ];

  const handleOptionClick = (option: (typeof options)[0]) => {
    if (option.route) {
      navigate(option.route);
    } else if (actionProvider?.actions) {
      const actionName = `handle${option.action.charAt(0).toUpperCase() + option.action.slice(1)}`;
      if (actionProvider.actions[actionName]) {
        actionProvider.actions[actionName]();
      }
    }
    if (scrollIntoView) {
      setTimeout(() => scrollIntoView(), 100);
    }
  };

  return (
    <Box p={4} bg='gray.50' borderRadius='md' _dark={{ bg: 'gray.700' }}>
      <Text mb={3} fontWeight='semibold' fontSize='sm'>
        What would you like to do with games?
      </Text>
      <VStack spacing={2} align='stretch'>
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

export default GamesMenuWidget;
