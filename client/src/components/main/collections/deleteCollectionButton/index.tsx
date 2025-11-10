import './index.css';
import useDeleteCollectionButton from '../../../../hooks/useDeleteCollectionButton';

/**
 * This component renders a button that allows the user to delete a specific collection.
 */
const DeleteCollectionButton = ({ collectionId, onDeleted }: { collectionId: string; onDeleted?: (id: string) => void }) => {
  const { handleDeleteCollection } = useDeleteCollectionButton({ onDeleted, navigateAfterDelete: null });

  return (
    <div className='delete-collection-wrapper'>
      <button
        className='delete-collection-button'
        onClick={event => {
          event.stopPropagation();
          handleDeleteCollection(collectionId);
        }}>
        Delete Collection
      </button>
    </div>
  );
};

export default DeleteCollectionButton;
