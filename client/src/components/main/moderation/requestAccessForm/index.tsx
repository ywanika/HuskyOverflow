import { Text } from '@chakra-ui/react';
import useNoAccess from '../../../../hooks/useNoAccess';
import './index.css';

/**
 * Component displayed when a user tries to access a moderator page without proper permissions.
 * Allows users to request moderator access.
 */
const RequestAccessForm = () => {
  const { message, handleRequestAccess, reason, setReason, reasonErr, generalErr } = useNoAccess();

  return (
    <div className='request-access-form'>
      <div className='form-group'>
        <label className='form-label required'>Why do you need moderator access?</label>
        <input
          id='reason'
          className='form-input'
          type='text'
          placeholder='Enter your reason'
          value={reason}
          onChange={e => setReason(e.target.value)}
          aria-describedby='reason-help'
        />
        {reasonErr && <div className='error_message'>{reasonErr}</div>}
      </div>
      <div className='btn_indicator_container'>
        <button
          className='btn btn-primary'
          onClick={() => {
            handleRequestAccess();
          }}>
          Request Moderator Access
        </button>
        {generalErr && <div className='error_message'>{generalErr}</div>}
      </div>
      {message && (
        <Text
          className={`no-access-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </Text>
      )}
    </div>
  );
};

export default RequestAccessForm;
