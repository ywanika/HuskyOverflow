import { useNavigate } from 'react-router-dom';
import { PopulatedDatabaseQuestion } from '../../../../types/types';
import './index.css';

/**
 * Interface representing the props for the SimilarQuestionCard component.
 *
 * question - The question object containing details about the similar question.
 */
interface SimilarQuestionCardProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * SimilarQuestionCard component displays a preview of a similar question
 * with its title and the first 100 characters of its description.
 * Clicking on the card navigates to the full question page.
 *
 * @param question - The question object containing question details.
 */
const SimilarQuestionCard = ({ question }: SimilarQuestionCardProps) => {
  const navigate = useNavigate();

  // Get first 500 characters of the question text
  const truncatedText =
    question.text.length > 500 ? `${question.text.substring(0, 500)}...` : question.text;

  const handleClick = () => {
    if (question._id) {
      navigate(`/question/${question._id}`);
    }
  };

  return (
    <div
      className='similar-question-card'
      onClick={handleClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View similar question: ${question.title}`}>
      <div className='similar-question-title'>{question.title}</div>
      <div className='similar-question-text'>{truncatedText}</div>
      <div className='similar-question-meta'>
        <span className='similar-question-answers'>
          {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
        </span>
        <span className='similar-question-divider'>•</span>
        <span className='similar-question-views'>
          {question.views.length} {question.views.length === 1 ? 'view' : 'views'}
        </span>
      </div>
    </div>
  );
};

export default SimilarQuestionCard;
