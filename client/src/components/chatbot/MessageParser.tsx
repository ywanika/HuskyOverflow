import React from 'react';

interface MessageParserProps {
  children: React.ReactNode;
  actions: {
    handleHello: () => void;
    handleHelp: () => void;
    handleDefault: () => void;
  };
}

const MessageParser = ({ children, actions }: MessageParserProps) => {
  const parse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      actions.handleHello();
    } else if (lowerMessage.includes('help')) {
      actions.handleHelp();
    } else {
      actions.handleDefault();
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          parse: parse,
          actions: actions,
        });
      })}
    </div>
  );
};

export default MessageParser;

