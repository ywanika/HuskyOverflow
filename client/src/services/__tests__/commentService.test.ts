import addComment from '../commentService';
import api from '../config';
import profanityService from '../profanityService';

jest.mock('../config');
jest.mock('../profanityService');

describe('commentService - addComment', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockProfanityService = profanityService as jest.MockedFunction<typeof profanityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when comment text contains profanity', async () => {
    mockProfanityService.mockRejectedValueOnce(
      new Error('Profanity detected in text. Please revise.'),
    );

    const id = 'question123';
    const comment = {
      text: 'This comment contains profanity',
      commentBy: 'user1',
      commentDateTime: new Date(),
    };

    await expect(addComment(id, 'question', comment)).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
    expect(mockProfanityService).toHaveBeenCalledWith(comment.text);
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('calls API when comment passes profanity check for question', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'comment123' } });

    const id = 'question123';
    const comment = {
      text: 'This is a clean comment',
      commentBy: 'user1',
      commentDateTime: new Date(),
    };

    await addComment(id, 'question', comment);

    expect(mockProfanityService).toHaveBeenCalledWith(comment.text);
    expect(mockApi.post).toHaveBeenCalledWith('/api/comment/addComment', {
      id,
      type: 'question',
      comment,
    });
  });

  it('calls API when comment passes profanity check for answer', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: { _id: 'comment123' } });

    const id = 'answer123';
    const comment = {
      text: 'This is a clean comment',
      commentBy: 'user1',
      commentDateTime: new Date(),
    };

    await addComment(id, 'answer', comment);

    expect(mockProfanityService).toHaveBeenCalledWith(comment.text);
    expect(mockApi.post).toHaveBeenCalledWith('/api/comment/addComment', {
      id,
      type: 'answer',
      comment,
    });
  });

  it('throws error when API response status is not 200', async () => {
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 400, data: {} });

    const id = 'question123';
    const comment = {
      text: 'Clean comment',
      commentBy: 'user1',
      commentDateTime: new Date(),
    };

    await expect(addComment(id, 'question', comment)).rejects.toThrow(
      'Error while creating a new comment for the question',
    );
  });

  it('returns the created comment on success', async () => {
    const createdComment = { _id: 'comment123', text: 'comment', commentBy: 'user1' };
    mockProfanityService.mockResolvedValueOnce(undefined);
    mockApi.post.mockResolvedValueOnce({ status: 200, data: createdComment });

    const id = 'question123';
    const comment = {
      text: 'Clean comment',
      commentBy: 'user1',
      commentDateTime: new Date(),
    };

    const result = await addComment(id, 'question', comment);
    expect(result).toEqual(createdComment);
  });
});
