import './index.css';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';

/**
 * QuestionPage component renders a page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a header with order buttons and a button to ask a new question.
 */
const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  return (
    <div className='questions-page'>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />
      <main className='questions-content'>
        <div id='question_list' className='question_list'>
          {qlist.map(q => (
            <QuestionView question={q} key={q._id.toString()} />
          ))}
        </div>

        {titleText === 'Search Results' && !qlist.length && (
          <div className='no-questions-message'>No Questions Found</div>
        )}
      </main>
    </div>
  );
};

export default QuestionPage;
