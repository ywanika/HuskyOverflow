import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@chakra-ui/react';
import './index.css';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 * - questionId - The ID of the question
 * - isModerator - Whether the current user is a moderator or admin
 * - onDeleteClick - Callback function when delete button is clicked
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
  questionId?: string;
  isModerator?: boolean;
  onDeleteClick?: () => void;
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 * @param questionId The ID of the question
 * @param isModerator Whether the current user is a moderator
 * @param onDeleteClick Callback when delete button is clicked
 */
const QuestionBody = ({ views, text, askby, meta, questionId, isModerator, onDeleteClick }: QuestionBodyProps) => (
  <div id='questionBody' className='questionBody right_padding'>
    <div className='bold_title answer_question_view'>{views} views</div>
    <div className='answer_question_text'>
      <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
    </div>
    <div className='answer_question_right'>
      <div className='question_author'>{askby}</div>
      <div className='answer_question_meta'>asked {meta}</div>
      {isModerator && onDeleteClick && (
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          mt={2}
          aria-label="Delete this question">
          Delete Question
        </Button>
      )}
    </div>
  </div>
);

export default QuestionBody;
