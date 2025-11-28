import { useState } from 'react';
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
  Textarea,
  HStack,
  Input,
  RadioGroup,
} from '@chakra-ui/react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useUserManagement from '../../../../hooks/useUserManagement';
import './index.css';

const VIOLATION_REASONS = ['Hate Speech', 'Spam', 'Harassment', 'Other'];
const SUSPENSION_DURATIONS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

/**
 * UserManagementTab provides an interface for administrators to manage users.
 * Administrators can suspend or ban users, promote or demote user roles.
 */

const UserManagementTab = () => {
  const {
    users,
    loading,
    error,
    actionMessage,
    handleSuspendUser: suspendUserAction,
    handleBanUser: banUserAction,
    handlePromoteToModerator,
    handlePromoteToAdmin,
    handleDemoteToUser,
    handleCreateUser,
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState<SafeDatabaseUser | null>(null);

  // Suspend modal state
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState<number>(1);
  const [suspendReason, setSuspendReason] = useState<string>('Spam');

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState<string>('');
  const [banViolationType, setBanViolationType] = useState<string>('Spam');

  // Create user form state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [createUserConfirmOpen, setCreateUserConfirmOpen] = useState(false);
  const [createUserResultOpen, setCreateUserResultOpen] = useState(false);
  const [createUserResult, setCreateUserResult] = useState<{
    success: boolean;
    message: string;
    username?: string;
    password?: string;
  }>({
    success: false,
    message: '',
  });

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    const success = await suspendUserAction(selectedUser.username, suspendDuration, suspendReason);
    if (success) {
      setSuspendModalOpen(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    const success = await banUserAction(selectedUser.username, banViolationType, banReason);
    if (success) {
      setBanModalOpen(false);
      setBanReason('');
    }
  };

  const handleCreateUserClick = () => {
    setCreateUserConfirmOpen(true);
  };

  const handleCreateUserConfirm = async () => {
    setCreateUserConfirmOpen(false);
    const validationResult = await handleCreateUser(
      newUsername.trim(),
      newPassword,
      confirmPassword,
      selectedRole,
    );

    if (validationResult.success) {
      setCreateUserResult({
        success: true,
        message: `User ${newUsername.trim()} created successfully`,
        username: newUsername.trim(),
        password: newPassword,
      });
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setSelectedRole('user');
    } else {
      setCreateUserResult({
        success: false,
        message: validationResult.message || 'Failed to create user',
      });
    }
    setCreateUserResultOpen(true);
  };

  if (loading) {
    return (
      <Box p={8} textAlign='center'>
        <Spinner size='xl' />
        <Text mt={4}>Loading users...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status='error'>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className='user-management-container'>
      <VStack align='stretch' gap={4}>
        <Box>
          <Heading size='md' mb={1} className='user-management-header'>
            User Management
          </Heading>
          <Text className='user-management-subtitle'>Manage user roles and access</Text>
        </Box>

        {actionMessage.text && (
          <Alert status={actionMessage.type}>
            <AlertDescription>{actionMessage.text}</AlertDescription>
          </Alert>
        )}

        {/* Create New User Section */}
        <Box className='create-user-section'>
          <Heading size='sm' mb={3} className='create-user-header'>
            Create a New User
          </Heading>
          <VStack align='stretch' gap={3}>
            <Field.Root>
              <Field.Label>New Username</Field.Label>
              <Input
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder='Enter username'
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>New Password</Field.Label>
              <Input
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder='Enter password'
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Confirm Password</Field.Label>
              <Input
                type='password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder='Confirm password'
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Role</Field.Label>
              <RadioGroup.Root
                value={selectedRole}
                onValueChange={details =>
                  setSelectedRole(details.value as 'user' | 'moderator' | 'admin')
                }>
                <HStack gap={4}>
                  <RadioGroup.Item value='user'>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>User</RadioGroup.ItemText>
                  </RadioGroup.Item>
                  <RadioGroup.Item value='moderator'>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>Moderator</RadioGroup.ItemText>
                  </RadioGroup.Item>
                  <RadioGroup.Item value='admin'>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>Admin</RadioGroup.ItemText>
                  </RadioGroup.Item>
                </HStack>
              </RadioGroup.Root>
            </Field.Root>

            <Button colorPalette='blue' onClick={handleCreateUserClick}>
              Create a new user
            </Button>
          </VStack>
        </Box>

        <Box overflowX='auto'>
          <table className='user-management-table'>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isSuspended =
                  user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
                const isBanned = user.isBanned;
                const isModerator = user.role === 'moderator' || user.role === 'admin';

                return (
                  <tr key={user._id.toString()}>
                    <td>
                      <Text className={`username-cell ${isModerator ? 'moderator' : ''}`}>
                        {user.username}
                      </Text>
                    </td>
                    <td>
                      <Badge
                        colorPalette={
                          user.role === 'admin'
                            ? 'red'
                            : user.role === 'moderator'
                              ? 'blue'
                              : 'gray'
                        }>
                        {user.role || 'user'}
                      </Badge>
                    </td>
                    <td>
                      {isBanned ? (
                        <Badge colorPalette='red'>Banned</Badge>
                      ) : isSuspended ? (
                        <Badge colorPalette='orange'>Suspended</Badge>
                      ) : (
                        <Badge colorPalette='green'>Active</Badge>
                      )}
                    </td>
                    <td>
                      <div className='action-buttons'>
                        {user.role !== 'admin' && (
                          <>
                            {!isBanned && (
                              <Button
                                colorPalette='orange'
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSuspendModalOpen(true);
                                }}>
                                Suspend
                              </Button>
                            )}
                            <Button
                              colorPalette='red'
                              onClick={() => {
                                setSelectedUser(user);
                                setBanModalOpen(true);
                              }}>
                              Ban
                            </Button>
                          </>
                        )}
                        {user.role === 'user' && !isSuspended && !isBanned && (
                          <Button
                            colorPalette='blue'
                            onClick={() => handlePromoteToModerator(user.username)}>
                            → Mod
                          </Button>
                        )}
                        {user.role === 'moderator' && (
                          <>
                            <Button
                              colorPalette='purple'
                              onClick={() => handlePromoteToAdmin(user.username)}>
                              → Admin
                            </Button>
                            <Button
                              colorPalette='gray'
                              onClick={() => handleDemoteToUser(user.username)}>
                              → User
                            </Button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <Button
                            colorPalette='gray'
                            onClick={() => handleDemoteToUser(user.username)}>
                            → User
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </VStack>

      {/* Suspend Modal */}
      {suspendModalOpen && (
        <Box className='modal-overlay' onClick={() => setSuspendModalOpen(false)}>
          <Box
            className='modal-content'
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-labelledby='suspend-modal-title'>
            <VStack align='stretch' gap={4}>
              <Text id='suspend-modal-title' fontSize='xl' fontWeight='bold'>
                Suspend User: {selectedUser?.username}
              </Text>

              <Field.Root>
                <Field.Label>Suspension Duration</Field.Label>
                <select
                  value={suspendDuration}
                  onChange={e => setSuspendDuration(Number(e.target.value))}
                  className='modal-select'>
                  {SUSPENSION_DURATIONS.map(duration => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </Field.Root>

              <Field.Root>
                <Field.Label>Violation Reason</Field.Label>
                <select
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  className='modal-select'>
                  {VIOLATION_REASONS.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </Field.Root>

              <HStack gap={4} justify='flex-end'>
                <Button onClick={() => setSuspendModalOpen(false)} variant='outline'>
                  Cancel
                </Button>
                <Button colorPalette='orange' onClick={handleSuspendUser}>
                  Suspend User
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Ban Modal */}
      {banModalOpen && (
        <Box className='modal-overlay' onClick={() => setBanModalOpen(false)}>
          <Box
            className='modal-content'
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-labelledby='ban-modal-title'>
            <VStack align='stretch' gap={4}>
              <Text id='ban-modal-title' fontSize='xl' fontWeight='bold'>
                Ban User: {selectedUser?.username}
              </Text>

              <Field.Root>
                <Field.Label>Violation Type</Field.Label>
                <select
                  value={banViolationType}
                  onChange={e => setBanViolationType(e.target.value)}
                  className='modal-select'>
                  {VIOLATION_REASONS.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </Field.Root>

              <Field.Root>
                <Field.Label>Ban Reason (minimum 20 characters)</Field.Label>
                <Textarea
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  placeholder='Provide detailed reason for ban...'
                  rows={4}
                />
                <Text
                  className={`ban-reason-counter ${banReason.length < 20 ? 'invalid' : 'valid'}`}>
                  {banReason.length} / 20 characters
                </Text>
              </Field.Root>

              <HStack gap={4} justify='flex-end'>
                <Button onClick={() => setBanModalOpen(false)} variant='outline'>
                  Cancel
                </Button>
                <Button
                  colorPalette='red'
                  onClick={() => {
                    setBanModalOpen(false);
                    handleBanUser();
                  }}
                  disabled={banReason.length < 20}>
                  Ban User Permanently
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Create User Confirmation Modal */}
      {createUserConfirmOpen && (
        <Box className='modal-overlay' onClick={() => setCreateUserConfirmOpen(false)}>
          <Box
            className='modal-content'
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-labelledby='create-user-confirm-title'>
            <VStack align='stretch' gap={4}>
              <Text id='create-user-confirm-title' fontSize='xl' fontWeight='bold'>
                Confirm User Creation
              </Text>
              <Text>
                Are you sure you want to create a new user with username "{newUsername}" and role "
                {selectedRole}"?
              </Text>
              <HStack gap={4} justify='flex-end'>
                <Button onClick={() => setCreateUserConfirmOpen(false)} variant='outline'>
                  Cancel
                </Button>
                <Button colorPalette='blue' onClick={handleCreateUserConfirm}>
                  Yes, Create User
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Create User Result Modal */}
      {createUserResultOpen && (
        <Box className='modal-overlay' onClick={() => setCreateUserResultOpen(false)}>
          <Box
            className='modal-content'
            onClick={e => e.stopPropagation()}
            role='dialog'
            aria-labelledby='create-user-result-title'>
            <VStack align='stretch' gap={4}>
              <Text
                id='create-user-result-title'
                fontSize='xl'
                fontWeight='bold'
                color={createUserResult.success ? 'green' : 'red'}>
                {createUserResult.success ? 'User Created Successfully' : 'User Creation Failed'}
              </Text>
              {createUserResult.success ? (
                <>
                  <Text>{createUserResult.message}</Text>
                  <Text>Username: {createUserResult.username}</Text>
                  <Text>Password: {createUserResult.password}</Text>
                  <Text fontWeight='bold'>
                    Take note of this login, it will not be shown again.
                  </Text>
                </>
              ) : (
                <Text>{createUserResult.message}</Text>
              )}
              <HStack gap={4} justify='flex-end'>
                <Button onClick={() => setCreateUserResultOpen(false)} colorPalette='blue'>
                  OK
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserManagementTab;
