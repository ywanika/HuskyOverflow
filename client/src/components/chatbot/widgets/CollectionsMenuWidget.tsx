import React from 'react';
import { Button, VStack, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import type { BaseWidgetProps } from '../types';

type CollectionsMenuWidgetProps = BaseWidgetProps;

const CollectionsMenuWidget: React.FC<CollectionsMenuWidgetProps> = ({
  actionProvider,
  setState: _setState,
  scrollIntoView,
}) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const options = [
    {
      label: 'View my collections',
      action: 'viewMyCollections',
      route: user ? `/collections/${user.username}` : null,
    },
    { label: 'Create new collection', action: 'createNew', route: '/new/collection' },
    { label: 'Browse public collections', action: 'browsePublic', route: null },
    { label: 'Add questions to collection', action: 'addToCollection', route: null },
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
        What would you like to do with collections?
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

export default CollectionsMenuWidget;
