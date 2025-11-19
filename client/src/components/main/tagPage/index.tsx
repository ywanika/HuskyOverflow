import './index.css';
import useTagPage from '../../../hooks/useTagPage';
import AskQuestionButton from '../askQuestionButton';
import PageHeader from '../baseComponents/pageHeader';
import TagCard from './tagCard';

/**
 * Represents the TagPage component which displays a list of tags
 * and provides functionality to handle tag clicks and ask a new question.
 */
const TagPage = () => {
  const { tlist, clickTag } = useTagPage();

  return (
    <div className='tag-page'>
      <PageHeader
        title='Tags'
        subtitle='Browse all available tags'
        count={tlist.length}
        countLabel='tags'>
        <AskQuestionButton />
      </PageHeader>

      <main className='tag-page-content'>
        <div className='tag-grid'>
          {tlist.map(tag => (
            <TagCard key={tag.name} tag={tag} onClick={clickTag} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TagPage;
