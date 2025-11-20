import React from 'react';

const Markdown = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid='markdown'>{children}</div>;
};

export default Markdown;

