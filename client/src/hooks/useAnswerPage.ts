import { ObjectId } from 'mongodb';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Comment,
  VoteUpdatePayload,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseAnswer,
} from '../types/types';
import useUserContext from './useUserContext';
import addComment from '../services/commentService';
import { getQuestionById } from '../services/questionService';
import {
  deleteQuestion,
  deleteAnswer,
  deleteComment,
  flagQuestion,
  flagAnswer,
  flagComment,
  unflagQuestion,
  unflagAnswer,
  unflagComment,
} from '../services/moderationService';

/**
 * Custom hook for managing the answer page's state, navigation, and real-time updates.
 *
 * @returns questionID - The current question ID retrieved from the URL parameters.
 * @returns question - The current question object with its answers, comments, and votes.
 * @returns handleNewComment - Function to handle the submission of a new comment to a question or answer.
 * @returns handleNewAnswer - Function to navigate to the "New Answer" page
 */
const useAnswerPage = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user, socket } = useUserContext();
  const [questionID, setQuestionID] = useState<string>(qid || '');
  const [question, setQuestion] = useState<PopulatedDatabaseQuestion | null>(null);

  /**
   * Function to handle navigation to the "New Answer" page.
   */
  const handleNewAnswer = () => {
    navigate(`/new/answer/${questionID}`);
  };

  useEffect(() => {
    if (!qid) {
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to handle the creation of a new comment.
   * @param comment - The comment to be added.
   * @param targetType - The type of target (question or answer).
   * @param targetId - The ID of the target (question or answer).
   */
  const handleNewComment = async (
    comment: Comment,
    targetType: 'question' | 'answer',
    targetId: string | undefined,
  ) => {
    if (targetId === undefined) {
      throw new Error('No target ID provided.');
    }
    // Let the error propagate to the caller (CommentSection)
    await addComment(targetId, targetType, comment, user.username);
  };
  useEffect(() => {
    /**
     * Function to fetch the question data based on the question ID.
     */
    const fetchData = async () => {
      try {
        const res = await getQuestionById(questionID, user.username);
        setQuestion(res || null);
      } catch (error) {
        // Error handled silently - question state remains null
      }
    };

    fetchData().catch(() => {
      // Error handled silently
    });
  }, [questionID, user.username]);

  useEffect(() => {
    /**
     * Function to handle updates to the answers of a question.
     *
     * @param answer - The updated answer object.
     */
    const handleAnswerUpdate = ({
      qid: id,
      answer,
    }: {
      qid: ObjectId;
      answer: PopulatedDatabaseAnswer;
    }) => {
      if (String(id) === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? // Creates a new Question object with the new answer appended to the end
              { ...prevQuestion, answers: [...prevQuestion.answers, answer] }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the comments of a question or answer.
     *
     * @param result - The updated question or answer object.
     * @param type - The type of the object being updated, either 'question' or 'answer'.
     */
    const handleCommentUpdate = ({
      result,
      type,
    }: {
      result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer;
      type: 'question' | 'answer';
    }) => {
      if (type === 'question') {
        const questionResult = result as PopulatedDatabaseQuestion;

        if (String(questionResult._id) === questionID) {
          setQuestion(questionResult);
        }
      } else if (type === 'answer') {
        setQuestion(prevQuestion =>
          prevQuestion
            ? // Updates answers with a matching object ID, and creates a new Question object
              {
                ...prevQuestion,
                answers: prevQuestion.answers.map(a =>
                  a._id === result._id ? (result as PopulatedDatabaseAnswer) : a,
                ),
              }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle updates to the views of a question.
     *
     * @param q The updated question object.
     */
    const handleViewsUpdate = (q: PopulatedDatabaseQuestion) => {
      if (String(q._id) === questionID) {
        setQuestion(q);
      }
    };

    /**
     * Function to handle vote updates for a question.
     *
     * @param voteData - The updated vote data for a question
     */
    const handleVoteUpdate = (voteData: VoteUpdatePayload) => {
      if (voteData.qid === questionID) {
        setQuestion(prevQuestion =>
          prevQuestion
            ? {
                ...prevQuestion,
                upVotes: [...voteData.upVotes],
                downVotes: [...voteData.downVotes],
              }
            : prevQuestion,
        );
      }
    };

    /**
     * Function to handle moderation updates (deletions)
     */
    const handleModerationUpdate = async () => {
      // Refresh the question data when moderation occurs
      try {
        const res = await getQuestionById(questionID, user.username);
        setQuestion(res || null);
      } catch (error) {
        // Error handled silently - question state remains unchanged
      }
    };

    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('voteUpdate', handleVoteUpdate);
    socket.on('moderationUpdate', handleModerationUpdate);

    return () => {
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('voteUpdate', handleVoteUpdate);
      socket.off('moderationUpdate', handleModerationUpdate);
    };
  }, [questionID, socket, user.username]);

  /**
   * Handles deletion of a question by a moderator
   */
  const handleDeleteQuestion = async (deleteReason: string) => {
    if (!questionID) {
      throw new Error('Question ID not found');
    }
    await deleteQuestion(questionID, user.username, deleteReason);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
    // Optionally navigate away or show a message
  };

  /**
   * Handles deletion of an answer by a moderator
   */
  const handleDeleteAnswer = async (answerId: string, deleteReason: string) => {
    await deleteAnswer(answerId, user.username, deleteReason);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles deletion of a comment by a moderator
   */
  const handleDeleteComment = async (commentId: string, deleteReason: string) => {
    await deleteComment(commentId, user.username, deleteReason);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles flagging of a question by a user
   */
  const handleFlagQuestion = async () => {
    if (!questionID) {
      throw new Error('Question ID not found');
    }
    await flagQuestion(questionID, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles flagging of an answer by a user
   */
  const handleFlagAnswer = async (answerId: string) => {
    await flagAnswer(answerId, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles flagging of a comment by a user
   */
  const handleFlagComment = async (commentId: string) => {
    await flagComment(commentId, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles unflagging of a question by a user
   */
  const handleUnflagQuestion = async () => {
    if (!questionID) {
      throw new Error('Question ID not found');
    }
    await unflagQuestion(questionID, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles unflagging of an answer by a user
   */
  const handleUnflagAnswer = async (answerId: string) => {
    await unflagAnswer(answerId, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  /**
   * Handles unflagging of a comment by a user
   */
  const handleUnflagComment = async (commentId: string) => {
    await unflagComment(commentId, user.username);
    // Refresh the question data
    const res = await getQuestionById(questionID, user.username);
    setQuestion(res || null);
  };

  return {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleDeleteQuestion,
    handleDeleteAnswer,
    handleDeleteComment,
    handleFlagQuestion,
    handleFlagAnswer,
    handleFlagComment,
    handleUnflagQuestion,
    handleUnflagAnswer,
    handleUnflagComment,
    user,
  };
};

export default useAnswerPage;
