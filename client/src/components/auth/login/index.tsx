import './index.css';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');

  return (
    <main className='container' role='main'>
      <h1>Welcome to FakeStackOverflow!</h1>
      <h2>Please login to continue.</h2>
      <form onSubmit={handleSubmit} role='form' aria-labelledby='login-heading'>
        <fieldset>
          <legend id='login-heading' className='sr-only'>
            Login Form
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
              Enter your registered username
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
              Enter your account password
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
            Submit
          </button>
          <div id='submit-help' className='form-help'>
            Click to log into your account
          </div>
        </fieldset>
      </form>
      {err && (
        <p className='error-message' role='alert' aria-live='polite'>
          {err}
        </p>
      )}
      <Link to='/signup' className='signup-link'>
        Don&apos;t have an account? Sign up here.
      </Link>
    </main>
  );
};

export default Login;
