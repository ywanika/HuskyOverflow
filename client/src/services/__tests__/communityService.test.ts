import { createCommunity } from '../communityService';
import api from '../config';
import profanityService from '../profanityService';

jest.mock('../config');
jest.mock('../profanityService');

describe('communityService - createCommunity', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when community name contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const community = {
      name: 'bad community name with profanity',
      description: 'clean description',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };

    await expect(createCommunity(community)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(community.name);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('throws error when community description contains profanity', async () => {
    mockProfanityService
      .mockResolvedValueOnce(undefined) // name passes
      .mockRejectedValueOnce(new Error('Profanity detected in text. Please revise.'));

    const community = {
      name: 'clean community name',
      description: 'bad description with profanity',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };

    await expect(createCommunity(community)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledTimes(2);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when name and description pass profanity checks', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'com123' } });

    const community = {
      name: 'clean community name',
      description: 'clean description',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };

    await createCommunity(community);

    expect(mockProfanityService).toHaveBeenCalledTimes(2);
    expect(mockProfanityService).toHaveBeenCalledWith(community.name);
    expect(mockProfanityService).toHaveBeenCalledWith(community.description);
    expect(mockApi.post).toHaveBeenCalledWith('/api/community/create', community);
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const community = {
      name: 'clean community name',
      description: 'clean description',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };

    await expect(createCommunity(community)).rejects.toThrow('Error while creating community');
  });

  it('returns the created community on success', async () => {
    const createdCommunity = {
      _id: 'com123',
      name: 'community',
      description: 'desc',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: createdCommunity });

    const community = {
      name: 'clean community name',
      description: 'clean description',
      participants: ['user1'],
      visibility: 'PUBLIC',
      admin: 'user1',
    };

    const result = await createCommunity(community);
    expect(result).toEqual(createdCommunity);
  });
});
