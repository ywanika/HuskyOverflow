import './index.css';
import useUserSearch from '../../../../hooks/useUserSearch';
import PageHeader from '../../baseComponents/pageHeader';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount: _userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <PageHeader title='Users'>
      <div className='user-search-container'>
        <label htmlFor='user_search_bar' className='sr-only'>
          Search users by username
        </label>
        <input
          id='user_search_bar'
          className='user-search-input'
          placeholder='Search usernames...'
          type='search'
          value={val}
          onChange={handleInputChange}
          aria-label='Search users by username'
          aria-describedby='user-search-help'
        />
        <div id='user-search-help' className='sr-only'>
          Enter a username to filter the user list. Search is case-sensitive.
        </div>
      </div>
    </PageHeader>
  );
};

export default UsersListHeader;
