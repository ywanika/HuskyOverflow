import { useLocation } from 'react-router-dom';
import { Box, Text, Link } from '@chakra-ui/react';

const Breadcrumbs = () => {
  const location = useLocation();
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

  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'home')) {
    return null;
  }

  return (
    <Box as="nav" aria-label="Breadcrumb" mb={4}>
      <Text fontSize="sm" color="gray.600">
        {pathSegments.map((segment, index) => {
          const { label, path } = getBreadcrumbLabel(segment, index);
          const isLast = index === pathSegments.length - 1;
          
          return (
            <span key={path}>
              {isLast ? (
                <Text as="span" fontWeight="bold" color="gray.900">
                  {label}
                </Text>
              ) : (
                <>
                  <Link href={path} color="blue.500" textDecoration="underline">
                    {label}
                  </Link>
                  <Text as="span" mx={2} color="gray.400">
                    /
                  </Text>
                </>
              )}
            </span>
          );
        })}
      </Text>
    </Box>
  );
};

export default Breadcrumbs;
