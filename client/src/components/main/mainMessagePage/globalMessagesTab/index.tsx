import './index.css';
import useMessagingPage from '../../../../hooks/useMessagingPage';
import MessageCard from '../../messageCard';

/**
 * Global messages tab that contains the full global messaging functionality.
 * This is essentially the existing MessagingPage component but as a tab.
 */
const GlobalMessagesTab = () => {
  const { messages, newMessage, setNewMessage, handleSendMessage, error } = useMessagingPage();

  return (
    <div className='global-messages-tab'>
      <div className='tab-header'>
        <h2>Global Chat Room</h2>
        <p>Communicate with all users in the global chat</p>
      </div>
      
      <div className='chat-room'>
        <div className='chat-messages'>
          {messages.map(message => (
            <MessageCard key={String(message._id)} message={message} />
          ))}
        </div>
        <div className='message-input'>
          <textarea
            className='message-textbox'
            placeholder='Type your message here...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <div className='message-actions'>
            <button type='button' className='send-button' onClick={handleSendMessage}>
              Send
            </button>
            {error && <span className='error-message'>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMessagesTab;
