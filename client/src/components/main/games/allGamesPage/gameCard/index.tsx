import './index.css';
import { GameInstance, GameState } from '../../../../../types/types';

/**
 * Component to display a game card with details about a specific game instance.
 * @param game The game instance to display.
 * @param handleJoin Function to handle joining the game. Takes the game ID as an argument.
 * @returns A React component rendering the game details and a join button if the game is waiting to start.
 */
const GameCard = ({
  game,
  handleJoin,
}: {
  game: GameInstance<GameState>;
  handleJoin: (gameID: string) => void;
}) => {
  const handleClick = () => {
    if (game.state.status === 'WAITING_TO_START') {
      handleJoin(game.gameID);
    }
  };

  return (
    <article 
      className='game-card' 
      role='article' 
      aria-labelledby={`game-title-${game.gameID}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <header className='game-card-header'>
        <h3 id={`game-title-${game.gameID}`} className='game-card-title'>
          {game.gameType} Game
        </h3>
      </header>
      
      <div className='game-card-body'>
        <dl className='game-card-meta'>
          <dt className='meta-label'>Status:</dt>
          <dd className='meta-value'>{game.state.status}</dd>
          <dt className='meta-label'>Players:</dt>
          <dd className='meta-value'>{game.players.length}</dd>
        </dl>
        
        {game.players.length > 0 && (
          <div className='game-players'>
            <h4 className='players-title'>Current Players:</h4>
            <ul className='players-list'>
              {game.players.map((player: string) => (
                <li key={`${game.gameID}-${player}`} className='player-item'>
                  {player}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <footer className='game-card-actions'>
        {game.state.status === 'WAITING_TO_START' ? (
          <button
            type='button'
            className='btn btn-primary'
            onClick={(e) => {
              e.stopPropagation();
              handleJoin(game.gameID);
            }}
            aria-label={`Join ${game.gameType} game`}>
            Join Game
          </button>
        ) : (
          <div className='game-status-disabled'>
            Game in Progress
          </div>
        )}
      </footer>
    </article>
  );
};

export default GameCard;
