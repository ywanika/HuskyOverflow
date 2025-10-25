import './index.css';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import SideBarNav from '../main/sideBarNav';
import Header from '../header';
import Breadcrumbs from '../Breadcrumbs';

/**
 * Main component represents the layout of the main page, including a sidebar and the main content area.
 */
const Layout = () => (
  <Box h="100vh" display="flex" flexDirection="column">
    {/* Skip links for accessibility */}
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <a href="#navigation" className="skip-link">Skip to navigation</a>
    
    <Header />
    <Flex flex="1" overflow="hidden">
      <Box w="300px" minW="300px" bg="white" borderRight="1px" borderColor="gray.200" p={4} id="navigation" role="navigation" aria-label="Main navigation">
        <SideBarNav />
      </Box>
      <Box flex="1" overflow="auto" p={8} bg="white" id="main-content" role="main" aria-label="Main content">
        <Breadcrumbs />
        <Outlet />
      </Box>
    </Flex>
  </Box>
);

export default Layout;
