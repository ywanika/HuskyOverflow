import './index.css';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a signup form with username, password, and password confirmation inputs,
 * password visibility toggle, error handling, and a link to the login page.
 */
const Signup = () => {
  const {
    username,
    password,
    passwordConfirmation,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('signup');

  return (
    <main className='container' role='main'>
      <h1>Sign up for FakeStackOverflow!</h1>
      <h2>Please create your account.</h2>
      <form onSubmit={handleSubmit} role='form' aria-labelledby='signup-heading'>
        <fieldset>
          <legend id='signup-heading' className='sr-only'>
            Signup Form
          </legend>

          <div className='form-group'>
            <label htmlFor='username-input' className='form-label'>
              Username{' '}
              <span className='required' aria-label='required'>
                *
              </span>
            </label>
            <input
              type='text'
              value={username}
              onChange={event => handleInputChange(event, 'username')}
              placeholder='Enter your username'
              required
              className='input-text'
              id='username-input'
              aria-describedby='username-help'
              aria-invalid={err && err.includes('username') ? 'true' : 'false'}
            />
            <div id='username-help' className='form-help'>
              Choose a unique username for your account
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='password-input' className='form-label'>
              Password{' '}
              <span className='required' aria-label='required'>
                *
              </span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => handleInputChange(event, 'password')}
              placeholder='Enter your password'
              required
              className='input-text'
              id='password-input'
              aria-describedby='password-help'
              aria-invalid={err && err.includes('password') ? 'true' : 'false'}
            />
            <div id='password-help' className='form-help'>
              Create a strong password for your account
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='password-confirm-input' className='form-label'>
              Confirm Password{' '}
              <span className='required' aria-label='required'>
                *
              </span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={e => handleInputChange(e, 'confirmPassword')}
              placeholder='Confirm your password'
              required
              className='input-text'
              id='password-confirm-input'
              aria-describedby='password-confirm-help'
              aria-invalid={err && err.includes('password') ? 'true' : 'false'}
            />
            <div id='password-confirm-help' className='form-help'>
              Re-enter your password to confirm
            </div>
          </div>

          <div className='show-password'>
            <input
              type='checkbox'
              id='showPasswordToggle'
              checked={showPassword}
              onChange={togglePasswordVisibility}
              aria-describedby='show-password-help'
            />
            <label htmlFor='showPasswordToggle'>Show Password</label>
            <div id='show-password-help' className='form-help'>
              Toggle password visibility
            </div>
          </div>

          <button type='submit' className='login-button' aria-describedby='submit-help'>
            Create Account
          </button>
          <div id='submit-help' className='form-help'>
            Click to create your new account
          </div>
        </fieldset>
      </form>
      {err && (
        <p className='error-message' role='alert' aria-live='polite'>
          {err}
        </p>
      )}
      <Link to='/' className='login-link'>
        Have an account? Login here.
      </Link>
    </main>
  );
};

export default Signup;
