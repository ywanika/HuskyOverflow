import api from './config';

const MODERATION_API_URL = `/api/moderation`;

/**
 * Deletes a question (marks as deleted) - Moderator only
 * @param questionId - The ID of the question to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to the deletion result
 * @throws Error if the API response status is not 200
 */
export const deleteQuestion = async (
  questionId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.delete(`${MODERATION_API_URL}/delete/question/${questionId}`, {
    data: {
      moderatorUsername,
      deleteReason,
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while deleting question');
  }

  return res.data;
};

/**
 * Deletes an answer (marks as deleted) - Moderator only
 * @param answerId - The ID of the answer to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to the deletion result
 * @throws Error if the API response status is not 200
 */
export const deleteAnswer = async (
  answerId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.delete(`${MODERATION_API_URL}/delete/answer/${answerId}`, {
    data: {
      moderatorUsername,
      deleteReason,
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while deleting answer');
  }

  return res.data;
};

/**
 * Deletes a comment (marks as deleted) - Moderator only
 * @param commentId - The ID of the comment to delete
 * @param moderatorUsername - The username of the moderator performing the deletion
 * @param deleteReason - The reason for deletion
 * @returns Promise resolving to the deletion result
 * @throws Error if the API response status is not 200
 */
export const deleteComment = async (
  commentId: string,
  moderatorUsername: string,
  deleteReason: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.delete(`${MODERATION_API_URL}/delete/comment/${commentId}`, {
    data: {
      moderatorUsername,
      deleteReason,
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while deleting comment');
  }

  return res.data;
};

/**
 * Flags a question - Any user can flag
 * @param questionId - The ID of the question to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to the flagging result
 * @throws Error if the API response status is not 200
 */
export const flagQuestion = async (
  questionId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/question/${questionId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while flagging question');
  }

  return res.data;
};

/**
 * Flags an answer - Any user can flag
 * @param answerId - The ID of the answer to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to the flagging result
 * @throws Error if the API response status is not 200
 */
export const flagAnswer = async (
  answerId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/answer/${answerId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while flagging answer');
  }

  return res.data;
};

/**
 * Flags a comment - Any user can flag
 * @param commentId - The ID of the comment to flag
 * @param username - The username of the user flagging the content
 * @returns Promise resolving to the flagging result
 * @throws Error if the API response status is not 200
 */
export const flagComment = async (
  commentId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/flag/comment/${commentId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while flagging comment');
  }

  return res.data;
};

