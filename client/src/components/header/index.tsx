import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  
  return (
    <header id='header' className='header' role='banner'>
      <div className='header-container'>
        <h1 className='header-title'>
          <a
            href='/home'
            className='header-link'
            aria-label='Fake Stack Overflow - Go to home'>
            Fake Stack Overflow
          </a>
        </h1>
        <div className='header-actions' role='search'>
          <div className='search-container'>
            <label htmlFor='searchBar' className='sr-only'>
              Search the site
            </label>
            <input
              id='searchBar'
              type='search'
              className='search-input'
              placeholder='Search questions, tags, users...'
              value={val}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label='Search the site'
              aria-describedby='search-help'
            />
            <div id='search-help' className='sr-only'>
              Press Enter to search. Use Tab to navigate to other options.
            </div>
          </div>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleSignOut}
            aria-label='Sign out of your account'>
            Log out
          </button>
          <button
            type='button'
            className='btn btn-primary'
            onClick={() => navigate(`/user/${currentUser.username}`)}
            aria-label={`View profile for ${currentUser.username}`}>
            View Profile
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
