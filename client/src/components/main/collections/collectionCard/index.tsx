import './index.css';

import DeleteCollectionButton from '../deleteCollectionButton';
import { PopulatedDatabaseCollection } from '../../../../types/types';

interface CollectionCardProps {
  collection: PopulatedDatabaseCollection;
  isOwner: boolean;
  onView: (collectionId: string) => void;
  onDeleted?: (collectionId: string) => void;
}

const CollectionCard = ({ collection, isOwner, onView, onDeleted }: CollectionCardProps) => {
  const handleView = () => onView(collection._id.toString());

  return (
    <article className='collection-card' role='article' aria-labelledby={`collection-title-${collection._id}`}>
      <header className='collection-card-header'>
        <h2 id={`collection-title-${collection._id}`} className='collection-name'>
          {collection.name}
        </h2>
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
        <button
          type='button'
          className='btn btn-primary'
          onClick={handleView}
          aria-label={`View collection ${collection.name}`}
        >
          View Collection
        </button>
        {isOwner && (
          <DeleteCollectionButton collectionId={collection._id.toString()} onDeleted={onDeleted} />
        )}
      </footer>
    </article>
  );
};

export default CollectionCard;


