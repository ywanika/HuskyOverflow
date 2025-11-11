import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className='vote-container' role='group' aria-label='Vote on this question'>
      <button
        type='button'
        className={`btn btn-sm vote-button ${voted === 1 ? 'vote-button-upvoted' : ''}`}
        onClick={() => handleVote('upvote')}
        aria-label={`Upvote this question. Current vote count: ${count}`}
        aria-pressed={voted === 1}>
        <span className='vote-icon' aria-hidden='true'>
          ↑
        </span>
        <span className='sr-only'>Upvote</span>
      </button>
      <div className='vote-count' aria-live='polite' aria-label={`Total votes: ${count}`}>
        {count}
      </div>
      <button
        type='button'
        className={`btn btn-sm vote-button ${voted === -1 ? 'vote-button-downvoted' : ''}`}
        onClick={() => handleVote('downvote')}
        aria-label={`Downvote this question. Current vote count: ${count}`}
        aria-pressed={voted === -1}>
        <span className='vote-icon' aria-hidden='true'>
          ↓
        </span>
        <span className='sr-only'>Downvote</span>
      </button>
    </div>
  );
};

export default VoteComponent;
