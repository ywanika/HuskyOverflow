import { sendMessage } from '../chatService';
import api from '../config';
import profanityService from '../profanityService';
import { ObjectId } from 'mongodb';

jest.mock('../config');
jest.mock('../profanityService');

// Mock ObjectId for testing
jest.mock('mongodb', () => ({
  ObjectId: jest.fn(() => ({
    toString: () => '507f1f77bcf86cd799439011',
  })),
}));

describe('chatService - sendMessage', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when message contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const chatID = '507f1f77bcf86cd799439011' as unknown as ObjectId;
    const message = {
      msgFrom: 'user1',
      msg: 'This is profanity',
      msgDateTime: new Date(),
    };

    await expect(sendMessage(message, chatID)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(message.msg);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when message passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'chat123' } });

    const chatID = '507f1f77bcf86cd799439011' as unknown as ObjectId;
    const message = {
      msgFrom: 'user1',
      msg: 'This is a clean message',
      msgDateTime: new Date(),
    };

    await sendMessage(message, chatID);

    expect(mockProfanityService).toHaveBeenCalledWith(message.msg);
    expect(mockApi.post).toHaveBeenCalledWith(`/api/chat/${chatID}/addMessage`, message);
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const chatID = '507f1f77bcf86cd799439011' as unknown as ObjectId;
    const message = {
      msgFrom: 'user1',
      msg: 'Clean message',
      msgDateTime: new Date(),
    };

    await expect(sendMessage(message, chatID)).rejects.toThrow('Error when adding message to chat');
  });

  it('returns the updated chat on success', async () => {
    const updatedChat = { _id: 'chat123', participants: ['user1', 'user2'], messages: [] };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: updatedChat });

    const chatID = '507f1f77bcf86cd799439011' as unknown as ObjectId;
    const message = {
      msgFrom: 'user1',
      msg: 'Clean message',
      msgDateTime: new Date(),
    };

    const result = await sendMessage(message, chatID);
    expect(result).toEqual(updatedChat);
  });
});
