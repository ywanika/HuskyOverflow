import { useState, useEffect } from 'react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import {
  getUsers,
  suspendUser,
  banUser,
  promoteToModerator,
  promoteToAdmin,
  demoteToUser,
  createUserWithRole,
  updateUser,
  deleteUser,
} from '../services/userService';
import useUserContext from './useUserContext';
import profanityService from '../services/profanityService';

interface ActionMessage {
  type: 'success' | 'error';
  text: string;
}

const useUserManagement = () => {
  const { user: currentUser } = useUserContext();
  const [users, setUsers] = useState<SafeDatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<ActionMessage>({
    type: 'success',
    text: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const checkAdminRole = (): boolean => {
    if (currentUser.role !== 'admin') {
      setActionMessage({
        type: 'error',
        text: 'Only administrators can perform this action',
      });
      return false;
    }
    return true;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (username: string, duration: number, reason: string) => {
    if (!checkAdminRole()) return false;

    try {
      await suspendUser(username, duration, reason, currentUser.username);
      setActionMessage({
        type: 'success',
        text: `Successfully suspended ${username}`,
      });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to suspend user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handleBanUser = async (username: string, violationType: string, reason: string) => {
    if (!checkAdminRole()) return false;

    if (reason.length < 20) {
      setActionMessage({ type: 'error', text: 'Ban reason must be at least 20 characters' });
      return false;
    }

    try {
      const fullReason = `${violationType}: ${reason}`;
      await banUser(username, fullReason, currentUser.username);
      setActionMessage({ type: 'success', text: `Successfully banned ${username}` });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to ban user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handlePromoteToModerator = async (username: string) => {
    if (!checkAdminRole()) return false;

    try {
      await promoteToModerator(username, currentUser.username);
      setActionMessage({
        type: 'success',
        text: `Successfully promoted ${username} to Moderator`,
      });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to promote user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handlePromoteToAdmin = async (username: string) => {
    if (!checkAdminRole()) return false;

    try {
      await promoteToAdmin(username, currentUser.username);
      setActionMessage({
        type: 'success',
        text: `Successfully promoted ${username} to Admin`,
      });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text:
          'Failed to promote moderator to admin: ' +
          (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handleDemoteToUser = async (username: string) => {
    if (!checkAdminRole()) return false;

    try {
      await demoteToUser(username, currentUser.username);
      setActionMessage({ type: 'success', text: `Successfully demoted ${username} to User` });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to demote user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handleCreateUser = async (
    username: string,
    password: string,
    confirmPassword: string,
    role: 'user' | 'moderator' | 'admin',
  ): Promise<{ success: boolean; message?: string }> => {
    if (!checkAdminRole()) {
      const message = 'Only administrators can perform this action';
      setActionMessage({
        type: 'error',
        text: message,
      });
      return { success: false, message };
    }

    if (!username.trim() || !password) {
      const message = 'Username and password are required';
      setActionMessage({
        type: 'error',
        text: message,
      });
      return { success: false, message };
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match';
      setActionMessage({
        type: 'error',
        text: message,
      });
      return { success: false, message };
    }

    try {
      await createUserWithRole(username, password, role, currentUser.username);
      const message = `Successfully created user ${username} with role ${role}`;
      setActionMessage({
        type: 'success',
        text: message,
      });
      await fetchUsers();
      return { success: true, message };
    } catch (err) {
      const message =
        'Failed to create user: ' + (err instanceof Error ? err.message : String(err));
      setActionMessage({
        type: 'error',
        text: message,
      });
      return { success: false, message };
    }
  };

  const handleUpdateUser = async (
    username: string,
    updates: Partial<SafeDatabaseUser>,
  ): Promise<boolean> => {
    if (!checkAdminRole()) return false;

    try {
      await profanityService(username);
      await profanityService(updates.biography || '');
      await updateUser(username, updates);
      setActionMessage({ type: 'success', text: `Successfully updated ${username}` });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to update user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const handleDeleteUser = async (username: string): Promise<boolean> => {
    if (!checkAdminRole()) return false;

    try {
      await deleteUser(username);
      setActionMessage({ type: 'success', text: `Successfully deleted ${username}` });
      await fetchUsers();
      return true;
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to delete user: ' + (err instanceof Error ? err.message : String(err)),
      });
      return false;
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const roleOrder = { admin: 0, moderator: 1, user: 2 };
    const aRole = (a.role || 'user') as keyof typeof roleOrder;
    const bRole = (b.role || 'user') as keyof typeof roleOrder;
    return roleOrder[aRole] - roleOrder[bRole];
  });

  return {
    users: sortedUsers,
    loading,
    error,
    actionMessage,
    handleSuspendUser,
    handleBanUser,
    handlePromoteToModerator,
    handlePromoteToAdmin,
    handleDemoteToUser,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  };
};

export default useUserManagement;
