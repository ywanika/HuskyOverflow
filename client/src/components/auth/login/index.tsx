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
    <main className='login-container' role='main'>
      <div className='login-card'>
        <header className='login-header'>
          <h1 className='login-title'>Welcome to FakeStackOverflow!</h1>
          <h2 className='login-subtitle'>Please login to continue.</h2>
        </header>

        <form onSubmit={handleSubmit} className='login-form' aria-labelledby='login-heading'>
          <fieldset className='form-fieldset'>
            <legend id='login-heading' className='sr-only'>
              Login Form
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
                Enter your registered username
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
                Enter your account password
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

            <div className='form-actions'>
              <button
                type='submit'
                className='btn btn-primary btn-lg'
                aria-describedby='submit-help'>
                Sign In
              </button>
              <div id='submit-help' className='form-help'>
                Click to log into your account
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
          <Link to='/signup' className='signup-link'>
            Don&apos;t have an account? Sign up here.
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
