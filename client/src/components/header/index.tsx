import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Input, Link } from '@chakra-ui/react';
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
    <header id='header' className='header' role='banner'>
      <div className='header-container'>
        <Heading as='h1' className='header-title'>
          <Link
            href='/home'
            className='header-link'
            aria-label='Fake Stack Overflow - Go to home'
            _hover={{ textDecoration: 'none' }}>
            Fake Stack Overflow
          </Link>
        </Heading>
        <Flex gap={6} align='center' flexShrink={0} role='search'>
          <Input
            id='searchBar'
            type='search'
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
      </div>
    </header>
  );
};

export default Header;