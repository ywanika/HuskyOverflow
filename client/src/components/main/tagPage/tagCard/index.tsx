import './index.css';

/**
 * Interface representing the props for the TagCard component.
 */
interface TagCardProps {
  tag: {
    name: string;
    qcnt: number;
  };
  onClick: (tagName: string) => void;
}

/**
 * TagCard component displays information about a tag in a card format.
 * Similar to CommunityCard but designed for tags.
 * 
 * @param tag - The tag object containing name and question count
 * @param onClick - Function to handle tag click
 */
const TagCard = ({ tag, onClick }: TagCardProps) => {
  const handleClick = () => {
    onClick(tag.name);
  };

  return (
    <article 
      className='tag-card' 
      role='article' 
      aria-labelledby={`tag-title-${tag.name}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <header className='tag-card-header'>
        <h3 id={`tag-title-${tag.name}`} className='tag-card-title'>
          {tag.name}
        </h3>
      </header>
      
      <div className='tag-card-body'>
        <dl className='tag-card-meta'>
          <dt className='meta-label'>Questions:</dt>
          <dd className='meta-value'>{tag.qcnt}</dd>
        </dl>
      </div>
      
      <footer className='tag-card-actions'>
        <button
          type='button'
          className='btn btn-primary'
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`View questions tagged with ${tag.name}`}>
          View Questions
        </button>
      </footer>
    </article>
  );
};

export default TagCard;
