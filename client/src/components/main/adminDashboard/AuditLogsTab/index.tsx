import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Badge,
  Button,
  AlertRoot as Alert,
  AlertDescription,
  Field,
  Input,
  HStack,
} from '@chakra-ui/react';
import { getAuditLogs, AuditLog } from '../../../../services/adminService';
import useUserContext from '../../../../hooks/useUserContext';
import { getMetaData } from '../../../../tool';
import './index.css';

/**
 * AuditLogsTab provides an interface for administrators to view audit logs.
 * Administrators can filter logs by admin username, action type, target user, and date range.
 */
const AuditLogsTab = () => {
  const { user } = useUserContext();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [adminUsernameFilter, setAdminUsernameFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [targetUserFilter, setTargetUserFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Action types for filter dropdown
  const actionTypes = [
    'view_dashboard_metrics',
    'view_audit_logs',
    'suspend_user',
    'ban_user',
    'promote_to_moderator',
    'promote_to_admin',
    'demote_to_user',
    'delete_question',
    'delete_answer',
    'delete_comment',
    'delete_message',
  ];

  const fetchLogs = useCallback(async () => {
    if (!user?.username) return;

    setLoading(true);
    setError(null);

    try {
      const filters: {
        adminUsername?: string;
        actionType?: string;
        targetUser?: string;
        startDate?: string;
        endDate?: string;
      } = {};

      if (adminUsernameFilter.trim()) {
        filters.adminUsername = adminUsernameFilter.trim();
      }
      if (actionTypeFilter) {
        filters.actionType = actionTypeFilter;
      }
      if (targetUserFilter.trim()) {
        filters.targetUser = targetUserFilter.trim();
      }
      if (startDateFilter) {
        filters.startDate = startDateFilter;
      }
      if (endDateFilter) {
        filters.endDate = endDateFilter;
      }

      const auditLogs = await getAuditLogs(user.username, filters);
      setLogs(auditLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [
    user?.username,
    adminUsernameFilter,
    actionTypeFilter,
    targetUserFilter,
    startDateFilter,
    endDateFilter,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearFilters = () => {
    setAdminUsernameFilter('');
    setActionTypeFilter('');
    setTargetUserFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const formatActionType = (actionType: string): string => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <VStack align='stretch' gap={6}>
      <Box>
        <Heading size='md' mb={2}>
          Audit Logs
        </Heading>
        <Text color='gray.600' fontSize='sm'>
          View all administrative actions performed on the platform
        </Text>
      </Box>

      {/* Filters */}
      <Box p={4} borderWidth='1px' borderRadius='md' bg='gray.50'>
        <Heading size='sm' mb={4}>
          Filters
        </Heading>
        <VStack align='stretch' gap={4}>
          <HStack gap={4} flexWrap='wrap'>
            <Field.Root flex='1' minW='200px'>
              <Field.Label>Admin Username</Field.Label>
              <Input
                placeholder='Admin Username'
                value={adminUsernameFilter}
                onChange={e => setAdminUsernameFilter(e.target.value)}
              />
            </Field.Root>
            <Field.Root flex='1' minW='200px'>
              <Field.Label>Action Type</Field.Label>
              <select
                className='audit-logs-select'
                value={actionTypeFilter}
                onChange={e => setActionTypeFilter(e.target.value)}>
                <option value=''>All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {formatActionType(action)}
                  </option>
                ))}
              </select>
            </Field.Root>
            <Field.Root flex='1' minW='200px'>
              <Field.Label>Target User</Field.Label>
              <Input
                placeholder='Target User'
                value={targetUserFilter}
                onChange={e => setTargetUserFilter(e.target.value)}
              />
            </Field.Root>
          </HStack>
          <HStack gap={4} flexWrap='wrap'>
            <Field.Root flex='1' minW='200px'>
              <Field.Label>Start Date</Field.Label>
              <Input
                type='date'
                value={startDateFilter}
                onChange={e => setStartDateFilter(e.target.value)}
              />
            </Field.Root>
            <Field.Root flex='1' minW='200px'>
              <Field.Label>End Date</Field.Label>
              <Input
                type='date'
                value={endDateFilter}
                onChange={e => setEndDateFilter(e.target.value)}
              />
            </Field.Root>
            <HStack gap={2}>
              <Button colorScheme='blue' onClick={fetchLogs}>
                Apply Filters
              </Button>
              <Button variant='outline' onClick={handleClearFilters}>
                Clear
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert status='error'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box textAlign='center' py={8}>
          <Spinner size='lg' />
          <Text mt={4} color='gray.600'>
            Loading audit logs...
          </Text>
        </Box>
      )}

      {/* Audit Logs Table */}
      {!loading && !error && (
        <Box overflowX='auto'>
          {logs.length === 0 ? (
            <Box textAlign='center' py={8}>
              <Text color='gray.600'>No audit logs found</Text>
            </Box>
          ) : (
            <table className='audit-logs-table'>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target User</th>
                  <th>Target Content</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <Text fontSize='sm'>{getMetaData(new Date(log.timestamp))}</Text>
                    </td>
                    <td>
                      <Badge colorPalette='blue'>{log.adminUsername}</Badge>
                    </td>
                    <td>
                      <Badge colorPalette='purple'>{formatActionType(log.actionType)}</Badge>
                    </td>
                    <td>
                      {log.targetUser ? (
                        <Text fontSize='sm'>{log.targetUser}</Text>
                      ) : (
                        <Text fontSize='sm' color='gray.400'>
                          N/A
                        </Text>
                      )}
                    </td>
                    <td>
                      {log.targetContent ? (
                        <Text fontSize='sm' title={log.targetContent}>
                          {log.targetContent.length > 30
                            ? `${log.targetContent.substring(0, 30)}...`
                            : log.targetContent}
                        </Text>
                      ) : (
                        <Text fontSize='sm' color='gray.400'>
                          N/A
                        </Text>
                      )}
                    </td>
                    <td>
                      {log.reason ? (
                        <Text fontSize='sm' title={log.reason}>
                          {log.reason.length > 30
                            ? `${log.reason.substring(0, 30)}...`
                            : log.reason}
                        </Text>
                      ) : (
                        <Text fontSize='sm' color='gray.400'>
                          N/A
                        </Text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default AuditLogsTab;
