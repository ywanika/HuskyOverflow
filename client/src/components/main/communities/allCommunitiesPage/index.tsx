import './index.css';
import useAllCommunitiesPage from '../../../../hooks/useAllCommunitiesPage';
import CommunityCard from '../communityCard';
import NewCommunityButton from '../newCommunityButton';
import PageHeader from '../../baseComponents/pageHeader';

/**
 * AllCommunitiesPage component displays a list of communities and allows users to search for and join them.
 */
const AllCommunitiesPage = () => {
  const { communities, search, handleInputChange, error, setError } = useAllCommunitiesPage();

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='community-page'>
      <PageHeader
        title='Communities'
        subtitle='Join communities and connect with other users'
        count={filteredCommunities.length}
        countLabel='communities'
      >
        <div className='community-header-actions'>
          <div className='community-search-container'>
            <label htmlFor='community-search' className='sr-only'>
              Search communities
            </label>
            <input
              id='community-search'
              className='community-search-input'
              placeholder='Search communities...'
              type='search'
              value={search}
              onChange={handleInputChange}
              aria-label='Search communities by name'
              aria-describedby='community-search-help'
            />
            <div id='community-search-help' className='sr-only'>
              Enter a community name to filter the list.
            </div>
          </div>
          <NewCommunityButton />
        </div>
      </PageHeader>

      <main className='community-content'>
        {error && (
          <div className='community-error' role='alert' aria-live='polite'>
            {error}
          </div>
        )}
        <div className='communities-grid'>
          {filteredCommunities.map(community => (
            <CommunityCard
              key={community._id.toString()}
              community={community}
              setError={setError}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllCommunitiesPage;
