import './index.css';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  return (
    <article
      className='user-card'
      role='article'
      aria-labelledby={`user-title-${user.username}`}
      tabIndex={0}
      onClick={() => handleUserCardViewClickHandler(user)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleUserCardViewClickHandler(user);
        }
      }}>
      <header className='user-card-header'>
        <h3 id={`user-title-${user.username}`} className='user-card-title'>
          {user.username}
        </h3>
      </header>

      <div className='user-card-body'>
        <dl className='user-card-meta'>
          <dt className='meta-label'>Joined:</dt>
          <dd className='meta-value'>{new Date(user.dateJoined).toLocaleDateString()}</dd>
        </dl>
      </div>

      <footer className='user-card-actions'>
        <button
          type='button'
          className='btn btn-primary'
          onClick={e => {
            e.stopPropagation();
            handleUserCardViewClickHandler(user);
          }}
          aria-label={`View profile for ${user.username}`}>
          View Profile
        </button>
      </footer>
    </article>
  );
};

export default UserCardView;
