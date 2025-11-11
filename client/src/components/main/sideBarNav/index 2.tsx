import './index.css';
import { NavLink, useLocation } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * The SideBarNav component has a sidebar navigation menu for all the main pages.
 * It highlights the currently selected item based on the active page and
 * follows WCAG 2.1 AA accessibility guidelines.
 */
const SideBarNav = () => {
  const { user } = useUserContext();
  const location = useLocation();

  return (
    <nav id='sideBarNav' className='sideBarNav' role='navigation' aria-label='Main navigation'>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li>
          <NavLink
            to='/home'
            id='menu_questions'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/home' ? 'page' : undefined}>
            Questions
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/tags'
            id='menu_tag'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/tags' ? 'page' : undefined}>
            Tags
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/messaging'
            id='menu_messaging'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/messaging' ? 'page' : undefined}>
            Messaging
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/users'
            id='menu_users'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/users' ? 'page' : undefined}>
            Users
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/games'
            id='menu_games'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/games' ? 'page' : undefined}>
            Games
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/communities'
            id='menu_communities'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={location.pathname === '/communities' ? 'page' : undefined}>
            Communities
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`/collections/${user.username}`}
            id='menu_collections'
            className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
            aria-current={
              location.pathname === `/collections/${user.username}` ? 'page' : undefined
            }>
            My Collections
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default SideBarNav;
