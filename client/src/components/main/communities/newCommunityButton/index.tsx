import './index.css';
import useNewCommunityButton from '../../../../hooks/useNewCommunityButton';

const NewCommunityButton = () => {
  const { handleClick } = useNewCommunityButton();

  return (
    <button className='new-community-button' onClick={handleClick}>
      Create Community
    </button>
  );
};

export default NewCommunityButton;
