import { useNavigate } from 'react-router-dom';
import { Box, Heading, Input, Button, Flex } from '@chakra-ui/react';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  return (
    <Box as="header" id='header' className='header' bg="gray.100" p={6}>
      <Flex justify="space-between" align="center" maxW="100%">
        <Heading as="h1" size="lg" color="black" flexShrink={0} mr={8}>
          Fake Stack Overflow
        </Heading>
        <Flex gap={6} align="center" flexShrink={0}>
          <Input
            id='searchBar'
            placeholder='Search ...'
            value={val}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            w="300px"
            flexShrink={0}
          />
          <Button onClick={handleSignOut} colorScheme="blue" variant="outline" flexShrink={0}>
            Log out
          </Button>
          <Button
            onClick={() => navigate(`/user/${currentUser.username}`)}
            colorScheme="blue"
            flexShrink={0}>
            View Profile
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
