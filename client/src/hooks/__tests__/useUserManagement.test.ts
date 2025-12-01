import { renderHook, act, waitFor } from '@testing-library/react';
import useUserManagement from '../useUserManagement';
import useUserContext from '../useUserContext';
import * as userService from '../../services/userService';
import { FakeSOSocket } from '../../types/types';
import { ObjectId } from 'mongodb';

jest.mock('../useUserContext');
jest.mock('../../services/userService');

const MockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;
const mockUserService = userService as jest.Mocked<typeof userService>;

const mockCurrentUser = {
  _id: new ObjectId(),
  username: 'admin',
  dateJoined: new Date('2024-01-01'),
  role: 'admin' as const,
};

const MOCK_USERS = [
  {
    _id: new ObjectId(),
    username: 'testuser1',
    dateJoined: new Date('2024-01-01'),
    role: 'user' as const,
  },
  {
    _id: new ObjectId(),
    username: 'testuser2',
    dateJoined: new Date('2024-01-02'),
    role: 'moderator' as const,
  },
];

describe('useUserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    MockUseUserContext.mockReturnValue({
      user: mockCurrentUser,
      socket: {} as FakeSOSocket,
    });

    mockUserService.getUsers.mockResolvedValue(MOCK_USERS);
  });

  it('fetches users on mount', async () => {
    renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(mockUserService.getUsers).toHaveBeenCalled();
    });
  });

  it('returns users sorted by role (admin, moderator, user)', async () => {
    const { result } = renderHook(() => useUserManagement());

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2);
      // Should be sorted: moderators first, then users
      expect(result.current.users[0].role).toBe('moderator');
      expect(result.current.users[1].role).toBe('user');
    });
  });

  it('handles suspend user action', async () => {
    mockUserService.suspendUser.mockResolvedValue(MOCK_USERS[0]);

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleSuspendUser('testuser1', 1, 'Spam');
      expect(success).toBe(true);
    });

    expect(mockUserService.suspendUser).toHaveBeenCalledWith('testuser1', 1, 'Spam', 'admin');
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully suspended');
  });

  it('handles ban user action', async () => {
    mockUserService.banUser.mockResolvedValue(MOCK_USERS[0]);

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleBanUser(
        'testuser1',
        'Spam',
        'This is a detailed violation reason that meets the minimum length requirement for banning a user',
      );
      expect(success).toBe(true);
    });

    expect(mockUserService.banUser).toHaveBeenCalledWith(
      'testuser1',
      'Spam: This is a detailed violation reason that meets the minimum length requirement for banning a user',
      'admin',
    );
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully banned');
  });

  it('handles promote to moderator action', async () => {
    mockUserService.promoteToModerator.mockResolvedValue({ ...MOCK_USERS[0], role: 'moderator' });

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handlePromoteToModerator('testuser1');
      expect(success).toBe(true);
    });

    expect(mockUserService.promoteToModerator).toHaveBeenCalledWith('testuser1', 'admin');
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully promoted');
  });

  it('handles promote to admin action', async () => {
    mockUserService.promoteToAdmin.mockResolvedValue({ ...MOCK_USERS[0], role: 'admin' });

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handlePromoteToAdmin('testuser2');
      expect(success).toBe(true);
    });

    expect(mockUserService.promoteToAdmin).toHaveBeenCalledWith('testuser2', 'admin');
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully promoted');
  });

  it('handles demote to user action', async () => {
    mockUserService.demoteToUser.mockResolvedValue({ ...MOCK_USERS[1], role: 'user' });

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleDemoteToUser('testuser2');
      expect(success).toBe(true);
    });

    expect(mockUserService.demoteToUser).toHaveBeenCalledWith('testuser2', 'admin');
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully demoted');
  });

  it('handles create user action', async () => {
    mockUserService.createUserWithRole.mockResolvedValue(MOCK_USERS[0]);

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const validationResult = await result.current.handleCreateUser(
        'newuser',
        'password123',
        'password123',
        'user',
      );
      expect(validationResult.success).toBe(true);
    });

    expect(mockUserService.createUserWithRole).toHaveBeenCalledWith(
      'newuser',
      'password123',
      'user',
      'admin',
    );
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully created user');
  });

  it('handles update user action', async () => {
    mockUserService.updateUser.mockResolvedValue({ ...MOCK_USERS[0], biography: 'Updated bio' });

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleUpdateUser('testuser1', {
        biography: 'Updated bio',
      });
      expect(success).toBe(true);
    });

    expect(mockUserService.updateUser).toHaveBeenCalledWith('testuser1', {
      biography: 'Updated bio',
    });
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully updated');
  });

  it('handles delete user action', async () => {
    mockUserService.deleteUser.mockResolvedValue(MOCK_USERS[0]);

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleDeleteUser('testuser1');
      expect(success).toBe(true);
    });

    expect(mockUserService.deleteUser).toHaveBeenCalledWith('testuser1');
    expect(result.current.actionMessage.type).toBe('success');
    expect(result.current.actionMessage.text).toContain('Successfully deleted');
  });

  it('prevents actions for non-admin users', async () => {
    MockUseUserContext.mockReturnValue({
      user: { ...mockCurrentUser, role: 'user' as const },
      socket: {} as FakeSOSocket,
    });

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleSuspendUser('testuser1', 1, 'Spam');
      expect(success).toBe(false);
    });

    expect(result.current.actionMessage.type).toBe('error');
    expect(result.current.actionMessage.text).toContain(
      'Only administrators can perform this action',
    );
  });

  it('handles service errors gracefully', async () => {
    mockUserService.suspendUser.mockRejectedValue(new Error('Service unavailable'));

    const { result } = renderHook(() => useUserManagement());

    await act(async () => {
      const success = await result.current.handleSuspendUser('testuser1', 1, 'Spam');
      expect(success).toBe(false);
    });

    expect(result.current.actionMessage.type).toBe('error');
    expect(result.current.actionMessage.text).toContain('Failed to suspend user');
  });
});
