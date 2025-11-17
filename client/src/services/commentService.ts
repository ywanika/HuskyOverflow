import api from './config';
import { Comment, DatabaseComment } from '../types/types';
import profanityService from './profanityService';
import { checkGuidelinesAgreement } from './userService';

const COMMENT_API_URL = `/api/comment`;

/**
 * Interface extending the request body when adding a comment to a question or an answer, which contains:
 * - id - The unique identifier of the question or answer being commented on.
 * - type - The type of the comment, either 'question' or 'answer'.
 * - comment - The comment being added.
 */
interface AddCommentRequestBody {
  id?: string;
  type: 'question' | 'answer';
  comment: Comment;
}

/**
 * Adds a new comment to a specific question.
 *
 * @param id - The ID of the question to which the comment is being added.
 * @param type - The type of the comment, either 'question' or 'answer'.
 * @param comment - The comment object containing the comment details.
 * @param username - The username of the user creating the comment.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addComment = async (
  id: string,
  type: 'question' | 'answer',
  comment: Comment,
  username: string,
): Promise<DatabaseComment> => {
  const reqBody: AddCommentRequestBody = {
    id,
    type,
    comment,
  };
  await checkGuidelinesAgreement(username);
  await profanityService(comment.text);
  const res = await api.post(`${COMMENT_API_URL}/addComment`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while creating a new comment for the question');
  }
  return res.data;
};

export default addComment;
