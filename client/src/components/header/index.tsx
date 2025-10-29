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
    <Box as='header' id='header' className='header' bg='gray.100' p={6} role='banner'>
      <Flex justify='space-between' align='center' maxW='100%'>
        <Heading as='h1' size='lg' color='black' flexShrink={0} mr={8}>
          <a
            href='/home'
            style={{ textDecoration: 'none', color: 'inherit' }}
            aria-label='Fake Stack Overflow - Go to home'>
            Fake Stack Overflow
          </a>
        </Heading>
        <Flex gap={6} align='center' flexShrink={0} role='search'>
          <Input
            id='searchBar'
            placeholder='Search questions, tags, users...'
            value={val}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            w='300px'
            flexShrink={0}
            aria-label='Search the site'
            aria-describedby='search-help'
          />
          <Box id='search-help' className='sr-only'>
            Press Enter to search. Use Tab to navigate to other options.
          </Box>
          <Button
            className='logout-button'
            onClick={handleSignOut}
            variant='outline'
            flexShrink={0}
            aria-label='Sign out of your account'>
            Log out
          </Button>
          <Button
            className='view-profile-button'
            onClick={() => navigate(`/user/${currentUser.username}`)}
            flexShrink={0}
            aria-label={`View profile for ${currentUser.username}`}>
            View Profile
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
