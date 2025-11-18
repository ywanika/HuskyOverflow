import { Answer, PopulatedDatabaseAnswer } from '../types/types';
import api from './config';
import profanityService from './profanityService';
import { checkGuidelinesAgreement } from './userService';

const ANSWER_API_URL = `/api/answer`;

/**
 * Adds a new answer to a specific question.
 *
 * @param qid - The ID of the question to which the answer is being added.
 * @param ans - The answer object containing the answer details.
 * @param username - The username of the user creating the answer.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addAnswer = async (
  qid: string,
  ans: Answer,
  username: string,
): Promise<PopulatedDatabaseAnswer> => {
  const data = { qid, ans };

  await checkGuidelinesAgreement(username);
  await profanityService(ans.text);

  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while creating a new answer');
  }
  return res.data;
};

export default addAnswer;
