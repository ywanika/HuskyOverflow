import './index.css';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 */
const Layout = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Box h='100vh' display='flex' flexDirection='column' bg={isDark ? 'gray.900' : 'white'}>
      {/* Skip links for accessibility */}
      <a href='#main-content' className='skip-link'>
        Skip to main content
      </a>
      <a href='#navigation' className='skip-link'>
        Skip to navigation
      </a>

      <Header />
      <Flex flex='1' overflow='hidden' role='complementary' aria-label='Main application area'>
        <Box
          w='300px'
          minW='300px'
          bg={isDark ? 'gray.800' : 'white'}
          borderRight='1px'
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          p={4}
          id='navigation'
          role='navigation'
          aria-label='Main navigation'
          as='nav'>
          <SideBarNav />
        </Box>
        <Box
          flex='1'
          overflow='auto'
          p={8}
          bg={isDark ? 'gray.900' : 'white'}
          color={isDark ? 'white' : 'black'}
          id='main-content'
          role='main'
          aria-label='Main content'
          as='main'>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
