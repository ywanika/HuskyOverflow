import './index.css';
import { useEffect, useState } from 'react';
import useUserContext from '../../../../hooks/useUserContext';
import { DatabaseMessage, Message, MessageUpdatePayload } from '../../../../types/types';
import { addMessage, getMessages } from '../../../../services/messageService';
import MessageCard from '../messageCard';

/**
 * Global messages tab that contains the full global messaging functionality.
 * This is essentially the existing MessagingPage component but as a tab.
 */
const GlobalMessagesTab = () => {
  const { user, socket } = useUserContext();
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      const msgs = await getMessages();
      setMessages(msgs);
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const handleMessageUpdate = (data: MessageUpdatePayload) => {
      setMessages(prev => [...prev, data.msg]);
    };

    socket.on('messageUpdate', handleMessageUpdate);
    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      setError('Message cannot be empty');
      return;
    }

    setError('');

    const messageToAdd: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
    };

    // Persist message and optimistically update UI with returned message
    try {
      const saved = await addMessage(messageToAdd);
      setMessages(prev => [...prev, saved]);
      setNewMessage('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

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
