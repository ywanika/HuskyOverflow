import { addMessage } from '../messageService';
import api from '../config';
import profanityService from '../profanityService';

jest.mock('../config');
jest.mock('../profanityService');

describe('messageService - addMessage', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when message contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const messageToAdd = {
      msg: 'This message contains profanity',
      msgFrom: 'user1',
      msgDateTime: new Date(),
    };

    await expect(addMessage(messageToAdd)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(messageToAdd.msg);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when message passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'msg123' } });

    const messageToAdd = {
      msg: 'This is a clean message',
      msgFrom: 'user1',
      msgDateTime: new Date(),
    };

    await addMessage(messageToAdd);

    expect(mockProfanityService).toHaveBeenCalledWith(messageToAdd.msg);
    expect(mockApi.post).toHaveBeenCalledWith('/api/message/addMessage', {
      messageToAdd,
    });
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const messageToAdd = {
      msg: 'Clean message',
      msgFrom: 'user1',
      msgDateTime: new Date(),
    };

    await expect(addMessage(messageToAdd)).rejects.toThrow(
      'Error while adding a new message to a chat',
    );
  });

  it('returns the created message on success', async () => {
    const createdMessage = { _id: 'msg123', msg: 'message', msgFrom: 'user1' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: createdMessage });

    const messageToAdd = {
      msg: 'Clean message',
      msgFrom: 'user1',
      msgDateTime: new Date(),
    };

    const result = await addMessage(messageToAdd);
    expect(result).toEqual(createdMessage);
  });
});
