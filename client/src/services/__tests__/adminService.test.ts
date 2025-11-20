import { getDashboardMetrics, DashboardMetrics } from '../adminService';
import api from '../config';

jest.mock('../config');

describe('adminService - COS 3.4: Admin Dashboard Metrics', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMetrics: DashboardMetrics = {
    users: {
      total: 100,
      newThisWeek: 5,
      newThisMonth: 20,
      byRole: {
        user: 85,
        moderator: 10,
        admin: 5,
      },
      active: 50,
      suspended: 2,
    },
    content: {
      questions: {
        total: 500,
        withAnswers: 400,
        unanswered: 100,
        flagged: 10,
        deleted: 5,
      },
      answers: {
        total: 1000,
        flagged: 5,
        deleted: 2,
      },
      comments: {
        total: 2000,
        flagged: 3,
        deleted: 1,
      },
    },
    engagement: {
      totalViews: 10000,
      totalUpvotes: 5000,
      totalDownvotes: 500,
      averageAnswersPerQuestion: 2.0,
      averageCommentsPerAnswer: 2.0,
    },
    moderation: {
      totalFlagged: 18,
      totalReviewed: 15,
      totalDeleted: 8,
      pendingReview: 3,
    },
    tags: {
      total: 50,
      mostUsed: [
        { name: 'javascript', count: 100 },
        { name: 'react', count: 80 },
      ],
    },
    communities: {
      total: 10,
      public: 8,
      private: 2,
    },
    collections: {
      total: 25,
    },
    messages: {
      total: 500,
    },
    growth: {
      questionsByWeek: [
        { week: '2024-01', count: 10 },
        { week: '2024-02', count: 15 },
      ],
      usersByWeek: [
        { week: '2024-01', count: 5 },
        { week: '2024-02', count: 8 },
      ],
    },
  };

  it('should fetch dashboard metrics successfully (COS 3.4)', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result).toEqual(mockMetrics);
    expect(mockApi.get).toHaveBeenCalledWith('/api/admin/metrics?username=admin1');
  });

  it('should include total registered users count', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result.users.total).toBe(100);
  });

  it('should include posts per day calculation', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result.content.questions.total).toBe(500);
    expect(result.content.answers.total).toBe(1000);
  });

  it('should include questions vs answers ratio', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    const ratio = result.content.questions.total / result.content.answers.total;
    expect(ratio).toBe(0.5); // 500 questions / 1000 answers = 0.5
  });

  it('should include flagged content count (COS 3.4)', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result.moderation.pendingReview).toBe(3);
    expect(result.moderation.totalFlagged).toBe(18);
  });

  it('should throw error when API request fails', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 403,
      data: {},
    });

    await expect(getDashboardMetrics('admin1')).rejects.toThrow(
      'Error while fetching dashboard metrics',
    );
  });

  it('should throw error when user is not admin', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 403,
      data: { error: 'Unauthorized: Admin access required' },
    });

    await expect(getDashboardMetrics('regularuser')).rejects.toThrow();
  });

  it('should include user role breakdown', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result.users.byRole.user).toBe(85);
    expect(result.users.byRole.moderator).toBe(10);
    expect(result.users.byRole.admin).toBe(5);
  });

  it('should include engagement metrics', async () => {
    mockApi.get.mockResolvedValueOnce({
      status: 200,
      data: mockMetrics,
    });

    const result = await getDashboardMetrics('admin1');

    expect(result.engagement.totalViews).toBe(10000);
    expect(result.engagement.totalUpvotes).toBe(5000);
    expect(result.engagement.totalDownvotes).toBe(500);
  });
});
