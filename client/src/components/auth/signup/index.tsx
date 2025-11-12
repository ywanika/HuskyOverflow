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
    agreedToGuidelines,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    handleGuidelinesChange,
    togglePasswordVisibility,
  } = useAuth('signup');

  return (
    <main className='login-container' role='main'>
      <div className='login-card'>
        <header className='login-header'>
          <h1 className='login-title'>Join FakeStackOverflow!</h1>
          <h2 className='login-subtitle'>Create your account to get started.</h2>
        </header>

        <form onSubmit={handleSubmit} className='login-form' aria-labelledby='signup-heading'>
          <fieldset className='form-fieldset'>
            <legend id='signup-heading' className='sr-only'>
              Signup Form
            </legend>

            <div className='form-group'>
              <label htmlFor='username-input' className='form-label required'>
                Username
              </label>
              <input
                type='text'
                value={username}
                onChange={event => handleInputChange(event, 'username')}
                placeholder='Enter your username'
                required
                className='form-input'
                id='username-input'
                aria-describedby='username-help'
                aria-invalid={err && err.includes('username') ? 'true' : 'false'}
              />
              <div id='username-help' className='form-help'>
                Choose a unique username for your account
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor='password-input' className='form-label required'>
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => handleInputChange(event, 'password')}
                placeholder='Enter your password'
                required
                className='form-input'
                id='password-input'
                aria-describedby='password-help'
                aria-invalid={err && err.includes('password') ? 'true' : 'false'}
              />
              <div id='password-help' className='form-help'>
                Create a strong password for your account
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor='password-confirm-input' className='form-label required'>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={e => handleInputChange(e, 'confirmPassword')}
                placeholder='Confirm your password'
                required
                className='form-input'
                id='password-confirm-input'
                aria-describedby='password-confirm-help'
                aria-invalid={err && err.includes('password') ? 'true' : 'false'}
              />
              <div id='password-confirm-help' className='form-help'>
                Re-enter your password to confirm
              </div>
            </div>

            <div className='form-group'>
              <div className='checkbox-group'>
                <input
                  type='checkbox'
                  id='showPasswordToggle'
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                  className='checkbox-input'
                  aria-describedby='show-password-help'
                />
                <label htmlFor='showPasswordToggle' className='checkbox-label'>
                  Show Password
                </label>
                <div id='show-password-help' className='form-help'>
                  Toggle password visibility
                </div>
              </div>
            </div>

            <div className='form-group'>
              <div className='checkbox-group'>
                <input
                  type='checkbox'
                  id='guidelinesCheckbox'
                  checked={agreedToGuidelines}
                  onChange={handleGuidelinesChange}
                  className='checkbox-input'
                  required
                  aria-describedby='guidelines-help'
                />
                <label htmlFor='guidelinesCheckbox' className='checkbox-label required'>
                  I agree to the{' '}
                  <Link to='/guidelines' target='_blank' className='guidelines-link'>
                    Community Guidelines
                  </Link>
                </label>
                <div id='guidelines-help' className='form-help'>
                  You must agree to the community guidelines to create an account
                </div>
              </div>
            </div>

            <div className='form-actions'>
              <button
                type='submit'
                className='btn btn-primary btn-lg'
                disabled={!agreedToGuidelines}
                aria-describedby='submit-help'>
                Create Account
              </button>
              <div id='submit-help' className='form-help'>
                Click to create your new account
              </div>
            </div>
          </fieldset>
        </form>

        {err && (
          <div className='form-error' role='alert' aria-live='polite'>
            {err}
          </div>
        )}

        <div className='login-footer'>
          <Link to='/' className='signup-link'>
            Already have an account? Login here.
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Signup;
