import { createUser, updateBiography } from '../userService';
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
    mockProfanityService.mockRejectedValueOnce(
      new Error('USERNAME_PROFANITY: Profanity detected in username. Please revise.'),
    );

    const credentials = {
      username: 'baduserwithprofanity',
      password: 'cleanpassword123',
    };

    await expect(createUser(credentials)).rejects.toThrow(
      'USERNAME_PROFANITY: Profanity detected in username. Please revise.',
    );
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
    };

    const result = await createUser(credentials);

    expect(result).toEqual(mockUser);
    expect(mockProfanityService).toHaveBeenCalledWith(credentials.username);
    expect(mockApi.post).toHaveBeenCalledWith('/api/user/signup', credentials);
  });
});
