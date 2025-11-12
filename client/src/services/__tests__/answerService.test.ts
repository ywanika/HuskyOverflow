import addAnswer from '../answerService';
import api from '../config';
import profanityService from '../profanityService';
import { checkGuidelinesAgreement } from '../userService';

jest.mock('../config');
jest.mock('../profanityService');
jest.mock('../userService', () => ({
  ...jest.requireActual('../userService'),
  checkGuidelinesAgreement: jest.fn(),
}));

describe('answerService - addAnswer', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;
  const mockCheckGuidelines = checkGuidelinesAgreement as jest.MockedFunction<
    typeof checkGuidelinesAgreement
  >;
  const testUsername = 'testuser';

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckGuidelines.mockResolvedValue(undefined);
  });

  it('throws error when answer text contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const qid = 'question123';
    const ans = {
      text: 'This is profanity',
      ansBy: 'user1',
      ansDateTime: new Date(),
      comments: [],
    };

    await expect(addAnswer(qid, ans, testUsername)).rejects.toThrow('Profanity detected in text');
    expect(mockCheckGuidelines).toHaveBeenCalledWith(testUsername);
    expect(mockProfanityService).toHaveBeenCalledWith(ans.text);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when answer text passes profanity check', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'ans123' } });

    const qid = 'question123';
    const ans = {
      text: 'This is a clean answer',
      ansBy: 'user1',
      ansDateTime: new Date(),
      comments: [],
    };

    await addAnswer(qid, ans, testUsername);

    expect(mockProfanityService).toHaveBeenCalledWith(ans.text);
    expect(mockApi.post).toHaveBeenCalledWith('/api/answer/addAnswer', {
      qid,
      ans,
    });
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const qid = 'question123';
    const ans = {
      text: 'This is a clean answer',
      ansBy: 'user1',
      ansDateTime: new Date(),
      comments: [],
    };

    await expect(addAnswer(qid, ans, testUsername)).rejects.toThrow(
      'Error while creating a new answer',
    );
  });

  it('returns the created answer on success', async () => {
    const createdAnswer = { _id: 'ans123', text: 'answer', ansBy: 'user1', comments: [] };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: createdAnswer });

    const qid = 'question123';
    const ans = {
      text: 'Clean answer',
      ansBy: 'user1',
      ansDateTime: new Date(),
      comments: [],
    };

    const result = await addAnswer(qid, ans, testUsername);
    expect(result).toEqual(createdAnswer);
  });
});
