import axios from 'axios';
import { UserCredentials, SafeDatabaseUser, UserSignUp } from '../types/types';
import api from './config';
import profanityService from './profanityService';

const USER_API_URL = `/api/user`;

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUsers = async (): Promise<SafeDatabaseUser[]> => {
  const res = await api.get(`${USER_API_URL}/getUsers`);
  if (res.status !== 200) {
    throw new Error('Error when fetching users');
  }
  return res.data;
};

/**
 * Function to get users
 *
 * @throws Error if there is an issue fetching users.
 */
const getUserByUsername = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.get(`${USER_API_URL}/getUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching user');
  }
  return res.data;
};

/**
 * Sends a POST request to create a new user account.
 *
 * @param user - The user credentials (username and password) for signup.
 * @returns {Promise<User>} The newly created user object.
 * @throws {Error} If an error occurs during the signup process.
 */
const createUser = async (user: UserSignUp): Promise<SafeDatabaseUser> => {
  try {
    // Check profanity in username
    await profanityService(user.username);

    const res = await api.post(`${USER_API_URL}/signup`, user);
    return res.data;
  } catch (error) {
    // Handle other errors
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while signing up: ${error.response.data}`);
    } else {
      throw new Error(`Error while signing up: ${(error as Error).message}`);
    }
  }
};

/**
 * Sends a POST request to authenticate a user.
 *
 * @param user - The user credentials (username and password) for login.
 * @returns {Promise<User>} The authenticated user object.
 * @throws {Error} If an error occurs during the login process.
 */
const loginUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
  try {
    const res = await api.post(`${USER_API_URL}/login`, user);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while logging in: ${error.response.data}`);
    } else {
      throw new Error('Error while logging in');
    }
  }
};

/**
 * Deletes a user by their username.
 * @param username - The unique username of the user
 * @returns A promise that resolves to the deleted user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const deleteUser = async (username: string): Promise<SafeDatabaseUser> => {
  const res = await api.delete(`${USER_API_URL}/deleteUser/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when deleting user');
  }
  return res.data;
};

/**
 * Resets the password for a user.
 * @param username - The unique username of the user
 * @param newPassword - The new password to be set for the user
 * @returns A promise that resolves to the updated user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const resetPassword = async (username: string, newPassword: string): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/resetPassword`, {
    username,
    password: newPassword,
  });
  if (res.status !== 200) {
    throw new Error('Error when resetting password');
  }
  return res.data;
};

/**
 * Updates the user's biography.
 * @param username The unique username of the user
 * @param newBiography The new biography to set for this user
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const updateBiography = async (
  username: string,
  newBiography: string,
): Promise<SafeDatabaseUser> => {
  // Check guidelines agreement with server
  await checkGuidelinesAgreement(username);

  await profanityService(newBiography);
  const res = await api.patch(`${USER_API_URL}/updateBiography`, {
    username,
    biography: newBiography,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating biography');
  }
  return res.data;
};

/**
 * Updates the user's community guidelines agreement status.
 * @param username The unique username of the user
 * @param agreedToGuidelines Whether the user has agreed to community guidelines
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const updateGuidelinesAgreement = async (
  username: string,
  agreedToGuidelines: boolean,
): Promise<SafeDatabaseUser> => {
  const res = await api.patch(`${USER_API_URL}/updateGuidelinesAgreement`, {
    username,
    agreedToGuidelines,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating guidelines agreement');
  }
  return res.data;
};

/**
 * Checks if a user has agreed to the community guidelines.
 * @param username The unique username of the user
 * @returns A promise resolving to the guidelines agreement status
 * @throws Error if user hasn't agreed to guidelines or if the request fails
 */
const checkGuidelinesAgreement = async (username: string): Promise<void> => {
  try {
    const res = await api.get(`${USER_API_URL}/checkGuidelines/${username}`);
    if (res.status === 200 && res.data.agreed) {
      return; // User has agreed
    }
    // If we get here, user hasn't agreed
    throw new Error(
      res.data.message || 'You must agree to the community guidelines before posting.',
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error(
        error.response.data.message ||
          'You must agree to the community guidelines before posting. Please visit your profile settings to agree to the guidelines.',
      );
    }
    throw error;
  }
};

/**
 * Suspends a user for a specific duration with a violation reason.
 * @param username The unique username of the user to suspend
 * @param durationDays Number of days to suspend the user
 * @param reason The violation reason for suspension
 * @param adminUsername The username of the admin performing the action
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const suspendUser = async (
  username: string,
  durationDays: number,
  reason: string,
  adminUsername: string,
): Promise<SafeDatabaseUser> => {
  if (reason.trim().length < 1) {
    throw new Error('Suspension reason must be provided');
  }
  try {
    await profanityService(reason);
  } catch (error) {
    throw new Error('Inappropriate language detected in suspension reason');
  }
  const res = await api.post(`${USER_API_URL}/suspend`, {
    username,
    durationDays,
    reason,
    adminUsername,
  });
  if (res.status !== 200) {
    throw new Error('Error when suspending user ${username}');
  }
  return res.data;
};

/**
 * Bans a user permanently with a mandatory reason.
 * @param username The unique username of the user to ban
 * @param reason The reason for the ban (minimum 20 characters)
 * @param adminUsername The username of the admin performing the action
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const banUser = async (
  username: string,
  reason: string,
  adminUsername: string,
): Promise<SafeDatabaseUser> => {
  if (reason.length < 20) {
    throw new Error('Ban reason must be at least 20 characters');
  }
  try {
    await profanityService(reason);
  } catch (error) {
    throw new Error('Inappropriate language detected in ban reason');
  }

  const res = await api.post(`${USER_API_URL}/ban`, {
    username,
    reason,
    adminUsername,
  });
  if (res.status !== 200) {
    throw new Error('Error when banning user');
  }
  return res.data;
};

/**
 * Promotes a user to moderator role.
 * @param username The unique username of the user to promote
 * @param adminUsername The username of the admin performing the action
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const promoteToModerator = async (
  username: string,
  adminUsername: string,
): Promise<SafeDatabaseUser> => {
  try {
    await checkGuidelinesAgreement(username);
  } catch (error) {
    throw new Error('User did not agree to community guidelines');
  }
  const res = await api.post(`${USER_API_URL}/promoteToModerator`, {
    username,
    adminUsername,
  });
  if (res.status !== 200) {
    throw new Error('Error when promoting user to moderator');
  }
  return res.data;
};

/**
 * Promotes a moderator to admin role.
 * @param username The unique username of the moderator to promote
 * @param adminUsername The username of the admin performing the action
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const promoteToAdmin = async (
  username: string,
  adminUsername: string,
): Promise<SafeDatabaseUser> => {
  try {
    await checkGuidelinesAgreement(username);
  } catch (error) {
    throw new Error('User did not agree to community guidelines');
  }
  const res = await api.post(`${USER_API_URL}/promoteToAdmin`, {
    username,
    adminUsername,
  });
  if (res.status !== 200) {
    throw new Error('Error when promoting moderator to admin');
  }
  return res.data;
};

/**
 * Demotes a user back to regular user role.
 * @param username The unique username of the user to demote
 * @param adminUsername The username of the admin performing the action
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const demoteToUser = async (username: string, adminUsername: string): Promise<SafeDatabaseUser> => {
  const res = await api.post(`${USER_API_URL}/demoteToUser`, {
    username,
    adminUsername,
  });
  if (res.status !== 200) {
    throw new Error('Error when demoting user');
  }
  return res.data;
};

/**
 * Checks if a user is currently suspended or banned.
 * @param username The unique username to check
 * @returns A promise resolving to suspension status information
 * @throws Error if the request fails
 */
const checkSuspensionStatus = async (
  username: string,
): Promise<{
  isSuspended: boolean;
  suspendedUntil?: Date;
  suspensionReason?: string;
  isBanned?: boolean;
  banReason?: string;
}> => {
  const res = await api.get(`${USER_API_URL}/suspensionStatus/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when checking suspension status');
  }
  return res.data;
};

/**
 * Creates a new user account with a specific role (Admin only).
 * @param username The unique username for the new user
 * @param password The password for the new user
 * @param role The role to assign to the user ('user', 'moderator', or 'admin')
 * @param adminUsername The username of the admin creating the user
 * @returns A promise resolving to the created user data
 * @throws {Error} If the request to the server is unsuccessful
 */
const createUserWithRole = async (
  username: string,
  password: string,
  role: 'user' | 'moderator' | 'admin',
  adminUsername: string,
): Promise<SafeDatabaseUser> => {
  try {
    // Check profanity in username
    await profanityService(username);

    const res = await api.post(`/api/admin/create-user?username=${adminUsername}`, {
      username,
      password,
      role,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Error while creating user: ${error.response.data.error || error.response.data}`,
      );
    } else {
      throw new Error(`Error while creating user: ${(error as Error).message}`);
    }
  }
};

/**
 * Updates user details (admin only).
 * @param username The unique username of the user to update
 * @param updates Partial user object with fields to update
 * @returns A promise resolving to the updated user
 * @throws Error if the request fails
 */
const updateUser = async (
  username: string,
  updates: Partial<SafeDatabaseUser>,
): Promise<SafeDatabaseUser> => {
  try {
    // Check profanity in username if it's being updated
    if (updates.username) {
      await profanityService(updates.username);
    }

    const res = await api.patch(`${USER_API_URL}/updateUser`, {
      username,
      updates,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data || 'Error when updating user');
    }
    // Re-throw profanity and other non-axios errors as-is
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error when updating user');
  }
};

export {
  getUsers,
  getUserByUsername,
  loginUser,
  createUser,
  createUserWithRole,
  deleteUser,
  resetPassword,
  updateBiography,
  updateGuidelinesAgreement,
  updateUser,
  checkGuidelinesAgreement,
  suspendUser,
  banUser,
  promoteToModerator,
  promoteToAdmin,
  demoteToUser,
  checkSuspensionStatus,
};
