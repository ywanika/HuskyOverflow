import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@chakra-ui/react';
import { getMetaData } from '../../../tool';
import { Comment, DatabaseComment } from '../../../types/types';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the Comment Section component.
 *
 * - comments - list of the comment components
 * - handleAddComment - a function that handles adding a new comment, taking a Comment object as an argument
 * - isModerator - Whether the current user is a moderator or admin
 * - onDeleteComment - Callback function when delete button is clicked for a comment
 * - onFlagComment - Callback function when flag button is clicked for a comment
 * - onUnflagComment - Callback function when unflag button is clicked for a comment
 * - getIsFlagged - Function to check if a comment is already flagged by the current user
 */
interface CommentSectionProps {
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  isModerator?: boolean;
  onDeleteComment?: (commentId: string) => void;
  onFlagComment?: (commentId: string) => void;
  onUnflagComment?: (commentId: string) => void;
  getIsFlagged?: (commentId: string) => boolean;
}

/**
 * CommentSection component shows the users all the comments and allows the users add more comments.
 *
 * @param comments: an array of Comment objects
 * @param handleAddComment: function to handle the addition of a new comment
 * @param isModerator: whether the current user is a moderator
 * @param onDeleteComment: callback when delete button is clicked for a comment
 * @param onFlagComment: callback when flag button is clicked for a comment
 * @param onUnflagComment: callback when unflag button is clicked for a comment
 * @param getIsFlagged: function to check if a comment is already flagged
 */
const CommentSection = ({
  comments,
  handleAddComment,
  isModerator,
  onDeleteComment,
  onFlagComment,
  onUnflagComment,
  getIsFlagged,
}: CommentSectionProps) => {
  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddCommentClick = async () => {
    if (text.trim() === '' || user.username.trim() === '') {
      setTextErr(text.trim() === '' ? 'Comment text cannot be empty' : '');
      return;
    }

    const newComment: Comment = {
      text,
      commentBy: user.username,
      commentDateTime: new Date(),
    };

    try {
      await handleAddComment(newComment);
      // Only clear text on successful submission
      setText('');
      setTextErr('');
    } catch (error) {
      // Don't clear text on error so user can edit and retry
      setTextErr((error as Error).message);
    }
  };

  return (
    <div className='comment-section'>
      <button className='toggle-button' onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {showComments && (
        <div className='comments-container'>
          <ul className='comments-list'>
            {comments.length > 0 ? (
              comments.map(comment => (
                <li key={String(comment._id)} className='comment-item'>
                  <div className='comment-text'>
                    <Markdown remarkPlugins={[remarkGfm]}>{comment.text}</Markdown>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                    <small className='comment-meta'>
                      {comment.commentBy}, {getMetaData(new Date(comment.commentDateTime))}
                    </small>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!isModerator && (
                        <>
                          {getIsFlagged && getIsFlagged(String(comment._id)) && onUnflagComment ? (
                            <Button
                              size='xs'
                              colorScheme='orange'
                              variant='solid'
                              onClick={e => {
                                e.stopPropagation();
                                onUnflagComment(String(comment._id));
                              }}
                              aria-label={`Unflag comment by ${comment.commentBy}`}>
                              Unflag
                            </Button>
                          ) : (
                            onFlagComment && (
                              <Button
                                size='xs'
                                colorScheme='orange'
                                variant='outline'
                                onClick={e => {
                                  e.stopPropagation();
                                  onFlagComment(String(comment._id));
                                }}
                                aria-label={`Flag comment by ${comment.commentBy}`}>
                                Flag
                              </Button>
                            )
                          )}
                        </>
                      )}
                      {isModerator && onDeleteComment && (
                        <Button
                          size='xs'
                          colorScheme='red'
                          variant='outline'
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteComment(String(comment._id));
                          }}
                          aria-label={`Delete comment by ${comment.commentBy}`}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className='no-comments'>No comments yet.</p>
            )}
          </ul>

          <div className='add-comment'>
            <div className='input-row'>
              <textarea
                placeholder='Comment'
                value={text}
                onChange={e => setText(e.target.value)}
                className='comment-textarea'
              />
              <button className='add-comment-button' onClick={handleAddCommentClick}>
                Add Comment
              </button>
            </div>
            {textErr && <small className='error'>{textErr}</small>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
