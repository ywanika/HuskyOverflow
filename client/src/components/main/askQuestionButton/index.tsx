import { useNavigate } from 'react-router-dom';

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Question" page. When clicked, it redirects the user to the page
 * where they can ask a new question.
 */
const AskQuestionButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Question" page.
   */
  const handleNewQuestion = () => {
    navigate('/new/question');
  };

  return (
    <button
      type='button'
      className='btn btn-primary btn-lg ask-question-btn'
      onClick={handleNewQuestion}
      aria-label='Ask a new question'
      aria-describedby='ask-question-help'>
      Ask a Question
      <div id='ask-question-help' className='sr-only'>
        Click to navigate to the new question page where you can create a new question.
      </div>
    </button>
  );
};

export default AskQuestionButton;
