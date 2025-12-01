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
 * - onFlagClick Callback function when flag button is clicked
 * - onUnflagClick Callback function when unflag button is clicked
 * - isFlagged Whether the current user has already flagged this answer
 * - onFlagComment Callback function when flag button is clicked for a comment
 * - onUnflagComment Callback function when unflag button is clicked for a comment
 * - getIsCommentFlagged Function to check if a comment is already flagged
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
  onFlagClick?: () => void;
  onUnflagClick?: () => void;
  isFlagged?: boolean;
  onFlagComment?: (commentId: string) => void;
  onUnflagComment?: (commentId: string) => void;
  getIsCommentFlagged?: (commentId: string) => boolean;
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
 * @param isModerator Whether the current user is a moderator
 * @param onDeleteClick Callback when delete button is clicked
 * @param onDeleteComment Callback when delete button is clicked for a comment
 * @param onFlagClick Callback when flag button is clicked
 * @param onUnflagClick Callback when unflag button is clicked
 * @param isFlagged Whether the current user has already flagged this answer
 * @param onFlagComment Callback when flag button is clicked for a comment
 * @param onUnflagComment Callback when unflag button is clicked for a comment
 * @param getIsCommentFlagged Function to check if a comment is already flagged
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  handleAddComment,
  answerId: _answerId,
  isModerator,
  onDeleteClick,
  onDeleteComment,
  onFlagClick,
  onUnflagClick,
  isFlagged,
  onFlagComment,
  onUnflagComment,
  getIsCommentFlagged,
}: AnswerProps) => (
  <div className='answer right_padding'>
    <div id='answerText' className='answerText'>
      {<Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>}
    </div>
    <div className='answerAuthor'>
      <div className='answer_author'>{ansBy}</div>
      <div className='answer_question_meta'>{meta}</div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {!isModerator && (
          <>
            {isFlagged && onUnflagClick ? (
              <Button
                size='sm'
                colorScheme='orange'
                variant='solid'
                onClick={e => {
                  e.stopPropagation();
                  onUnflagClick();
                }}
                aria-label='Unflag this answer'>
                Unflag
              </Button>
            ) : (
              onFlagClick && (
                <Button
                  size='sm'
                  colorScheme='orange'
                  variant='outline'
                  onClick={e => {
                    e.stopPropagation();
                    onFlagClick();
                  }}
                  aria-label='Flag this answer'>
                  Flag
                </Button>
              )
            )}
          </>
        )}
        {isModerator && onDeleteClick && (
          <Button
            size='sm'
            colorScheme='red'
            variant='outline'
            onClick={e => {
              e.stopPropagation();
              onDeleteClick();
            }}
            aria-label='Delete this answer'>
            Delete Answer
          </Button>
        )}
      </div>
    </div>
    <CommentSection
      comments={comments}
      handleAddComment={handleAddComment}
      isModerator={isModerator}
      onDeleteComment={onDeleteComment}
      onFlagComment={onFlagComment}
      onUnflagComment={onUnflagComment}
      getIsFlagged={getIsCommentFlagged}
    />
  </div>
);

export default AnswerView;
