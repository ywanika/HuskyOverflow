import './index.css';
import GlobalMessagesTab from './globalMessagesTab';
import DirectMessagesTab from './directMessagesTab';
import PageHeader from '../baseComponents/pageHeader';
import useMainMessagePage from '../../../hooks/useMainMessagePage';

/**
 * Main messaging page with tabs for global and direct messages.
 * All messaging functionality is contained within this single page.
 */
const MainMessagePage = () => {
  const { activeTab, handleTabChange } = useMainMessagePage();

  return (
    <div className='main-message-page'>
      <PageHeader
        title='Messaging'
        subtitle='Communicate with other users'
      >
        <div className='tab-navigation' role='tablist' aria-label='Message types'>
          <button
            type='button'
            className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => handleTabChange('global')}
            role='tab'
            aria-selected={activeTab === 'global'}
            aria-controls='global-tabpanel'
            id='global-tab'
          >
            Global Messages
          </button>
          <button
            type='button'
            className={`tab-button ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => handleTabChange('direct')}
            role='tab'
            aria-selected={activeTab === 'direct'}
            aria-controls='direct-tabpanel'
            id='direct-tab'
          >
            Direct Messages
          </button>
        </div>
      </PageHeader>
      
      <main className='tab-content'>
        <div
          id='global-tabpanel'
          role='tabpanel'
          aria-labelledby='global-tab'
          hidden={activeTab !== 'global'}
        >
          {activeTab === 'global' && <GlobalMessagesTab />}
        </div>
        <div
          id='direct-tabpanel'
          role='tabpanel'
          aria-labelledby='direct-tab'
          hidden={activeTab !== 'direct'}
        >
          {activeTab === 'direct' && <DirectMessagesTab />}
        </div>
      </main>
    </div>
  );
};

export default MainMessagePage;
