import { ObjectId } from 'mongodb';
import { QueryOptions } from 'mongoose';
import {
  DatabaseComment,
  DatabaseCommunity,
  DatabaseQuestion,
  DatabaseTag,
  OrderType,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  Question,
  QuestionResponse,
  VoteResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import CommentModel from '../models/comments.model';
import { parseKeyword, parseTags } from '../utils/parse.util';
import { checkTagInQuestion } from './tag.service';
import {
  sortQuestionsByActive,
  sortQuestionsByMostViews,
  sortQuestionsByNewest,
  sortQuestionsByUnanswered,
} from '../utils/sort.util';

/**
 * Checks if keywords exist in a question's title or text.
 * @param {Question} q - The question to check
 * @param {string[]} keywordlist - The keywords to check
 * @returns {boolean} - `true` if any keyword is found
 */
const checkKeywordInQuestion = (q: PopulatedDatabaseQuestion, keywordlist: string[]): boolean => {
  for (const w of keywordlist) {
    if (q.title.includes(w) || q.text.includes(w)) {
      return true;
    }
  }
  return false;
};

/**
 * Retrieves questions ordered by specified criteria.
 * @param {OrderType} order - The order type to filter the questions
 * @returns {Promise<Question[]>} - The ordered list of questions
 */
export const getQuestionsByOrder = async (
  order: OrderType,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const qlist: PopulatedDatabaseQuestion[] = await QuestionModel.find({
      'deleted.isDeleted': { $ne: true },
      // Filter out flagged content that hasn't been reviewed (temporarily taken down)
      '$or': [
        { 'flagged.isFlagged': { $ne: true } },
        {
          'flagged.reviewedBy': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      ],
    }).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
      community: DatabaseCommunity;
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    // Filter out flagged answers and comments that haven't been reviewed
    const filteredQlist = qlist.map((q: PopulatedDatabaseQuestion) => {
      // Filter flagged answers
      if (q.answers) {
        q.answers = q.answers.filter(
          (answer: PopulatedDatabaseAnswer) =>
            !answer.flagged?.isFlagged ||
            (answer.flagged.reviewedBy !== undefined &&
              answer.flagged.reviewedBy !== null &&
              answer.flagged.reviewedBy !== ''),
        ) as PopulatedDatabaseAnswer[];

        // Filter flagged comments within answers
        q.answers = q.answers.map((answer: PopulatedDatabaseAnswer) => {
          if (answer.comments) {
            answer.comments = answer.comments.filter(
              (comment: DatabaseComment) =>
                !comment.flagged?.isFlagged ||
                (comment.flagged.reviewedBy !== undefined &&
                  comment.flagged.reviewedBy !== null &&
                  comment.flagged.reviewedBy !== ''),
            ) as DatabaseComment[];
          }
          return answer;
        }) as PopulatedDatabaseAnswer[];
      }

      // Filter flagged comments on questions
      if (q.comments) {
        q.comments = q.comments.filter(
          (comment: DatabaseComment) =>
            !comment.flagged?.isFlagged ||
            (comment.flagged.reviewedBy !== undefined &&
              comment.flagged.reviewedBy !== null &&
              comment.flagged.reviewedBy !== ''),
        ) as DatabaseComment[];
      }

      return q;
    });

    switch (order) {
      case 'active':
        return sortQuestionsByActive(filteredQlist);
      case 'unanswered':
        return sortQuestionsByUnanswered(filteredQlist);
      case 'newest':
        return sortQuestionsByNewest(filteredQlist);
      case 'mostViewed':
      default:
        return sortQuestionsByMostViews(filteredQlist);
    }
  } catch (error) {
    return [];
  }
};

/**
 * Filters questions by the user who asked them.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} askedBy - The username to filter by
 * @returns {PopulatedDatabaseQuestion[]} - Filtered questions
 */
export const filterQuestionsByAskedBy = (
  qlist: PopulatedDatabaseQuestion[],
  askedBy: string,
): PopulatedDatabaseQuestion[] => qlist.filter(q => q.askedBy === askedBy);

/**
 * Filters questions by search string containing tags and/or keywords.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} search - The search string
 * @returns {PopulatedDatabaseQuestion[]} - Filtered list of questions
 */
export const filterQuestionsBySearch = (
  qlist: PopulatedDatabaseQuestion[],
  search: string,
): PopulatedDatabaseQuestion[] => {
  const searchTags = parseTags(search);
  const searchKeyword = parseKeyword(search);

  return qlist.filter((question: PopulatedDatabaseQuestion) => {
    if (searchKeyword.length === 0 && searchTags.length === 0) {
      return true;
    }

    if (searchKeyword.length === 0) {
      return checkTagInQuestion(question, searchTags);
    }

    if (searchTags.length === 0) {
      return checkKeywordInQuestion(question, searchKeyword);
    }

    return (
      checkKeywordInQuestion(question, searchKeyword) || checkTagInQuestion(question, searchTags)
    );
  });
};

/**
 * Fetches a question by ID and increments its view count.
 * @param {string} qid - The question ID
 * @param {string} username - The username requesting the question
 * @returns {Promise<QuestionResponse | null>} - The question with incremented views or error message
 */
export const fetchAndIncrementQuestionViewsById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion | { error: string }> => {
  try {
    const q: PopulatedDatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      {
        '_id': new ObjectId(qid),
        'deleted.isDeleted': { $ne: true },
        // Filter out flagged content that hasn't been reviewed (temporarily taken down)
        '$or': [
          { 'flagged.isFlagged': { $ne: true } },
          {
            'flagged.reviewedBy': {
              $exists: true,
              $nin: [null, ''],
            },
          },
        ],
      },
      { $addToSet: { views: username } },
      { new: true },
    ).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
      community: DatabaseCommunity;
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    if (!q) {
      throw new Error('Question not found');
    }

    // Filter out flagged answers and comments that haven't been reviewed
    if (q.answers) {
      q.answers = q.answers.filter(
        (answer: PopulatedDatabaseAnswer) =>
          !answer.flagged?.isFlagged ||
          (answer.flagged.reviewedBy !== undefined &&
            answer.flagged.reviewedBy !== null &&
            answer.flagged.reviewedBy !== ''),
      ) as PopulatedDatabaseAnswer[];

      // Filter flagged comments within answers
      q.answers = q.answers.map((answer: PopulatedDatabaseAnswer) => {
        if (answer.comments) {
          answer.comments = answer.comments.filter(
            (comment: DatabaseComment) =>
              !comment.flagged?.isFlagged ||
              (comment.flagged.reviewedBy !== undefined &&
                comment.flagged.reviewedBy !== null &&
                comment.flagged.reviewedBy !== ''),
          ) as DatabaseComment[];
        }
        return answer;
      }) as PopulatedDatabaseAnswer[];
    }

    if (q.comments) {
      q.comments = q.comments.filter(
        (comment: DatabaseComment) =>
          !comment.flagged?.isFlagged ||
          (comment.flagged.reviewedBy !== undefined &&
            comment.flagged.reviewedBy !== null &&
            comment.flagged.reviewedBy !== ''),
      ) as DatabaseComment[];
    }

    return q;
  } catch (error) {
    return { error: 'Error when fetching and updating a question' };
  }
};

/**
 * Saves a new question to the database.
 * @param {Question} question - The question to save
 * @returns {Promise<QuestionResponse>} - The saved question or error message
 */
export const saveQuestion = async (question: Question): Promise<QuestionResponse> => {
  try {
    const result: DatabaseQuestion = await QuestionModel.create(question);

    return result;
  } catch (error) {
    return { error: 'Error when saving a question' };
  }
};

/**
 * Adds a vote to a question.
 * @param {string} qid - The question ID
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<VoteResponse>} - The updated vote result
 */
export const addVoteToQuestion = async (
  qid: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteResponse> => {
  let updateOperation: QueryOptions;

  if (voteType === 'upvote') {
    updateOperation = [
      {
        $set: {
          upVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
              { $concatArrays: ['$upVotes', [username]] },
            ],
          },
          downVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              '$downVotes',
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
            ],
          },
        },
      },
    ];
  } else {
    updateOperation = [
      {
        $set: {
          downVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
              { $concatArrays: ['$downVotes', [username]] },
            ],
          },
          upVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              '$upVotes',
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
            ],
          },
        },
      },
    ];
  }

  try {
    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      updateOperation,
      { new: true },
    );

    if (!result) {
      return { error: 'Question not found!' };
    }

    let msg = '';

    if (voteType === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Question upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Question downvoted successfully'
        : 'Downvote cancelled successfully';
    }

    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        voteType === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};

/**
 * Fetches all questions in a community.
 *
 * @param communityId - The ID of the community to fetch questions from
 * @returns {Promise<DatabaseQuestion[]>} - The list of questions in the community
 */
export const getCommunityQuestions = async (communityId: string): Promise<DatabaseQuestion[]> => {
  try {
    const questions = await QuestionModel.find({
      'community': communityId,
      'deleted.isDeleted': { $ne: true },
      // Filter out flagged content that hasn't been reviewed (temporarily taken down)
      '$or': [
        { 'flagged.isFlagged': { $ne: true } },
        {
          'flagged.reviewedBy': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      ],
    });

    return questions;
  } catch (error) {
    return [];
  }
};
