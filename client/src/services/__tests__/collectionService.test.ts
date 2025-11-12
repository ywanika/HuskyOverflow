import { createCollection } from '../collectionService';
import axios from 'axios';
import profanityService from '../profanityService';

jest.mock('axios');
jest.mock('../profanityService');
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../userService', () => ({
  ...jest.requireActual('../userService'),
  checkGuidelinesAgreement: jest.fn(),
}));

describe('collectionService - createCollection', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;
  const mockCheckGuidelines = jest.requireMock('../userService').checkGuidelinesAgreement;

  const testUsername = 'testUser';

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckGuidelines.mockResolvedValue(undefined);
  });

  it('throws error when collection name contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const collection = {
      name: 'bad name with profanity',
      description: 'clean description',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    await expect(createCollection(collection, testUsername)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(collection.name);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('throws error when collection description contains profanity', async () => {
    mockProfanityService
      .mockResolvedValueOnce(undefined) // name passes
      .mockRejectedValueOnce(new Error('Profanity detected in text. Please revise.'));

    const collection = {
      name: 'clean name',
      description: 'bad description with profanity',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    await expect(createCollection(collection, testUsername)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledTimes(2);
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('calls API when name and description pass profanity checks', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockAxios.post.mockResolvedValueOnce({ status: 200, data: { _id: 'col123' } });

    const collection = {
      name: 'clean name',
      description: 'clean description',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    await createCollection(collection, testUsername);

    expect(mockProfanityService).toHaveBeenCalledTimes(2);
    expect(mockProfanityService).toHaveBeenCalledWith(collection.name);
    expect(mockProfanityService).toHaveBeenCalledWith(collection.description);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/collection/create', collection);
  });

  it('skips description profanity check if description is not provided', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockAxios.post.mockResolvedValueOnce({ status: 200, data: { _id: 'col123' } });

    const collection = {
      name: 'clean name',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    await createCollection(collection, testUsername);

    expect(mockProfanityService).toHaveBeenCalledTimes(1);
    expect(mockProfanityService).toHaveBeenCalledWith(collection.name);
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockAxios.post.mockResolvedValueOnce({ status: 400, data: {} });

    const collection = {
      name: 'clean name',
      description: 'clean description',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    await expect(createCollection(collection, testUsername)).rejects.toThrow('Error while creating collection');
  });

  it('returns the created collection on success', async () => {
    const createdCollection = { _id: 'col123', name: 'collection', description: 'desc' };
    mockProfanityService.mockResolvedValue(undefined);
    mockAxios.post.mockResolvedValueOnce({ status: 200, data: createdCollection });

    const collection = {
      name: 'clean name',
      description: 'clean description',
      username: 'user1',
      isPrivate: false,
      questions: [],
    };

    const result = await createCollection(collection, testUsername);
    expect(result).toEqual(createdCollection);
  });
});
