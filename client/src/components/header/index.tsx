import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Input, Link } from '@chakra-ui/react';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';
import ThemeToggleButton from '../layout/ThemeToggleButton';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <header id='header' className='header' role='banner'>
      <div className='header-container'>
        <Heading as='h1' className='header-title'>
          <Link

  const isDark = theme === 'dark';

  return (
    <Box
      as='header'
      id='header'
      className='header'
      bg={isDark ? 'gray.800' : 'gray.100'}
      p={6}
      role='banner'>
      <Flex justify='space-between' align='center' maxW='100%'>
        <Heading as='h1' size='lg' color={isDark ? 'white' : 'black'} flexShrink={0} mr={8}>
          <a
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
            bg={isDark ? 'gray.700' : 'white'}
            color={isDark ? 'white' : 'black'}
            borderColor={isDark ? 'gray.600' : 'gray.200'}
            _placeholder={{ color: isDark ? 'gray.400' : 'gray.500' }}
          />
          <Box id='search-help' className='sr-only'>
            Press Enter to search. Use Tab to navigate to other options.
          </Box>
          <ThemeToggleButton />
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