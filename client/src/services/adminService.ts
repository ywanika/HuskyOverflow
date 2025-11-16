import api from './config';

const ADMIN_API_URL = `/api/admin`;

/**
 * Interface for dashboard metrics
 */
export interface DashboardMetrics {
  users: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    byRole: {
      user: number;
      moderator: number;
      admin: number;
    };
    active: number;
    suspended: number;
  };
  content: {
    questions: {
      total: number;
      withAnswers: number;
      unanswered: number;
      flagged: number;
      deleted: number;
    };
    answers: {
      total: number;
      flagged: number;
      deleted: number;
    };
    comments: {
      total: number;
      flagged: number;
      deleted: number;
    };
  };
  engagement: {
    totalViews: number;
    totalUpvotes: number;
    totalDownvotes: number;
    averageAnswersPerQuestion: number;
    averageCommentsPerAnswer: number;
  };
  moderation: {
    totalFlagged: number;
    totalReviewed: number;
    totalDeleted: number;
    pendingReview: number;
  };
  tags: {
    total: number;
    mostUsed: Array<{ name: string; count: number }>;
  };
  communities: {
    total: number;
    public: number;
    private: number;
  };
  collections: {
    total: number;
  };
  messages: {
    total: number;
  };
  growth: {
    questionsByWeek: Array<{ week: string; count: number }>;
    usersByWeek: Array<{ week: string; count: number }>;
  };
}

/**
 * Gets dashboard metrics - Admin only
 * @param username - The username of the admin requesting metrics
 * @returns Promise resolving to DashboardMetrics
 * @throws Error if the API response status is not 200
 */
export const getDashboardMetrics = async (username: string): Promise<DashboardMetrics> => {
  const res = await api.get(`${ADMIN_API_URL}/metrics?username=${username}`);

  if (res.status !== 200) {
    throw new Error('Error while fetching dashboard metrics');
  }

  return res.data;
};

