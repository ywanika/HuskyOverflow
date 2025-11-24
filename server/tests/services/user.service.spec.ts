import mongoose, { Query } from 'mongoose';
import UserModel from '../../models/users.model';
import NotificationModel from '../../models/notifications.model';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
  suspendUser,
  banUser,
  promoteToModerator,
  promoteToAdmin,
  demoteToUser,
  checkUserSuspensionStatus,
} from '../../services/user.service';
import { SafeDatabaseUser, User, UserCredentials } from '../../types/types';
import { user, safeUser } from '../mockData.models';

describe('User model', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('saveUser', () => {
    it('should return the saved user', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockResolvedValueOnce({ ...user, _id: mongoose.Types.ObjectId } as unknown as ReturnType<
          typeof UserModel.create<User>
        >);

      const savedUser = (await saveUser(user)) as SafeDatabaseUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(UserModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });

    it('should return error when create returns null', async () => {
      jest.spyOn(UserModel, 'create').mockResolvedValueOnce(null as any);

      const saveError = await saveUser(user);

      expect('error' in saveError).toBe(true);
    });
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the matching user', async () => {
    jest.spyOn(UserModel, 'findOne').mockImplementation((filter?: any) => {
      expect(filter.username).toBeDefined();
      const query: any = {};
      query.select = jest.fn().mockReturnValue(Promise.resolve(user));
      return query;
    });

    const retrievedUser = (await getUserByUsername(user.username)) as SafeDatabaseUser;

    expect(retrievedUser.username).toEqual(user.username);
    expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the user is not found', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });

  it('should return error when findOne returns null with select', async () => {
    jest.spyOn(UserModel, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    jest.spyOn(UserModel, 'findOne').mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Error finding document')),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const getUserError = await getUserByUsername(user.username);

    expect('error' in getUserError).toBe(true);
  });
});

describe('getUsersList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the users', async () => {
    jest.spyOn(UserModel, 'find').mockReturnValue({
      select: jest.fn().mockResolvedValue([safeUser]),
    } as unknown as Query<SafeDatabaseUser[], typeof UserModel>);

    const retrievedUsers = (await getUsersList()) as SafeDatabaseUser[];

    expect(retrievedUsers[0].username).toEqual(safeUser.username);
    expect(retrievedUsers[0].dateJoined).toEqual(safeUser.dateJoined);
  });

  it('should throw an error if the users cannot be found', async () => {
    jest.spyOn(UserModel, 'find').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as unknown as Query<SafeDatabaseUser[], typeof UserModel>);

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });

  it('should throw an error if there is an error while searching the database', async () => {
    jest.spyOn(UserModel, 'find').mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Error finding documents')),
    } as unknown as Query<SafeDatabaseUser[], typeof UserModel>);

    const getUsersError = await getUsersList();

    expect('error' in getUsersError).toBe(true);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the user if authentication succeeds', async () => {
    jest.spyOn(UserModel, 'findOne').mockImplementation((filter?: any) => {
      expect(filter.username).toBeDefined();
      expect(filter.password).toBeDefined();
      const query: any = {};
      query.select = jest.fn().mockReturnValue(Promise.resolve(safeUser));
      return query;
    });

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const loggedInUser = (await loginUser(credentials)) as SafeDatabaseUser;

    expect(loggedInUser.username).toEqual(user.username);
    expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return the user if the password fails', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

    const credentials: UserCredentials = {
      username: user.username,
      password: 'wrongPassword',
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });

  it('should return the user is not found', async () => {
    jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

    const credentials: UserCredentials = {
      username: 'wrongUsername',
      password: user.password,
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });

  it('should return error when findOne returns null with select in loginUser', async () => {
    jest.spyOn(UserModel, 'findOne').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const loginError = await loginUser(credentials);

    expect('error' in loginError).toBe(true);
  });
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    jest.spyOn(UserModel, 'findOneAndDelete').mockImplementation((filter?: any) => {
      expect(filter.username).toBeDefined();
      const query: any = {};
      query.select = jest.fn().mockReturnValue(Promise.resolve(safeUser));
      return query;
    });

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeDatabaseUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    jest.spyOn(UserModel, 'findOneAndDelete').mockResolvedValue(null);

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });

  it('should return error when findOneAndDelete returns null with select', async () => {
    jest.spyOn(UserModel, 'findOneAndDelete').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    jest.spyOn(UserModel, 'findOneAndDelete').mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Error deleting document')),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const deletedError = await deleteUserByUsername(user.username);

    expect('error' in deletedError).toBe(true);
  });
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeDatabaseUser = {
    _id: new mongoose.Types.ObjectId(),
    username: user.username,
    dateJoined: user.dateJoined,
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the updated user when updated succesfully', async () => {
    jest.spyOn(UserModel, 'findOneAndUpdate').mockImplementation((filter?: any) => {
      expect(filter.username).toBeDefined();
      const query: any = {};
      query.select = jest.fn().mockReturnValue(Promise.resolve(safeUpdatedUser));
      return query;
    });

    const result = (await updateUser(user.username, updates)) as SafeDatabaseUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should throw an error if the username is not found', async () => {
    jest.spyOn(UserModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should return error when findOneAndUpdate returns null with select', async () => {
    jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should throw an error if a database error while deleting', async () => {
    jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Error updating document')),
    } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

    const updatedError = await updateUser(user.username, updates);

    expect('error' in updatedError).toBe(true);
  });

  it('should update the biography if the user is found', async () => {
    const newBio = 'This is a new biography';
    const biographyUpdates: Partial<User> = { biography: newBio };
    jest.spyOn(UserModel, 'findOneAndUpdate').mockImplementation((filter?: any) => {
      expect(filter.username).toBeDefined();
      const query: any = {};
      query.select = jest
        .fn()
        .mockReturnValue(Promise.resolve({ ...safeUpdatedUser, biography: newBio }));
      return query;
    });

    const result = await updateUser(user.username, biographyUpdates);

    // Check that the result is a SafeUser and the biography got updated
    if ('username' in result) {
      expect(result.biography).toEqual(newBio);
    } else {
      throw new Error('Expected a safe user, got an error object.');
    }
  });

  it('should return an error if biography update fails because user not found', async () => {
    // Simulate user not found
    jest.spyOn(UserModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

    const newBio = 'No user found test';
    const biographyUpdates: Partial<User> = { biography: newBio };
    const updatedError = await updateUser(user.username, biographyUpdates);

    expect('error' in updatedError).toBe(true);
  });
});

describe('Admin User Management', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('suspendUser', () => {
    it('should suspend a user for specified duration with reason', async () => {
      const suspendedUser = {
        ...safeUser,
        suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        suspensionReason: 'Spam',
      };

      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(suspendedUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await suspendUser('testuser', 7, 'Spam')) as SafeDatabaseUser;

      expect(result.suspendedUntil).toBeDefined();
      expect(result.suspensionReason).toEqual('Spam');
      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername: 'testuser',
          type: 'suspension',
          message: expect.stringContaining('suspended until'),
        }),
      );
    });

    it('should return error if user not found', async () => {
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      const result = await suspendUser('nonexistent', 7, 'Spam');

      expect('error' in result).toBe(true);
    });
  });

  describe('banUser', () => {
    it('should permanently ban a user with valid reason', async () => {
      const bannedUser = {
        ...safeUser,
        isBanned: true,
        banReason: 'Hate Speech: This is a detailed reason for the permanent ban',
      };

      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(bannedUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await banUser(
        'testuser',
        'Hate Speech: This is a detailed reason for the permanent ban',
      )) as SafeDatabaseUser;

      expect(result.isBanned).toBe(true);
      expect(result.banReason).toContain('Hate Speech');
      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername: 'testuser',
          type: 'suspension',
          message: expect.stringContaining('permanently banned'),
        }),
      );
    });

    it('should return error if ban reason is less than 20 characters', async () => {
      const result = await banUser('testuser', 'Too short');

      expect('error' in result).toBe(true);
      expect((result as { error: string }).error).toContain('at least 20 characters');
    });

    it('should return error if user not found', async () => {
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      const result = await banUser('nonexistent', 'Valid reason with enough characters here');

      expect('error' in result).toBe(true);
    });
  });

  describe('promoteToModerator', () => {
    it('should promote a user to moderator role', async () => {
      const regularUser = { ...safeUser, role: 'user', isBanned: false, suspendedUntil: null };
      const promotedUser = { ...safeUser, role: 'moderator' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser as any);
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(promotedUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await promoteToModerator('testuser')) as SafeDatabaseUser;

      expect(result.role).toEqual('moderator');
      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername: 'testuser',
          type: 'role_change',
          message: expect.stringContaining('promoted to Moderator'),
        }),
      );
    });

    it('should not promote a banned user', async () => {
      const bannedUser = { ...safeUser, role: 'user', isBanned: true };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(bannedUser as any);

      const result = await promoteToModerator('banneduser');

      expect('error' in result).toBe(true);
      expect((result as { error: string }).error).toContain('Cannot promote a banned user');
    });

    it('should not promote a suspended user', async () => {
      const suspendedUser = {
        ...safeUser,
        role: 'user',
        isBanned: false,
        suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(suspendedUser as any);

      const result = await promoteToModerator('suspendeduser');

      expect('error' in result).toBe(true);
      expect((result as { error: string }).error).toContain('Cannot promote a suspended user');
    });

    it('should return error if user not found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await promoteToModerator('nonexistent');

      expect('error' in result).toBe(true);
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote a moderator to admin role', async () => {
      const moderatorUser = { ...safeUser, role: 'moderator' };
      const adminUser = { ...safeUser, role: 'admin' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser as any);
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(adminUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await promoteToAdmin('testmoderator')) as SafeDatabaseUser;

      expect(result.role).toEqual('admin');
      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername: 'testmoderator',
          type: 'role_change',
          message: expect.stringContaining('promoted to Admin'),
        }),
      );
    });

    it('should not promote a regular user to admin', async () => {
      const regularUser = { ...safeUser, role: 'user' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser as any);

      const result = await promoteToAdmin('regularuser');

      expect('error' in result).toBe(true);
      expect((result as { error: string }).error).toContain(
        'must be a moderator to be promoted to admin',
      );
    });

    it('should return error if user not found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await promoteToAdmin('nonexistent');

      expect('error' in result).toBe(true);
    });
  });

  describe('demoteToUser', () => {
    it('should demote a moderator to user role', async () => {
      const moderatorUser = { ...safeUser, role: 'moderator' };
      const demotedUser = { ...safeUser, role: 'user' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(moderatorUser as any);
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(demotedUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await demoteToUser('testmoderator')) as SafeDatabaseUser;

      expect(result.role).toEqual('user');
      expect(NotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUsername: 'testmoderator',
          type: 'role_change',
          message: expect.stringContaining('demoted to User'),
        }),
      );
    });

    it('should demote an admin to user role', async () => {
      const adminUser = { ...safeUser, role: 'admin' };
      const demotedUser = { ...safeUser, role: 'user' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(adminUser as any);
      jest.spyOn(UserModel, 'findOneAndUpdate').mockReturnValue({
        select: jest.fn().mockResolvedValue(demotedUser),
      } as unknown as Query<SafeDatabaseUser, typeof UserModel>);

      jest.spyOn(NotificationModel, 'create').mockResolvedValueOnce({} as any);

      const result = (await demoteToUser('testadmin')) as SafeDatabaseUser;

      expect(result.role).toEqual('user');
    });

    it('should not demote a regular user', async () => {
      const regularUser = { ...safeUser, role: 'user' };

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(regularUser as any);

      const result = await demoteToUser('regularuser');

      expect('error' in result).toBe(true);
      expect((result as { error: string }).error).toContain('must be a moderator');
    });
  });

  describe('checkUserSuspensionStatus', () => {
    it('should return suspended status for currently suspended user', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const suspendedUser = {
        suspendedUntil: futureDate,
        suspensionReason: 'Spam',
        isBanned: false,
        banReason: undefined,
      };

      jest.spyOn(UserModel, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(suspendedUser),
      } as unknown as Query<any, typeof UserModel>);

      const result = await checkUserSuspensionStatus('testuser');

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.isSuspended).toBe(true);
        expect(result.suspensionReason).toEqual('Spam');
      }
    });

    it('should return banned status for banned user', async () => {
      const bannedUser = {
        suspendedUntil: null,
        suspensionReason: undefined,
        isBanned: true,
        banReason: 'Hate Speech: Permanent ban reason',
      };

      jest.spyOn(UserModel, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(bannedUser),
      } as unknown as Query<any, typeof UserModel>);

      const result = await checkUserSuspensionStatus('banneduser');

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.isBanned).toBe(true);
        expect(result.banReason).toContain('Hate Speech');
      }
    });

    it('should return not suspended for user with past suspension', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const previouslySuspendedUser = {
        suspendedUntil: pastDate,
        suspensionReason: 'Spam',
        isBanned: false,
        banReason: undefined,
      };

      jest.spyOn(UserModel, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(previouslySuspendedUser),
      } as unknown as Query<any, typeof UserModel>);

      const result = await checkUserSuspensionStatus('testuser');

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.isSuspended).toBe(false);
      }
    });

    it('should return error if user not found', async () => {
      jest.spyOn(UserModel, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as unknown as Query<any, typeof UserModel>);

      const result = await checkUserSuspensionStatus('nonexistent');

      expect('error' in result).toBe(true);
    });
  });
});
