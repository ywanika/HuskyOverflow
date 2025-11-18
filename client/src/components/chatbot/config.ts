import { createChatBotMessage } from 'react-chatbot-kit';

const botName = 'FakeStackOverflowBot';

const config = {
  botName: botName,
  initialMessages: [
    createChatBotMessage(`Hi! I'm ${botName}. How can I help you today?`, {}),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#3182ce',
    },
    chatButton: {
      backgroundColor: '#3182ce',
    },
  },
  state: {},
  customComponents: {},
  widgets: [],
};

export default config;

