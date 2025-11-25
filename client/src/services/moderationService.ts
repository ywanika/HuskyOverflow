import api from './config';
import { AppealItem, AppealsResponse } from '@fake-stack-overflow/shared';

const MODERATION_API_URL = `/api/moderation`;

/**
 * Response type for moderation operations
 */
export interface ModerationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Flagged content item interface
 */
export interface FlaggedContentItem {
  _id: string;
  contentType: 'question' | 'answer' | 'comment';
  content: Record<string, unknown>;
  flaggedBy: string[];
  flaggedAt: Date[];
  reviewedBy?: string;
  reviewedAt?: Date;
}

/**
 * Response type for flagged content
 */
export interface FlaggedContentResponse {
  questions: FlaggedContentItem[];
  answers: FlaggedContentItem[];
  comments: FlaggedContentItem[];
  error?: string;
}

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

/**
 * Unflags a question - Any user can unflag their own flag
 * @param questionId - The ID of the question to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to the unflagging result
 * @throws Error if the API response status is not 200
 */
export const unflagQuestion = async (
  questionId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/unflag/question/${questionId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while unflagging question');
  }

  return res.data;
};

/**
 * Unflags an answer - Any user can unflag their own flag
 * @param answerId - The ID of the answer to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to the unflagging result
 * @throws Error if the API response status is not 200
 */
export const unflagAnswer = async (
  answerId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/unflag/answer/${answerId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while unflagging answer');
  }

  return res.data;
};

/**
 * Unflags a comment - Any user can unflag their own flag
 * @param commentId - The ID of the comment to unflag
 * @param username - The username of the user unflagging the content
 * @returns Promise resolving to the unflagging result
 * @throws Error if the API response status is not 200
 */
export const unflagComment = async (
  commentId: string,
  username: string,
): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`${MODERATION_API_URL}/unflag/comment/${commentId}`, {
    username,
  });

  if (res.status !== 200) {
    throw new Error('Error while unflagging comment');
  }

  return res.data;
};

/**
 * Gets all flagged content that hasn't been reviewed yet
 * @returns Promise resolving to FlaggedContentResponse
 */
export const getFlaggedContent = async (): Promise<FlaggedContentResponse> => {
  const res = await api.get(`${MODERATION_API_URL}/flagged`);

  if (res.status !== 200) {
    throw new Error('Error while fetching flagged content');
  }

  return res.data;
};

/**
 * Marks flagged content as reviewed by a moderator
 * @param contentType - Type of content being reviewed
 * @param contentId - ID of the content
 * @param moderatorUsername - Username of the moderator reviewing
 * @returns Promise resolving to ModerationResponse
 */
export const markAsReviewed = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  moderatorUsername: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/review`, {
    contentType,
    contentId,
    moderatorUsername,
  });

  if (res.status !== 200) {
    throw new Error('Error while marking content as reviewed');
  }

  return res.data;
};

/**
 * Dismisses a flag (unflags content) - Moderator only
 * @param contentType - Type of content
 * @param contentId - ID of the content
 * @param moderatorUsername - Username of the moderator
 * @returns Promise resolving to ModerationResponse
 */
export const dismissFlag = async (
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  moderatorUsername: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/dismiss`, {
    contentType,
    contentId,
    moderatorUsername,
  });

  if (res.status !== 200) {
    throw new Error('Error while dismissing flag');
  }

  return res.data;
};

// Re-export types from shared for convenience
export type { AppealItem, AppealsResponse };

/**
 * Submits an appeal for deleted content
 * @param contentId - ID of the content being appealed
 * @param contentType - Type of content being appealed
 * @param appealUser - Username of the user making the appeal
 * @param reason - Reason for the appeal (50-500 characters, at least 3 words)
 * @returns Promise resolving to ModerationResponse
 * @throws Error if the API response status is not 200
 */
export const submitAppeal = async (
  contentId: string,
  contentType: 'question' | 'answer' | 'comment',
  appealUser: string,
  reason: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/appeal/submit`, {
    contentId,
    contentType,
    appealUser,
    reason,
  });

  if (res.status !== 200) {
    throw new Error('Error while submitting appeal');
  }

  return res.data;
};

/**
 * Checks if an appeal already exists for content
 * @param contentId - ID of the content
 * @param appealUser - Username of the user
 * @returns Promise resolving to whether an appeal exists
 * @throws Error if the API response status is not 200
 */
export const checkExistingAppeal = async (
  contentId: string,
  appealUser: string,
): Promise<{ exists: boolean }> => {
  const res = await api.get(`${MODERATION_API_URL}/appeal/check`, {
    params: {
      contentId,
      appealUser,
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while checking appeal');
  }

  return res.data;
};

/**
 * Gets all appeals - Moderator only
 * @returns Promise resolving to AppealsResponse
 * @throws Error if the API response status is not 200
 */
export const getAppeals = async (): Promise<AppealsResponse> => {
  const res = await api.get(`${MODERATION_API_URL}/appeals`);

  if (res.status !== 200) {
    throw new Error('Error while fetching appeals');
  }

  return res.data;
};

/**
 * Approves an appeal - Moderator only
 * @param appealId - ID of the appeal
 * @param moderatorUsername - Username of the moderator
 * @param modResponse - Optional response from the moderator
 * @returns Promise resolving to ModerationResponse
 * @throws Error if the API response status is not 200
 */
export const approveAppeal = async (
  appealId: string,
  moderatorUsername: string,
  modResponse?: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/appeal/approve`, {
    appealId,
    moderatorUsername,
    modResponse,
  });

  if (res.status !== 200) {
    throw new Error('Error while approving appeal');
  }

  return res.data;
};

/**
 * Rejects an appeal - Moderator only
 * @param appealId - ID of the appeal
 * @param moderatorUsername - Username of the moderator
 * @param modResponse - Optional response from the moderator
 * @returns Promise resolving to ModerationResponse
 * @throws Error if the API response status is not 200
 */
export const rejectAppeal = async (
  appealId: string,
  moderatorUsername: string,
  modResponse?: string,
): Promise<ModerationResponse> => {
  const res = await api.post(`${MODERATION_API_URL}/appeal/reject`, {
    appealId,
    moderatorUsername,
    modResponse,
  });

  if (res.status !== 200) {
    throw new Error('Error while rejecting appeal');
  }

  return res.data;
};
