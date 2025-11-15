import { addQuestion } from '../questionService';
import api from '../config';
import profanityService from '../profanityService';
import { checkGuidelinesAgreement } from '../userService';

jest.mock('../config');
jest.mock('../profanityService');
jest.mock('../userService', () => ({
  ...jest.requireActual('../userService'),
  checkGuidelinesAgreement: jest.fn(),
}));

describe('questionService - addQuestion', () => {
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

  it('throws error when user has not agreed to guidelines', async () => {
    mockCheckGuidelines.mockRejectedValueOnce(
      new Error('You must agree to the community guidelines before posting.'),
    );

    const question = {
      title: 'Valid title',
      text: 'Valid question text',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await expect(addQuestion(question, testUsername)).rejects.toThrow(
      'You must agree to the community guidelines before posting.',
    );
    expect(mockCheckGuidelines).toHaveBeenCalledWith(testUsername);
    expect(mockProfanityService).not.toHaveBeenCalled();
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('throws error when question title contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('TITLE_PROFANITY: Profanity detected in title. Please revise.'),
    );

    const question = {
      title: 'This title has profanity',
      text: 'clean question text',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await expect(addQuestion(question, testUsername)).rejects.toThrow('TITLE_PROFANITY');
    expect(mockCheckGuidelines).toHaveBeenCalledWith(testUsername);
    expect(mockProfanityService).toHaveBeenCalledWith(question.title);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('throws error when question text contains profanity', async () => {
    mockProfanityService
      .mockResolvedValueOnce(undefined) // title passes
      .mockRejectedValueOnce(
        new Error('TEXT_PROFANITY: Profanity detected in question text. Please revise.'),
      );

    const question = {
      title: 'Clean Title',
      text: 'This text has profanity',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await expect(addQuestion(question, testUsername)).rejects.toThrow('TEXT_PROFANITY');
    expect(mockProfanityService).toHaveBeenCalledTimes(2);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('throws error when question tags contain profanity', async () => {
    mockProfanityService
      .mockResolvedValueOnce(undefined) // title passes
      .mockResolvedValueOnce(undefined) // text passes
      .mockRejectedValueOnce(
        new Error('TAG_PROFANITY: Profanity detected in tags. Please revise.'),
      );

    const question = {
      title: 'Clean Title',
      text: 'Clean text',
      tags: [{ name: 'bad-tag-with-profanity', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await expect(addQuestion(question, testUsername)).rejects.toThrow('TAG_PROFANITY');
    expect(mockProfanityService).toHaveBeenCalledTimes(3);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when title, text, and tags pass profanity checks', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'q123' } });

    const question = {
      title: 'Clean Title',
      text: 'Clean text',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await addQuestion(question, testUsername);

    expect(mockProfanityService).toHaveBeenCalledTimes(3);
    expect(mockProfanityService).toHaveBeenCalledWith(question.title);
    expect(mockProfanityService).toHaveBeenCalledWith(question.text);
    expect(mockApi.post).toHaveBeenCalledWith('/api/question/addQuestion', question);
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const question = {
      title: 'Clean Title',
      text: 'Clean text',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    await expect(addQuestion(question, testUsername)).rejects.toThrow(
      'Error while creating a new question',
    );
  });

  it('returns the created question on success', async () => {
    const createdQuestion = { _id: 'q123', title: 'question', text: 'text' };
    mockProfanityService.mockResolvedValue(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: createdQuestion });

    const question = {
      title: 'Clean Title',
      text: 'Clean text',
      tags: [{ name: 'javascript', description: 'desc' }],
      askedBy: 'user1',
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      community: null,
    };

    const result = await addQuestion(question, testUsername);
    expect(result).toEqual(createdQuestion);
  });
});
