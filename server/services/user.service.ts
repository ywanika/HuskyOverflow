import UserModel from '../models/users.model';
import NotificationModel from '../models/notifications.model';
import {
  DatabaseUser,
  SafeDatabaseUser,
  User,
  UserCredentials,
  UserResponse,
  UsersResponse,
} from '../types/types';

/**
 * Saves a new user to the database.
 *
 * @param {User} user - The user object to be saved, containing user details like username, password, etc.
 * @returns {Promise<UserResponse>} - Resolves with the saved user object (without the password) or an error message.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const result: DatabaseUser = await UserModel.create(user);

    if (!result) {
      throw Error('Failed to create user');
    }

    // Remove password field from returned object
    const safeUser: SafeDatabaseUser = {
      _id: result._id,
      username: result.username,
      dateJoined: result.dateJoined,
      biography: result.biography,
      agreedToGuidelines: result.agreedToGuidelines,
    };

    return safeUser;
  } catch (error) {
    return { error: `Error occurred when saving user: ${error}` };
  }
};

/**
 * Retrieves a user from the database by their username.
 *
 * @param {string} username - The username of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username }).select('-password');

    if (!user) {
      throw Error('User not found');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Retrieves all users from the database.
 * Users documents are returned in the order in which they were created, oldest to newest.
 *
 * @returns {Promise<UsersResponse>} - Resolves with the found user objects (without the passwords) or an error message.
 */
export const getUsersList = async (): Promise<UsersResponse> => {
  try {
    const users: SafeDatabaseUser[] = await UserModel.find().select('-password');

    if (!users) {
      throw Error('Users could not be retrieved');
    }

    return users;
  } catch (error) {
    return { error: `Error occurred when finding users: ${error}` };
  }
};

/**
 * Authenticates a user by verifying their username and password.
 *
 * @param {UserCredentials} loginCredentials - An object containing the username and password.
 * @returns {Promise<UserResponse>} - Resolves with the authenticated user object (without the password) or an error message.
 */
export const loginUser = async (loginCredentials: UserCredentials): Promise<UserResponse> => {
  const { username, password } = loginCredentials;

  try {
    const user: SafeDatabaseUser | null = await UserModel.findOne({ username, password }).select(
      '-password',
    );

    if (!user) {
      throw Error('Authentication failed');
    }

    return user;
  } catch (error) {
    return { error: `Error occurred when authenticating user: ${error}` };
  }
};

/**
 * Deletes a user from the database by their username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<UserResponse>} - Resolves with the deleted user object (without the password) or an error message.
 */
export const deleteUserByUsername = async (username: string): Promise<UserResponse> => {
  try {
    const deletedUser: SafeDatabaseUser | null = await UserModel.findOneAndDelete({
      username,
    }).select('-password');

    if (!deletedUser) {
      throw Error('Error deleting user');
    }

    return deletedUser;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

/**
 * Updates user information in the database.
 *
 * @param {string} username - The username of the user to update.
 * @param {Partial<User>} updates - An object containing the fields to update and their new values.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object (without the password) or an error message.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>,
): Promise<UserResponse> => {
  try {
    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Error updating user');
    }

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when updating user: ${error}` };
  }
};

/**
 * Suspends a user for a specific duration with a violation reason.
 *
 * @param {string} username - The username of the user to suspend.
 * @param {number} durationDays - Number of days to suspend the user.
 * @param {string} reason - The violation reason for the suspension.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object or an error message.
 */
export const suspendUser = async (
  username: string,
  durationDays: number,
  reason: string,
): Promise<UserResponse> => {
  try {
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      {
        $set: {
          suspendedUntil: suspendedUntil,
          suspensionReason: reason,
        },
      },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('User not found');
    }

    // Send notification to the user
    await NotificationModel.create({
      recipientUsername: username,
      type: 'suspension',
      message: `Your account has been suspended until ${suspendedUntil.toLocaleDateString()}. Reason: ${reason}`,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when suspending user: ${error}` };
  }
};

/**
 * Bans a user permanently with a mandatory reason.
 *
 * @param {string} username - The username of the user to ban.
 * @param {string} reason - The reason for the ban (minimum 20 characters).
 * @returns {Promise<UserResponse>} - Resolves with the updated user object or an error message.
 */
export const banUser = async (username: string, reason: string): Promise<UserResponse> => {
  try {
    if (reason.length < 20) {
      throw Error('Ban reason must be at least 20 characters');
    }

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      {
        $set: {
          isBanned: true,
          banReason: reason,
        },
      },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('User not found');
    }

    // Send notification to the user
    await NotificationModel.create({
      recipientUsername: username,
      type: 'suspension',
      message: `Your account has been permanently banned. Reason: ${reason}`,
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when banning user: ${error}` };
  }
};

/**
 * Promotes a user to moderator role.
 *
 * @param {string} username - The username of the user to promote.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object or an error message.
 */
export const promoteToModerator = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw Error('User not found');
    }

    // Check if user is banned
    if (user.isBanned) {
      throw Error('Cannot promote a banned user');
    }

    // Check if user is currently suspended
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      throw Error('Cannot promote a suspended user');
    }

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: { role: 'moderator' } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('User not found');
    }

    // Send notification to the user
    await NotificationModel.create({
      recipientUsername: username,
      type: 'role_change',
      message: 'Your account has been promoted to Moderator.',
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when promoting user to moderator: ${error}` };
  }
};

/**
 * Promotes a moderator to admin role.
 *
 * @param {string} username - The username of the moderator to promote.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object or an error message.
 */
export const promoteToAdmin = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw Error('User not found');
    }

    if (user.role !== 'moderator') {
      throw Error('User must be a moderator to be promoted to admin');
    }

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: { role: 'admin' } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('Failed to update user');
    }

    // Send notification to the user
    await NotificationModel.create({
      recipientUsername: username,
      type: 'role_change',
      message: 'Your account has been promoted to Admin.',
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when promoting moderator to admin: ${error}` };
  }
};

/**
 * Demotes a user back to regular user role.
 *
 * @param {string} username - The username of the user to demote.
 * @returns {Promise<UserResponse>} - Resolves with the updated user object or an error message.
 */
export const demoteToUser = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw Error('User not found');
    }

    if (user.role !== 'moderator' && user.role !== 'admin') {
      throw Error('User must be a moderator to be demoted to user');
    }

    const updatedUser: SafeDatabaseUser | null = await UserModel.findOneAndUpdate(
      { username },
      { $set: { role: 'user' } },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw Error('User not found');
    }

    // Send notification to the user
    await NotificationModel.create({
      recipientUsername: username,
      type: 'role_change',
      message: 'Your account has been demoted to User.',
      contentId: null,
      isRead: false,
      timestamp: new Date(),
    });

    return updatedUser;
  } catch (error) {
    return { error: `Error occurred when demoting user: ${error}` };
  }
};

/**
 * Checks if a user is currently suspended or banned.
 *
 * @param {string} username - The username to check.
 * @returns {Promise<{ isSuspended: boolean; suspendedUntil?: Date; suspensionReason?: string; isBanned?: boolean; banReason?: string } | { error: string }>}
 */
export const checkUserSuspensionStatus = async (
  username: string,
): Promise<
  | {
      isSuspended: boolean;
      suspendedUntil?: Date;
      suspensionReason?: string;
      isBanned?: boolean;
      banReason?: string;
    }
  | { error: string }
> => {
  try {
    const user = await UserModel.findOne({ username }).select(
      'suspendedUntil suspensionReason isBanned banReason',
    );

    if (!user) {
      throw Error('User not found');
    }

    const now = new Date();
    const isSuspended =
      user.suspendedUntil !== null &&
      user.suspendedUntil !== undefined &&
      new Date(user.suspendedUntil) > now;

    return {
      isSuspended,
      suspendedUntil: user.suspendedUntil,
      suspensionReason: user.suspensionReason,
      isBanned: user.isBanned,
      banReason: user.banReason,
    };
  } catch (error) {
    return { error: `Error occurred when checking suspension status: ${error}` };
  }
};
