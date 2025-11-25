import { Box, Heading, Text, VStack, CardRoot as Card, CardBody } from '@chakra-ui/react';
import useUserContext from '../../hooks/useUserContext';
import './index.css';
import { Link } from 'react-router-dom';

/**
 * SuspendedPage component displays suspension/ban information to restricted users
 * This page has no navbar and shows the user why they cannot access the platform
 */
const SuspendedPage = () => {
  const { user } = useUserContext();

  const isBanned = user.isBanned;
  const suspendedUntil = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
  const reason = isBanned ? user.banReason : user.suspensionReason;

  return (
    <Box className='suspended-page-container'>
      <VStack gap={6} maxW='600px' mx='auto' mt={20}>
        <Card bg='red.50' borderColor='red.300' borderWidth='2px'>
          <CardBody>
            <VStack align='stretch' gap={4}>
              <Heading size='xl' color='red.700' textAlign='center'>
                {isBanned ? 'Account Banned' : 'Account Suspended'}
              </Heading>

              <Box>
                <Text fontSize='lg' fontWeight='semibold' mb={2}>
                  Your account has been {isBanned ? 'permanently banned' : 'suspended'}{' '}
                  {!isBanned && suspendedUntil && (
                    <>
                      until{' '}
                      <Text as='span' fontWeight='bold' color='red.600'>
                        {suspendedUntil.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </>
                  )}
                  .
                </Text>
              </Box>

              {reason && (
                <Box bg='white' p={4} borderRadius='md' borderWidth='1px' borderColor='gray.300'>
                  <Text fontWeight='semibold' mb={2}>
                    Reason:
                  </Text>
                  <Text>{reason}</Text>
                </Box>
              )}

              <Box bg='blue.50' p={4} borderRadius='md' borderWidth='1px' borderColor='blue.300'>
                <Text fontWeight='semibold' mb={2}>
                  Please review the community guidelines:
                </Text>
                <Text fontSize='sm'>
                  Our{' '}
                  <Link to='/guidelines' className='guidelines-link' target='_blank'>
                    Community Guidelines
                  </Link>{' '}
                  are in place to ensure a safe and respectful environment for all users. Violations
                  of these guidelines may result in temporary suspension or permanent ban from the
                  platform.
                </Text>
              </Box>

              {!isBanned && (
                <Box bg='blue.50' p={4} borderRadius='md' borderWidth='1px' borderColor='blue.300'>
                  <Text fontSize='sm'>
                    Your account will be automatically reactivated on{' '}
                    {suspendedUntil?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    .
                  </Text>
                </Box>
              )}

              {isBanned && (
                <Box bg='red.100' p={4} borderRadius='md' borderWidth='1px' borderColor='red.400'>
                  <Text fontSize='sm' fontWeight='semibold'>
                    This is a permanent ban. You will not be able to access this account again.
                  </Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default SuspendedPage;
