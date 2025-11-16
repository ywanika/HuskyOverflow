import './index.css';
import RequestAccessForm from '../requestAccessForm';

/**
 * Component displayed when a user tries to access a moderator page without proper permissions.
 * Allows users to request moderator access.
 */
const NoAccess = () => {
  return (
    <div className='no-access-page'>
      <h1 className='no-access-heading'>You do not have access to this page</h1>
      <h5 className='no-access-description'>
        This page is restricted to moderators and administrators only.
      </h5>
      <RequestAccessForm />
    </div>
  );
};

export default NoAccess;
