import './index.css';
import { DatabaseCommunity } from '../../../../types/types';
import useCommunityCard from '../../../../hooks/useCommunityCard';
import CommunityMembershipButton from '../communityMembershipButton';

/**
 * CommunityCard component displays information about a community, including its name,
 * description, visibility, and number of participants. It also provides a button to join the community.
 */
const CommunityCard = ({
  community,
  setError,
}: {
  community: DatabaseCommunity;
  setError: (error: string | null) => void;
}) => {
  const { handleViewCommunity } = useCommunityCard(community, setError);

  return (
    <article
      className='community-card'
      role='article'
      aria-labelledby={`community-title-${community._id}`}>
      <header className='community-card-header'>
        <h3 id={`community-title-${community._id}`} className='community-card-title'>
          {community.name}
        </h3>
      </header>

      <div className='community-card-body'>
        <p className='community-card-description'>{community.description}</p>

        <dl className='community-card-meta'>
          <dt className='meta-label'>Visibility:</dt>
          <dd className='meta-value'>{community.visibility}</dd>

          <dt className='meta-label'>Participants:</dt>
          <dd className='meta-value'>{community.participants.length}</dd>
        </dl>
      </div>

      <footer className='community-card-actions'>
        <button
          type='button'
          className='btn btn-primary'
          onClick={handleViewCommunity}
          aria-label={`View details for ${community.name} community`}>
          View Community
        </button>
        <CommunityMembershipButton community={community} />
      </footer>
    </article>
  );
};

export default CommunityCard;
