import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@chakra-ui/react';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment } from '../../../../types/types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 * - answerId The ID of the answer
 * - isModerator Whether the current user is a moderator or admin
 * - onDeleteClick Callback function when delete button is clicked
 * - onDeleteComment Callback function when delete button is clicked for a comment
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  answerId?: string;
  isModerator?: boolean;
  onDeleteClick?: () => void;
  onDeleteComment?: (commentId: string) => void;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 * @param answerId The ID of the answer
 * @param isModerator Whether the current user is a moderator
 * @param onDeleteClick Callback when delete button is clicked
 * @param onDeleteComment Callback when delete button is clicked for a comment
 */
const AnswerView = ({ text, ansBy, meta, comments, handleAddComment, answerId, isModerator, onDeleteClick, onDeleteComment }: AnswerProps) => (
  <div className='answer right_padding'>
    <div id='answerText' className='answerText'>
      {<Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>}
    </div>
    <div className='answerAuthor'>
      <div className='answer_author'>{ansBy}</div>
      <div className='answer_question_meta'>{meta}</div>
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
          ml={2}
          aria-label="Delete this answer">
          Delete Answer
        </Button>
      )}
    </div>
    <CommentSection 
      comments={comments} 
      handleAddComment={handleAddComment}
      isModerator={isModerator}
      onDeleteComment={onDeleteComment}
    />
  </div>
);

export default AnswerView;
