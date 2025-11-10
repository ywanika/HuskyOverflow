import './index.css';
import useAllGamesPage from '../../../../hooks/useAllGamesPage';
import GameCard from './gameCard';
import PageHeader from '../../baseComponents/pageHeader';

/**
 * Component to display the "All Games" page, which provides functionality to view, create, and join games.
 * @returns A React component that includes:
 * - A "Create Game" button to open a modal for selecting a game type.
 * - A list of available games, each rendered using the `GameCard` component.
 * - A refresh button to reload the list of available games from the server.
 */
const AllGamesPage = () => {
  const {
    availableGames,
    handleJoin,
    fetchGames,
    isModalOpen,
    handleToggleModal,
    handleSelectGameType,
    error,
  } = useAllGamesPage();

  return (
    <div className='games-page'>
      <PageHeader
        title='Games'
      >
        <div className='games-header-actions'>
          <button 
            type='button'
            className='btn btn-secondary'
            onClick={fetchGames}
            aria-label='Refresh games list'
          >
            Refresh List
          </button>
          <button 
            type='button'
            className='btn btn-primary'
            onClick={handleToggleModal}
            aria-label='Create a new game'
          >
            Create Game
          </button>
        </div>
      </PageHeader>

      <main className='games-content'>
        <div className='games-list'>
          {availableGames.length > 0 ? (
            availableGames.map(game => (
              <GameCard
                key={game.gameID}
                game={game}
                handleJoin={handleJoin}
              />
            ))
          ) : (
            <div className='no-games-message'>
              No games available. Create a new game to get started!
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className='game-modal-overlay' role='dialog' aria-labelledby='modal-title' aria-modal='true'>
          <div className='game-modal'>
            <div className='modal-content'>
              <h2 id='modal-title'>Select Game Type</h2>
              <div className='modal-actions'>
                <button 
                  type='button'
                  className='btn btn-primary'
                  onClick={() => handleSelectGameType('Nim')}
                >
                  Create Nim Game
                </button>
                <button 
                  type='button'
                  className='btn btn-secondary'
                  onClick={handleToggleModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className='game-error' role='alert' aria-live='polite'>
          {error}
        </div>
      )}
    </div>
  );
};

export default AllGamesPage;
