import api from './config';
import { ModerationResponse } from '../types/types';

const MODERATION_API_URL = `/api/moderation`;

/**
 * Flags a question
 * @param questionId - The ID of the question to flag
 * @param username - The username of the user flagging
 * @returns Promise resolving to ModerationResponse
 */
export const flagQuestion = async (
  questionId: string,
  username: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/question`, {
    questionId,
    username,
  });

  if (res.status !== 200) {
    throw new Error(res.data.error || 'Error flagging question');
  }

  return res.data;
};

/**
 * Flags an answer
 * @param answerId - The ID of the answer to flag
 * @param username - The username of the user flagging
 * @returns Promise resolving to ModerationResponse
 */
export const flagAnswer = async (
  answerId: string,
  username: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/answer`, {
    answerId,
    username,
  });

  if (res.status !== 200) {
    throw new Error(res.data.error || 'Error flagging answer');
  }

  return res.data;
};

/**
 * Flags a comment
 * @param commentId - The ID of the comment to flag
 * @param username - The username of the user flagging
 * @returns Promise resolving to ModerationResponse
 */
export const flagComment = async (
  commentId: string,
  username: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/comment`, {
    commentId,
    username,
  });

  if (res.status !== 200) {
    throw new Error(res.data.error || 'Error flagging comment');
  }

  return res.data;
};
