import './index.css';
import useAllCollectionsPage from '../../../../hooks/useAllCollectionsPage';
import CollectionCard from '../collectionCard';
import PageHeader from '../../baseComponents/pageHeader';

/**
 * AllCollectionsPage component displays a list of collections for a specific user.
 */
const AllCollectionsPage = () => {
  const {
    usernameBeingViewed,
    collections,
    handleCreateCollection,
    handleViewCollection,
    handleLocalDeleteCollection,
    isOwner,
  } = useAllCollectionsPage();

  return (
    <div className='collections-page'>
      <PageHeader
        title={`${usernameBeingViewed}'s Collections`}
        subtitle={isOwner ? 'Manage your question collections' : 'View user collections'}
        count={collections.length}
        countLabel='collections'>
        {isOwner && (
          <button
            type='button'
            className='btn btn-primary'
            onClick={handleCreateCollection}
            aria-label='Create a new collection'>
            Create Collection
          </button>
        )}
      </PageHeader>

      <main className='collections-content'>
        <div className='collections-grid'>
          {collections.map(collection => (
            <CollectionCard
              key={collection._id.toString()}
              collection={collection}
              isOwner={isOwner}
              onView={handleViewCollection}
              onDeleted={handleLocalDeleteCollection}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllCollectionsPage;
