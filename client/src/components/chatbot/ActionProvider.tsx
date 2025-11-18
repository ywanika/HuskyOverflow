import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';

interface ActionProviderProps {
  createChatBotMessage: typeof createChatBotMessage;
  setState: (updater: (prev: any) => any) => void;
  children: React.ReactNode;
}

const ActionProvider = ({ createChatBotMessage, setState, children }: ActionProviderProps) => {
  const handleHello = () => {
    const botMessage = createChatBotMessage('Hello! Nice to meet you. How can I assist you today?', {});

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleHelp = () => {
    const botMessage = createChatBotMessage(
      "I can help you with questions about FakeStackOverflow! Try asking me about:\n- How to ask questions\n- How to answer questions\n- Tags and communities\n- Collections\n- Games\n- Messaging",
      {},
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleDefault = () => {
    const botMessage = createChatBotMessage(
      "I'm not sure how to help with that. Try asking for 'help' to see what I can assist you with!",
      {},
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          actions: {
            handleHello,
            handleHelp,
            handleDefault,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;

