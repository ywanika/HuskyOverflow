import { useState, useRef, useEffect } from 'react';
import { Box, Badge, IconButton } from '@chakra-ui/react';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../../hooks/useNotifications';
import useUserContext from '../../hooks/useUserContext';

/**
 * Notification bell component that displays unread count and opens notification dropdown
 */
const NotificationBell = () => {
  const { socket } = useUserContext();
  const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification: handleDelete } =
    useNotifications(socket);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Box position="relative" ref={dropdownRef}>
      <IconButton
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        position="relative"
        size="md">
        🔔
      </IconButton>
      {unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          colorScheme="red"
          borderRadius="full"
          fontSize="xs"
          minW="18px"
          h="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-label={`${unreadCount} unread notifications`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
};

export default NotificationBell;

