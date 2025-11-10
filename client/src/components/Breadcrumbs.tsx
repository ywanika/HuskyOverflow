import { useLocation } from 'react-router-dom';
import { Box, Text, Link } from '@chakra-ui/react';
import { useTheme } from '../contexts/ThemeContext';

const Breadcrumbs = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');

  const getBreadcrumbLabel = (segment: string, index: number) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');

    switch (segment) {
      case 'home':
        return { label: 'Home', path: '/home' };
      case 'tags':
        return { label: 'Tags', path: '/tags' };
      case 'users':
        return { label: 'Users', path: '/users' };
      case 'games':
        return { label: 'Games', path: '/games' };
      case 'communities':
        return { label: 'Communities', path: '/communities' };
      case 'messaging':
        return { label: 'Messaging', path: '/messaging' };
      case 'collections':
        return { label: 'Collections', path: path };
      case 'question':
        return { label: 'Question', path: path };
      case 'new':
        return { label: 'New', path: path };
      default:
        return { label: segment, path: path };
    }
  };

  // Hide breadcrumbs for main pages to avoid redundant text above headers
  const mainPages = ['home', 'tags', 'users', 'games', 'communities', 'messaging', 'questions'];
  // Also hide breadcrumbs for user-specific pages to avoid showing usernames
  const userSpecificPages = ['collections', 'user'];
  // Hide breadcrumbs for new form pages to avoid showing "New / Question", "New / Collection", "New / Community"
  const newFormPages = ['question', 'collection', 'community'];
  
  if (pathSegments.length === 0 || 
      (pathSegments.length === 1 && mainPages.includes(pathSegments[0])) ||
      (pathSegments.length === 2 && userSpecificPages.includes(pathSegments[0])) ||
      (pathSegments.length === 2 && pathSegments[0] === 'new' && newFormPages.includes(pathSegments[1]))) {
    return null;
  }

  return (
    <Box as='nav' aria-label='Breadcrumb' mb={4}>
      <Text fontSize='sm' color={isDark ? 'gray.400' : 'gray.600'}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap' }}>
          {pathSegments.map((segment, index) => {
            const { label, path } = getBreadcrumbLabel(segment, index);
            const isLast = index === pathSegments.length - 1;

            return (
              <li key={path} style={{ display: 'flex', alignItems: 'center' }}>
                {index > 0 && (
                  <Text
                    as='span'
                    mx={2}
                    color={isDark ? 'gray.600' : 'gray.400'}
                    aria-hidden='true'>
                    /
                  </Text>
                )}
                {isLast ? (
                  <Text
                    as='span'
                    fontWeight='bold'
                    color={isDark ? 'white' : 'gray.900'}
                    aria-current='page'>
                    {label}
                  </Text>
                ) : (
                  <Link href={path} color='blue.500' textDecoration='underline'>
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Text>
    </Box>
  );
};

export default Breadcrumbs;
