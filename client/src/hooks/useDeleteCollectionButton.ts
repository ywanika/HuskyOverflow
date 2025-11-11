import { useNavigate, useParams } from 'react-router-dom';
import { deleteCollection } from '../services/collectionService';
import useUserContext from './useUserContext';

/**
 * Custom hook to manage the state and behavior of the delete collection button.
 *
 * @returns An object containing the following:
 * - handleDeleteCollection - A function to handle the button click.
 */
type UseDeleteOptions = {
  onDeleted?: (collectionId: string) => void;
  navigateAfterDelete?: string | null;
};

const useDeleteCollectionButton = (options?: UseDeleteOptions) => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { username } = useParams();

  const handleDeleteCollection = async (collectionId: string) => {
    await deleteCollection(collectionId, user.username);

    if (options?.onDeleted) {
      options.onDeleted(collectionId);
    }

    const targetPath = options?.navigateAfterDelete ?? `/collections/${username}`;
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return {
    handleDeleteCollection,
  };
};

export default useDeleteCollectionButton;
