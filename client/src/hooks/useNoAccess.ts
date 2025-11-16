import { useState } from 'react';
import requestModeratorAccess from '../services/accessEscalationService.ts';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing the NoAccess page logic.
 *
 * @returns user - the current user from context.
 * @returns isLoading - loading state for the request.
 * @returns message - success or error message to display.
 * @returns handleRequestAccess - function to handle moderator access request.
 */
const useNoAccess = () => {
  const { user } = useUserContext();
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [reasonErr, setReasonErr] = useState('');
  const [generalErr, setGeneralErr] = useState('');

  /**
   * Handles the moderator access request.
   * Prompts the user for a reason and submits the request.
   */
  const handleRequestAccess = async () => {
    if (!user) {
      setMessage('User not found. Please log in again.');
      return;
    }

    try {
      setMessage('');

      if (!reason || reason.trim() === '') {
        setReasonErr('Reason is required.');
        return;
      } else {
        setReasonErr('');
      }

      await requestModeratorAccess(user.username, reason);
      setMessage('Your request has been submitted successfully. An admin will review it shortly.');
      setReason('');
    } catch (error) {
      setGeneralErr(
        error instanceof Error ? error.message : 'Failed to submit request. Please try again.',
      );
    }
  };

  return {
    message,
    handleRequestAccess,
    reason,
    setReason,
    reasonErr,
    generalErr,
  };
};

export default useNoAccess;
