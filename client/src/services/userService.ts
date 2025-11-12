import axios from 'axios';
import { UserCredentials, SafeDatabaseUser } from '../types/types';
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
const createUser = async (user: UserCredentials): Promise<SafeDatabaseUser> => {
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

export {
  getUsers,
  getUserByUsername,
  loginUser,
  createUser,
  deleteUser,
  resetPassword,
  updateBiography,
  updateGuidelinesAgreement,
  checkGuidelinesAgreement,
};
