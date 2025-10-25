import { useState } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * The SideBarNav component has a sidebar navigation menu for all the main pages.
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const { user } = useUserContext();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const location = useLocation();

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const isActiveOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  return (
    <nav id='sideBarNav' className='sideBarNav' role="navigation" aria-label="Main navigation">
      <NavLink
        to='/home'
        id='menu_questions'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === '/home' ? 'page' : undefined}>
        Questions
      </NavLink>
      <NavLink
        to='/tags'
        id='menu_tag'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === '/tags' ? 'page' : undefined}>
        Tags
      </NavLink>
      <NavLink
        to='/messaging'
        id='menu_messaging'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        onClick={toggleOptions}
        aria-expanded={showOptions}
        aria-haspopup="true"
        aria-current={location.pathname === '/messaging' ? 'page' : undefined}>
        Messaging
      </NavLink>
      {showOptions && (
        <div className='additional-options' role="menu" aria-label="Messaging options">
          <NavLink
            to='/messaging'
            className={`menu_button message-options ${isActiveOption('/messaging')}`}
            role="menuitem"
            aria-current={location.pathname === '/messaging' ? 'page' : undefined}>
            Global Messages
          </NavLink>
          <NavLink
            to='/messaging/direct-message'
            className={`menu_button message-options ${isActiveOption('/messaging/direct-message')}`}
            role="menuitem"
            aria-current={location.pathname === '/messaging/direct-message' ? 'page' : undefined}>
            Direct Messages
          </NavLink>
        </div>
      )}
      <NavLink
        to='/users'
        id='menu_users'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === '/users' ? 'page' : undefined}>
        Users
      </NavLink>
      <NavLink
        to='/games'
        id='menu_games'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === '/games' ? 'page' : undefined}>
        Games
      </NavLink>
      <NavLink
        to='/communities'
        id='menu_communities'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === '/communities' ? 'page' : undefined}>
        Communities
      </NavLink>
      <NavLink
        to={`/collections/${user.username}`}
        id='menu_collections'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        aria-current={location.pathname === `/collections/${user.username}` ? 'page' : undefined}>
        My Collections
      </NavLink>
    </nav>
  );
};

export default SideBarNav;
