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
  const location = useLocation();

  const isModerator = user.role === 'moderator' || user.role === 'admin';

  const navigationItems = [
    { to: '/home', id: 'menu_questions', label: 'Questions' },
    { to: '/tags', id: 'menu_tag', label: 'Tags' },
    { to: '/messaging', id: 'menu_messaging', label: 'Messaging' },
    { to: '/users', id: 'menu_users', label: 'Users' },
    { to: '/games', id: 'menu_games', label: 'Games' },
    { to: '/communities', id: 'menu_communities', label: 'Communities' },
    { to: `/collections/${user.username}`, id: 'menu_collections', label: 'My Collections' },
    ...(isModerator
      ? [{ to: '/moderator/dashboard', id: 'menu_moderator_dashboard', label: 'Moderator Dashboard' }]
      : []),
  ];

  return (
    <nav id='sideBarNav' className='sideBarNav' role='navigation' aria-label='Main navigation'>
      <ul className='nav-list'>
        {navigationItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <li key={item.id}>
              <NavLink
                to={item.to}
                id={item.id}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}>
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SideBarNav;
