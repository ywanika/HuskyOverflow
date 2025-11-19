import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
import UserModel from '../models/users.model';
import TagModel from '../models/tags.model';
import CommunityModel from '../models/community.model';
import CollectionModel from '../models/collection.model';
import MessageModel from '../models/messages.model';
import { DatabaseUser } from '../types/types';

/**
 * Response type for admin operations
 */
export interface AdminResponse {
  success: boolean;
  error?: string;
}

/**
 * Checks if a user has admin privileges
 * @param username - The username to check
 * @returns Promise resolving to true if user is admin, false otherwise
 */
export const isAdmin = async (username: string): Promise<boolean> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username });
    if (!user) {
      return false;
    }
    return user.role === 'admin';
  } catch (error) {
    return false;
  }
};

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
    active: number; // Users active in last 7 days
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
 * Gets comprehensive dashboard metrics - Admin only
 * @returns Promise resolving to DashboardMetrics
 */
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User metrics
    const totalUsers = await UserModel.countDocuments();
    const newUsersThisWeek = await UserModel.countDocuments({
      dateJoined: { $gte: oneWeekAgo },
    });
    const newUsersThisMonth = await UserModel.countDocuments({
      dateJoined: { $gte: oneMonthAgo },
    });
    const usersByRole = await UserModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);
    const roleMap: { user: number; moderator: number; admin: number } = {
      user: 0,
      moderator: 0,
      admin: 0,
    };
    usersByRole.forEach(item => {
      const role = (item._id || 'user') as 'user' | 'moderator' | 'admin';
      if (role in roleMap) {
        roleMap[role] = item.count;
      }
    });
    const activeUsers = await UserModel.countDocuments({
      lastActive: { $gte: oneWeekAgo },
    });
    const suspendedUsers = await UserModel.countDocuments({
      suspendedUntil: { $gt: now },
    });

    // Content metrics
    const totalQuestions = await QuestionModel.countDocuments();
    const questionsWithAnswers = await QuestionModel.countDocuments({
      answers: { $exists: true, $ne: [] },
    });
    const unansweredQuestions = totalQuestions - questionsWithAnswers;
    const flaggedQuestions = await QuestionModel.countDocuments({
      'flagged.isFlagged': true,
    });
    const deletedQuestions = await QuestionModel.countDocuments({
      'deleted.isDeleted': true,
    });

    const totalAnswers = await AnswerModel.countDocuments();
    const flaggedAnswers = await AnswerModel.countDocuments({
      'flagged.isFlagged': true,
    });
    const deletedAnswers = await AnswerModel.countDocuments({
      'deleted.isDeleted': true,
    });

    const totalComments = await CommentModel.countDocuments();
    const flaggedComments = await CommentModel.countDocuments({
      'flagged.isFlagged': true,
    });
    const deletedComments = await CommentModel.countDocuments({
      'deleted.isDeleted': true,
    });

    // Engagement metrics
    const questions = await QuestionModel.find().lean();
    const totalViews = questions.reduce((sum, q) => sum + (q.views?.length || 0), 0);
    const totalUpvotes = questions.reduce((sum, q) => sum + (q.upVotes?.length || 0), 0);
    const totalDownvotes = questions.reduce((sum, q) => sum + (q.downVotes?.length || 0), 0);
    const averageAnswersPerQuestion =
      questionsWithAnswers > 0
        ? questions.reduce((sum, q) => sum + (q.answers?.length || 0), 0) / questionsWithAnswers
        : 0;

    const answers = await AnswerModel.find().lean();
    const totalAnswerComments = answers.reduce((sum, a) => sum + (a.comments?.length || 0), 0);
    const averageCommentsPerAnswer = totalAnswers > 0 ? totalAnswerComments / totalAnswers : 0;

    // Moderation metrics
    const totalFlagged = flaggedQuestions + flaggedAnswers + flaggedComments;
    const reviewedQuestions = await QuestionModel.countDocuments({
      'flagged.reviewedBy': { $exists: true, $ne: null },
    });
    const reviewedAnswers = await AnswerModel.countDocuments({
      'flagged.reviewedBy': { $exists: true, $ne: null },
    });
    const reviewedComments = await CommentModel.countDocuments({
      'flagged.reviewedBy': { $exists: true, $ne: null },
    });
    const totalReviewed = reviewedQuestions + reviewedAnswers + reviewedComments;
    const totalDeleted = deletedQuestions + deletedAnswers + deletedComments;
    const pendingReview = totalFlagged - totalReviewed;

    // Tag metrics
    const totalTags = await TagModel.countDocuments();
    const tagUsage = await QuestionModel.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const tagIds = tagUsage.map(t => t._id);
    const tags = await TagModel.find({ _id: { $in: tagIds } }).lean();
    const tagMap = new Map(tags.map(t => [t._id.toString(), t.name]));
    const mostUsedTags = tagUsage
      .map(t => ({
        name: tagMap.get(t._id.toString()) || 'Unknown',
        count: t.count,
      }))
      .filter(t => t.name !== 'Unknown');

    // Community metrics
    const totalCommunities = await CommunityModel.countDocuments();
    const publicCommunities = await CommunityModel.countDocuments({ visibility: 'PUBLIC' });
    const privateCommunities = totalCommunities - publicCommunities;

    // Collection metrics
    const totalCollections = await CollectionModel.countDocuments();

    // Message metrics
    const totalMessages = await MessageModel.countDocuments();

    // Growth metrics - questions by week
    const questionsByWeek = await QuestionModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$askDateTime' },
            week: { $week: '$askDateTime' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 }, // Last 12 weeks
    ]);
    const questionsByWeekFormatted = questionsByWeek.map(q => ({
      week: `Week ${q._id.week}, ${q._id.year}`,
      count: q.count,
    }));

    // Growth metrics - users by week
    const usersByWeek = await UserModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$dateJoined' },
            week: { $week: '$dateJoined' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 }, // Last 12 weeks
    ]);
    const usersByWeekFormatted = usersByWeek.map(u => ({
      week: `Week ${u._id.week}, ${u._id.year}`,
      count: u.count,
    }));

    return {
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        byRole: roleMap,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      content: {
        questions: {
          total: totalQuestions,
          withAnswers: questionsWithAnswers,
          unanswered: unansweredQuestions,
          flagged: flaggedQuestions,
          deleted: deletedQuestions,
        },
        answers: {
          total: totalAnswers,
          flagged: flaggedAnswers,
          deleted: deletedAnswers,
        },
        comments: {
          total: totalComments,
          flagged: flaggedComments,
          deleted: deletedComments,
        },
      },
      engagement: {
        totalViews,
        totalUpvotes,
        totalDownvotes,
        averageAnswersPerQuestion: Math.round(averageAnswersPerQuestion * 100) / 100,
        averageCommentsPerAnswer: Math.round(averageCommentsPerAnswer * 100) / 100,
      },
      moderation: {
        totalFlagged,
        totalReviewed,
        totalDeleted,
        pendingReview,
      },
      tags: {
        total: totalTags,
        mostUsed: mostUsedTags,
      },
      communities: {
        total: totalCommunities,
        public: publicCommunities,
        private: privateCommunities,
      },
      collections: {
        total: totalCollections,
      },
      messages: {
        total: totalMessages,
      },
      growth: {
        questionsByWeek: questionsByWeekFormatted,
        usersByWeek: usersByWeekFormatted,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching dashboard metrics: ${(error as Error).message}`);
  }
};
