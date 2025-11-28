import {
  createUser,
  updateBiography,
  checkGuidelinesAgreement,
  updateGuidelinesAgreement,
  createUserWithRole,
  updateUser,
  deleteUser,
} from '../userService';
import api from '../config';
import profanityService from '../profanityService';

jest.mock('../config');
jest.mock('../profanityService');

describe('updateBiography', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when user has not agreed to guidelines', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 403, data: { agreed: false } });

    const username = 'user1';
    const newBiography = 'This is a clean biography';

    await expect(updateBiography(username, newBiography)).rejects.toThrow(
      'You must agree to the community guidelines before posting.',
    );
  });

  it('calls profanity service when updating biography and passes back error', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: true } });
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const username = 'user1';
    const newBiography = 'This biography contains profanity';

    await expect(updateBiography(username, newBiography)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
  });

  it('calls API when biography passes profanity check', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: true } });
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: { _id: 'user123' } });

    const username = 'user1';
    const newBiography = 'This is a clean biography';

    await updateBiography(username, newBiography);

    expect(mockProfanityService).toHaveBeenCalledWith(newBiography);
    expect(mockApi.patch).toHaveBeenCalledWith(`/api/user/updateBiography`, {
      username,
      biography: newBiography,
    });
  });

  it('throws error when API response status is not 200', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: true } });
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.patch.mockResolvedValueOnce({ status: 400, data: {} });

    const username = 'user1';
    const newBiography = 'Another clean biography';

    await expect(updateBiography(username, newBiography)).rejects.toThrow();
  });

  it('returns the updated user on success', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: true } });
    const mockUser = { _id: 'user123', username: 'user1', biography: 'Updated biography' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'user1';
    const newBiography = 'Updated biography';

    const result = await updateBiography(username, newBiography);

    expect(result).toEqual(mockUser);
    expect(mockProfanityService).toHaveBeenCalledWith(newBiography);
    expect(mockApi.patch).toHaveBeenCalledWith(`/api/user/updateBiography`, {
      username,
      biography: newBiography,
    });
  });
});

describe('createUser', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls profanity service when creating user and passes back error', async () => {
    mockProfanityService.mockRejectedValueOnce(new Error('Thrown from mock'));

    const credentials = {
      username: 'baduserwithprofanity',
      password: 'cleanpassword123',
      agreedToGuidelines: true,
    };

    await expect(createUser(credentials)).rejects.toThrow('Thrown from mock');
    expect(mockProfanityService).toHaveBeenCalledWith(credentials.username);
  });

  it('calls API when username passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'user1' },
    });

    const credentials = {
      username: 'cleanuser',
      password: 'cleanpassword123',
      agreedToGuidelines: true,
    };

    await createUser(credentials);

    expect(mockProfanityService).toHaveBeenCalledWith(credentials.username);
    expect(mockApi.post).toHaveBeenCalledWith('/api/user/signup', credentials);
  });

  it('throws error when API call fails', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockRejectedValueOnce({
      response: { data: 'User already exists' },
      isAxiosError: true,
    });

    const credentials = {
      username: 'cleanuser',
      password: 'cleanpassword123',
      agreedToGuidelines: true,
    };

    await expect(createUser(credentials)).rejects.toThrow('Error while signing up');
  });

  it('returns the created user on success', async () => {
    const mockUser = { _id: 'user123', username: 'user1' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: mockUser });

    const credentials = {
      username: 'user1',
      password: 'password123',
      agreedToGuidelines: true,
    };

    const result = await createUser(credentials);

    expect(result).toEqual(mockUser);
    expect(mockProfanityService).toHaveBeenCalledWith(credentials.username);
    expect(mockApi.post).toHaveBeenCalledWith('/api/user/signup', credentials);
  });

  it('includes agreedToGuidelines flag when creating user', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'user1', agreedToGuidelines: false },
    });

    const credentials = {
      username: 'user1',
      password: 'password123',
      agreedToGuidelines: false,
    };

    await createUser(credentials);

    expect(mockApi.post).toHaveBeenCalledWith('/api/user/signup', credentials);
    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/user/signup',
      expect.objectContaining({ agreedToGuidelines: false }),
    );
  });
});

describe('checkGuidelinesAgreement', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not throw error when user has agreed to guidelines', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: true } });

    const username = 'user1';

    await expect(checkGuidelinesAgreement(username)).resolves.not.toThrow();
    expect(mockApi.get).toHaveBeenCalledWith('/api/user/checkGuidelines/user1');
  });

  it('throws error when user has not agreed to guidelines (403 status)', async () => {
    mockApi.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 403,
        data: { message: 'User has not agreed to guidelines' },
      },
    });

    const username = 'user1';

    await expect(checkGuidelinesAgreement(username)).rejects.toThrow(
      'User has not agreed to guidelines',
    );
    expect(mockApi.get).toHaveBeenCalledWith('/api/user/checkGuidelines/user1');
  });

  it('throws default error message when 403 has no custom message', async () => {
    mockApi.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 403,
        data: {},
      },
    });

    const username = 'user1';

    await expect(checkGuidelinesAgreement(username)).rejects.toThrow(
      'You must agree to the community guidelines before posting',
    );
  });

  it('throws error when API response indicates user has not agreed', async () => {
    mockApi.get.mockResolvedValueOnce({ status: 200, data: { agreed: false } });

    const username = 'user1';

    await expect(checkGuidelinesAgreement(username)).rejects.toThrow(
      'You must agree to the community guidelines before posting.',
    );
  });

  it('re-throws non-403 errors', async () => {
    const networkError = new Error('Network error');
    mockApi.get.mockRejectedValueOnce(networkError);

    const username = 'user1';

    await expect(checkGuidelinesAgreement(username)).rejects.toThrow('Network error');
  });
});

describe('updateGuidelinesAgreement', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates guidelines agreement to true', async () => {
    const mockUser = {
      _id: 'user123',
      username: 'user1',
      agreedToGuidelines: true,
    };
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'user1';
    const agreedToGuidelines = true;

    const result = await updateGuidelinesAgreement(username, agreedToGuidelines);

    expect(result).toEqual(mockUser);
    expect(mockApi.patch).toHaveBeenCalledWith('/api/user/updateGuidelinesAgreement', {
      username,
      agreedToGuidelines: true,
    });
  });

  it('updates guidelines agreement to false', async () => {
    const mockUser = {
      _id: 'user123',
      username: 'user1',
      agreedToGuidelines: false,
    };
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'user1';
    const agreedToGuidelines = false;

    const result = await updateGuidelinesAgreement(username, agreedToGuidelines);

    expect(result).toEqual(mockUser);
    expect(mockApi.patch).toHaveBeenCalledWith('/api/user/updateGuidelinesAgreement', {
      username,
      agreedToGuidelines: false,
    });
  });

  it('throws error when API response status is not 200', async () => {
    mockApi.patch.mockResolvedValueOnce({ status: 400, data: {} });

    const username = 'user1';
    const agreedToGuidelines = true;

    await expect(updateGuidelinesAgreement(username, agreedToGuidelines)).rejects.toThrow(
      'Error when updating guidelines agreement',
    );
  });

  it('throws error when API call fails', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('Network error'));

    const username = 'user1';
    const agreedToGuidelines = true;

    await expect(updateGuidelinesAgreement(username, agreedToGuidelines)).rejects.toThrow(
      'Network error',
    );
  });
});

describe('createUserWithRole', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls profanity service when creating user and passes back error', async () => {
    mockProfanityService.mockRejectedValueOnce(new Error('Profanity detected'));

    const username = 'baduser';
    const password = 'password123';
    const role = 'user' as const;
    const adminUsername = 'admin';

    await expect(createUserWithRole(username, password, role, adminUsername)).rejects.toThrow(
      'Profanity detected',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(username);
  });

  it('calls API with correct parameters when username passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'newuser', role: 'user' },
    });

    const username = 'newuser';
    const password = 'password123';
    const role = 'user' as const;
    const adminUsername = 'admin';

    await createUserWithRole(username, password, role, adminUsername);

    expect(mockProfanityService).toHaveBeenCalledWith(username);
    expect(mockApi.post).toHaveBeenCalledWith(`/api/admin/create-user?username=${adminUsername}`, {
      username,
      password,
      role,
    });
  });

  it('throws error when API call fails with axios error', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockRejectedValueOnce({
      response: { data: { error: 'User already exists' } },
      isAxiosError: true,
    });

    const username = 'existinguser';
    const password = 'password123';
    const role = 'user' as const;
    const adminUsername = 'admin';

    await expect(createUserWithRole(username, password, role, adminUsername)).rejects.toThrow(
      'Error while creating user: User already exists',
    );
  });

  it('throws error when API call fails with generic error', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockRejectedValueOnce(new Error('Network error'));

    const username = 'newuser';
    const password = 'password123';
    const role = 'user' as const;
    const adminUsername = 'admin';

    await expect(createUserWithRole(username, password, role, adminUsername)).rejects.toThrow(
      'Error while creating user: Network error',
    );
  });

  it('returns the created user on success', async () => {
    const mockUser = { _id: 'user123', username: 'newuser', role: 'moderator' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'newuser';
    const password = 'password123';
    const role = 'moderator' as const;
    const adminUsername = 'admin';

    const result = await createUserWithRole(username, password, role, adminUsername);

    expect(result).toEqual(mockUser);
    expect(mockProfanityService).toHaveBeenCalledWith(username);
    expect(mockApi.post).toHaveBeenCalledWith(`/api/admin/create-user?username=${adminUsername}`, {
      username,
      password,
      role,
    });
  });

  it('works with different roles', async () => {
    const mockUser = { _id: 'user123', username: 'newadmin', role: 'admin' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'newadmin';
    const password = 'password123';
    const role = 'admin' as const;
    const adminUsername = 'superadmin';

    const result = await createUserWithRole(username, password, role, adminUsername);

    expect(result).toEqual(mockUser);
    expect(mockApi.post).toHaveBeenCalledWith(`/api/admin/create-user?username=${adminUsername}`, {
      username,
      password,
      role,
    });
  });
});

describe('updateUser', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls profanity service when username is being updated and passes back error', async () => {
    mockProfanityService.mockRejectedValueOnce(new Error('Profanity detected'));

    const username = 'olduser';
    const updates = { username: 'badusername' };

    await expect(updateUser(username, updates)).rejects.toThrow('Profanity detected');
    expect(mockProfanityService).toHaveBeenCalledWith('badusername');
  });

  it('does not call profanity service when username is not being updated', async () => {
    mockApi.patch.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'user1', biography: 'Updated bio' },
    });

    const username = 'user1';
    const updates = { biography: 'Updated biography' };

    await updateUser(username, updates);

    expect(mockProfanityService).not.toHaveBeenCalled();
    expect(mockApi.patch).toHaveBeenCalledWith('/api/user/updateUser', {
      username,
      updates,
    });
  });

  it('calls API with correct parameters when username passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.patch.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'newusername' },
    });

    const username = 'olduser';
    const updates = { username: 'newusername', biography: 'New bio' };

    await updateUser(username, updates);

    expect(mockProfanityService).toHaveBeenCalledWith('newusername');
    expect(mockApi.patch).toHaveBeenCalledWith('/api/user/updateUser', {
      username,
      updates,
    });
  });

  it('throws error when API call fails with axios error', async () => {
    mockApi.patch.mockRejectedValueOnce({
      response: { data: 'Username already exists' },
      isAxiosError: true,
    });

    const username = 'user1';
    const updates = { username: 'existinguser' };

    await expect(updateUser(username, updates)).rejects.toThrow('Username already exists');
  });

  it('throws generic error when API call fails without response', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('Network error'));

    const username = 'user1';
    const updates = { biography: 'New bio' };

    await expect(updateUser(username, updates)).rejects.toThrow('Network error');
  });

  it('returns the updated user on success', async () => {
    const mockUser = { _id: 'user123', username: 'updateduser', biography: 'Updated bio' };
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'user1';
    const updates = { username: 'updateduser', biography: 'Updated bio' };

    const result = await updateUser(username, updates);

    expect(result).toEqual(mockUser);
    expect(mockApi.patch).toHaveBeenCalledWith('/api/user/updateUser', {
      username,
      updates,
    });
  });

  it('handles partial updates correctly', async () => {
    const mockUser = { _id: 'user123', username: 'user1', biography: 'Only bio updated' };
    mockApi.patch.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'user1';
    const updates = { biography: 'Only bio updated' };

    const result = await updateUser(username, updates);

    expect(result).toEqual(mockUser);
    expect(mockProfanityService).not.toHaveBeenCalled();
  });
});

describe('deleteUser', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls API with correct username parameter', async () => {
    mockApi.delete.mockResolvedValueOnce({
      status: 200,
      data: { _id: 'user123', username: 'deleteduser' },
    });

    const username = 'userToDelete';

    await deleteUser(username);

    expect(mockApi.delete).toHaveBeenCalledWith('/api/user/deleteUser/userToDelete');
  });

  it('throws error when API response status is not 200', async () => {
    mockApi.delete.mockResolvedValueOnce({ status: 404, data: {} });

    const username = 'nonexistentuser';

    await expect(deleteUser(username)).rejects.toThrow('Error when deleting user');
  });

  it('throws error when API call fails', async () => {
    mockApi.delete.mockRejectedValueOnce(new Error('Network error'));

    const username = 'user1';

    await expect(deleteUser(username)).rejects.toThrow('Network error');
  });

  it('returns the deleted user on success', async () => {
    const mockUser = { _id: 'user123', username: 'deleteduser', role: 'user' };
    mockApi.delete.mockResolvedValueOnce({ status: 200, data: mockUser });

    const username = 'deleteduser';

    const result = await deleteUser(username);

    expect(result).toEqual(mockUser);
    expect(mockApi.delete).toHaveBeenCalledWith('/api/user/deleteUser/deleteduser');
  });
});
