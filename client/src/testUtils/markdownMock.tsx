import React from 'react';

/**
 * Mock for react-markdown component used in tests
 */
const Markdown = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid='markdown'>{children}</div>;
};

export default Markdown;

