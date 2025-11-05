import { useState } from 'react';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import DeleteContentModal from '../../moderation/DeleteContentModal';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    questionID,
    question,
    handleNewComment,
    handleNewAnswer,
    handleDeleteQuestion,
    handleDeleteAnswer,
    handleDeleteComment,
    user,
  } = useAnswerPage();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'question' | 'answer' | 'comment';
    contentId: string;
    contentTitle?: string;
  }>({
    isOpen: false,
    type: 'question',
    contentId: '',
  });

  const isModerator = user.role === 'moderator' || user.role === 'admin';

  if (!question) {
    return null;
  }

  const handleDeleteClick = (type: 'question' | 'answer' | 'comment', contentId: string, contentTitle?: string) => {
    setDeleteModal({ isOpen: true, type, contentId, contentTitle });
  };

  const handleDeleteConfirm = async (deleteReason: string) => {
    if (deleteModal.type === 'question') {
      await handleDeleteQuestion(deleteReason);
    } else if (deleteModal.type === 'answer') {
      await handleDeleteAnswer(deleteModal.contentId, deleteReason);
    } else if (deleteModal.type === 'comment') {
      await handleDeleteComment(deleteModal.contentId, deleteReason);
    }
  };

  // Don't show deleted content
  if (question.deleted?.isDeleted) {
    return (
      <div className="right_padding">
        <p>This question has been deleted by a moderator.</p>
        {question.deleted.deleteReason && (
          <p>Reason: {question.deleted.deleteReason}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader ansCount={question.answers.length} title={question.title} />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime))}
        questionId={questionID}
        isModerator={isModerator}
        onDeleteClick={() => handleDeleteClick('question', questionID, question.title)}
      />
      <CommentSection
        comments={question.comments.filter(c => !c.deleted?.isDeleted)}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        isModerator={isModerator}
        onDeleteComment={(commentId: string) => handleDeleteClick('comment', commentId)}
      />
      {question.answers
        .filter(a => !a.deleted?.isDeleted)
        .map(a => (
          <AnswerView
            key={String(a._id)}
            text={a.text}
            ansBy={a.ansBy}
            meta={getMetaData(new Date(a.ansDateTime))}
            comments={a.comments.filter(c => !c.deleted?.isDeleted)}
            handleAddComment={(comment: Comment) =>
              handleNewComment(comment, 'answer', String(a._id))
            }
            answerId={String(a._id)}
            isModerator={isModerator}
            onDeleteClick={() => handleDeleteClick('answer', String(a._id))}
            onDeleteComment={(commentId: string) => handleDeleteClick('comment', commentId)}
          />
        ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>

      <DeleteContentModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        contentType={deleteModal.type}
        contentTitle={deleteModal.contentTitle}
      />
    </>
  );
};

export default AnswerPage;
