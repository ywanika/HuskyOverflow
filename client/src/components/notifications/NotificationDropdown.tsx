import { Box, Text, Button, VStack, HStack, IconButton, Flex } from '@chakra-ui/react';
import { DatabaseNotification } from '@fake-stack-overflow/shared';

interface NotificationDropdownProps {
  notifications: DatabaseNotification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

/**
 * Notification dropdown component that displays list of notifications
 */
const NotificationDropdown = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationDropdownProps) => {
  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'gray.100';
    switch (type) {
      case 'deletion':
        return 'red.50';
      case 'flag':
        return 'orange.50';
      case 'suspension':
        return 'red.100';
      case 'role_change':
        return 'blue.50';
      default:
        return 'white';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now.getTime() - time.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return time.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <Box
      position='absolute'
      top='100%'
      right='0'
      mt={2}
      w='400px'
      maxH='500px'
      bg='white'
      border='1px'
      borderColor='gray.200'
      borderRadius='md'
      boxShadow='lg'
      zIndex={1000}
      overflow='hidden'
      role='dialog'
      aria-label='Notifications'
      aria-modal='false'>
      <Flex
        justify='space-between'
        align='center'
        p={4}
        borderBottom='1px'
        borderColor='gray.200'
        bg='gray.50'>
        <Text fontWeight='bold' fontSize='lg'>
          Notifications
        </Text>
        <HStack gap={2}>
          {notifications.length > 0 && (
            <Button
              size='xs'
              variant='ghost'
              onClick={async () => {
                await onMarkAllAsRead();
              }}
              aria-label='Mark all as read'>
              ✓
            </Button>
          )}
          <IconButton aria-label='Close notifications' onClick={onClose} size='xs' variant='ghost'>
            ✕
          </IconButton>
        </HStack>
      </Flex>

      <Box overflowY='auto' maxH='450px'>
        {notifications.length === 0 ? (
          <Box p={8} textAlign='center'>
            <Text color='gray.500'>No notifications</Text>
          </Box>
        ) : (
          <VStack align='stretch' gap={0}>
            {notifications.map((notification, index) => (
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              <Box key={notification._id.toString()}>
                <Box
                  p={4}
                  bg={getNotificationColor(notification.type, notification.isRead)}
                  _hover={{ bg: 'gray.50' }}
                  borderLeft={notification.isRead ? 'none' : '3px solid'}
                  borderLeftColor={
                    notification.type === 'deletion'
                      ? 'red.500'
                      : notification.type === 'flag'
                        ? 'orange.500'
                        : 'blue.500'
                  }>
                  <HStack justify='space-between' align='start' gap={2}>
                    <Box flex='1'>
                      <Text
                        fontSize='sm'
                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                        color={notification.isRead ? 'gray.600' : 'gray.900'}
                        mb={1}>
                        {notification.message}
                      </Text>
                      <Text fontSize='xs' color='gray.500'>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </Box>
                    <HStack gap={1}>
                      {!notification.isRead && (
                        <IconButton
                          aria-label='Mark as read'
                          onClick={async () => {
                            // eslint-disable-next-line @typescript-eslint/no-base-to-string
                            await onMarkAsRead(notification._id.toString());
                          }}
                          size='xs'
                          variant='ghost'>
                          ✓
                        </IconButton>
                      )}
                      <IconButton
                        aria-label='Delete notification'
                        onClick={async () => {
                          // eslint-disable-next-line @typescript-eslint/no-base-to-string
                          await onDelete(notification._id.toString());
                        }}
                        size='xs'
                        variant='ghost'
                        colorScheme='red'>
                        🗑️
                      </IconButton>
                    </HStack>
                  </HStack>
                </Box>
                {index < notifications.length - 1 && (
                  <Box borderBottom='1px' borderColor='gray.200' />
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default NotificationDropdown;
