import './index.css';
import useDirectMessage from '../../../../hooks/useDirectMessage';
import ChatsListCard from '../chatsListCard';
import UsersListPage from '../../usersListPage';
import MessageCard from '../messageCard';

/**
 * Direct messages tab that contains the full direct messaging functionality.
 * This is essentially the existing DirectMessage component but as a tab.
 */
const DirectMessagesTab = () => {
  const {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
  } = useDirectMessage();

  return (
    <div className='direct-messages-tab'>
      <div className='tab-header'>
        <h2>Direct Messages</h2>
        <p>Send private messages to specific users or create group chats</p>
      </div>

      <div className='create-panel'>
        <button
          className='custom-button'
          onClick={() => setShowCreatePanel(prevState => !prevState)}>
          {showCreatePanel ? 'Hide Create Chat Panel' : 'Start a Chat'}
        </button>
        {error && <div className='direct-message-error'>{error}</div>}
        {showCreatePanel && (
          <>
            <p>Selected user: {chatToCreate}</p>
            <button className='custom-button' onClick={handleCreateChat}>
              Create New Chat
            </button>
            <UsersListPage handleUserSelect={handleUserSelect} />
          </>
        )}
      </div>

      <div className='direct-message-container'>
        <div className='chats-list'>
          <div className='chats-header'>
            <h3>Your Chats</h3>
            <button
              className='custom-button'
              onClick={() => setShowCreatePanel(prevState => !prevState)}>
              New Chat
            </button>
          </div>
          {chats.map(chat => (
            <ChatsListCard key={String(chat._id)} chat={chat} handleChatSelect={handleChatSelect} />
          ))}
        </div>
        <div className='chat-container'>
          {selectedChat ? (
            <>
              <h3>Chat Participants: {selectedChat.participants.join(', ')}</h3>
              <div className='chat-messages'>
                {selectedChat.messages.map(message => (
                  <MessageCard key={String(message._id)} message={message} />
                ))}
              </div>
              <div className='message-input'>
                <input
                  className='custom-input'
                  type='text'
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                />
                <button className='custom-button' onClick={handleSendMessage}>
                  Send
                </button>
                {error && <span className='error-message'>{error}</span>}
              </div>
            </>
          ) : (
            <div className='no-chat-selected'>
              <h3>Select a chat to start messaging</h3>
              <p>Choose from your existing chats or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessagesTab;
