import './index.css';
import useAllCollectionsPage from '../../../../hooks/useAllCollectionsPage';
import DeleteCollectionButton from '../deleteCollectionButton';
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
    isOwner,
  } = useAllCollectionsPage();

  return (
    <div className='collections-page'>
      <PageHeader
        title={`${usernameBeingViewed}'s Collections`}
        subtitle={isOwner ? 'Manage your question collections' : 'View user collections'}
        count={collections.length}
        countLabel='collections'
      >
        {isOwner && (
          <button 
            type='button'
            className='btn btn-primary'
            onClick={handleCreateCollection}
            aria-label='Create a new collection'
          >
            Create Collection
          </button>
        )}
      </PageHeader>

      <main className='collections-content'>
        <div className='collections-grid'>
          {collections.map(collection => (
            <article
              key={collection._id.toString()}
              className='collection-card'
              onClick={() => handleViewCollection(collection._id.toString())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewCollection(collection._id.toString());
                }
              }}
              tabIndex={0}
              role='button'
              aria-label={`View collection: ${collection.name}`}
            >
              <header className='collection-card-header'>
                <h2 className='collection-name'>{collection.name}</h2>
              </header>
              
              <div className='collection-card-body'>
                <p className='collection-description'>{collection.description}</p>
                
                <dl className='collection-meta'>
                  <dt className='meta-label'>Privacy:</dt>
                  <dd className='meta-value'>{collection.isPrivate ? 'Private' : 'Public'}</dd>
                  
                  <dt className='meta-label'>Questions:</dt>
                  <dd className='meta-value'>{collection.questions.length}</dd>
                </dl>
              </div>
              
              <footer className='collection-card-actions'>
                {isOwner && (
                  <DeleteCollectionButton collectionId={collection._id.toString()} />
                )}
              </footer>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllCollectionsPage;
