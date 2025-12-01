import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import useLoginContext from './useLoginContext';
import { createUser, loginUser, checkSuspensionStatus } from '../services/userService';

/**
 * Custom hook to manage authentication logic, including handling input changes,
 * form submission, password visibility toggling, and error validation for both
 * login and signup processes.
 *
 * @param authType - Specifies the authentication type ('login' or 'signup').
 * @returns {Object} An object containing:
 *   - username: The current value of the username input.
 *   - password: The current value of the password input.
 *   - passwordConfirmation: The current value of the password confirmation input (for signup).
 *   - agreedToGuidelines: Boolean indicating if user agreed to guidelines (for signup).
 *   - showPassword: Boolean indicating whether the password is visible.
 *   - err: The current error message, if any.
 *   - handleInputChange: Function to handle changes in input fields.
 *   - handleGuidelinesChange: Function to handle guidelines checkbox change.
 *   - handleSubmit: Function to handle form submission.
 *   - togglePasswordVisibility: Function to toggle password visibility.
 */
const useAuth = (authType: 'login' | 'signup') => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string>('');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();

  /**
   * Toggles the visibility of the password input field.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Handles changes in input fields and updates the corresponding state.
   *
   * @param e - The input change event.
   * @param field - The field being updated ('username', 'password', or 'confirmPassword').
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: 'username' | 'password' | 'confirmPassword',
  ) => {
    const fieldText = e.target.value.trim();

    if (field === 'username') {
      setUsername(fieldText);
    } else if (field === 'password') {
      setPassword(fieldText);
    } else if (field === 'confirmPassword') {
      setPasswordConfirmation(fieldText);
    }
  };

  /**
   * Handles changes to the community guidelines checkbox.
   *
   * @param e - The checkbox change event.
   */
  const handleGuidelinesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgreedToGuidelines(e.target.checked);
  };

  /**
   * Validates the input fields for the form.
   * Ensures required fields are filled and passwords match (for signup).
   *
   * @returns {boolean} True if inputs are valid, false otherwise.
   */
  const validateInputs = (): boolean => {
    if (username === '' || password === '') {
      setErr('Please enter a username and password');
      return false;
    }

    if (authType === 'signup' && password !== passwordConfirmation) {
      setErr('Passwords do not match');
      return false;
    }

    if (authType === 'signup' && !agreedToGuidelines) {
      setErr('You must agree to the community guidelines to create an account');
      return false;
    }

    return true;
  };

  /**
   * Handles the submission of the form.
   * Validates input, performs login/signup, and navigates to the home page on success.
   *
   * @param event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    let user;

    try {
      if (authType === 'signup') {
        user = await createUser({ username, password, agreedToGuidelines });
      } else if (authType === 'login') {
        user = await loginUser({ username, password });
      } else {
        throw new Error('Invalid auth type');
      }

      setUser(user);

      // Check if user is suspended or banned
      try {
        const suspensionStatus = await checkSuspensionStatus(user.username);
        if (suspensionStatus.isSuspended || suspensionStatus.isBanned) {
          navigate('/suspended');
          return;
        }
      } catch (error) {
        // If suspension check fails, continue to home
      }

      navigate('/home');
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  return {
    username,
    password,
    passwordConfirmation,
    agreedToGuidelines,
    showPassword,
    err,
    handleInputChange,
    handleGuidelinesChange,
    handleSubmit,
    togglePasswordVisibility,
  };
};

export default useAuth;
