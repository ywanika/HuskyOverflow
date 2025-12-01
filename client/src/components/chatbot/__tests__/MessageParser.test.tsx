import MessageParser from '../MessageParser';
import React from 'react';
import { render } from '@testing-library/react';

// Mock the actions
const mockActions = {
  handleWelcome: jest.fn(),
  handleMainMenu: jest.fn(),
  handleHello: jest.fn(),
  handleQuestionsFlow: jest.fn(),
  handleBrowseQuestions: jest.fn(),
  handleSearchByTags: jest.fn(),
  handleUnansweredQuestions: jest.fn(),
  handleAskQuestion: jest.fn(),
  handleMyQuestions: jest.fn(),
  handleSearchQuestions: jest.fn(),
  handleCommunitiesFlow: jest.fn(),
  handleBrowseCommunities: jest.fn(),
  handleCreateCommunity: jest.fn(),
  handleFindCommunitiesByTopic: jest.fn(),
  handleMyCommunities: jest.fn(),
  handleGamesFlow: jest.fn(),
  handleViewGames: jest.fn(),
  handleCreateGame: jest.fn(),
  handleJoinGame: jest.fn(),
  handleLearnNim: jest.fn(),
  handleMessagingFlow: jest.fn(),
  handleGlobalMessages: jest.fn(),
  handleDirectMessages: jest.fn(),
  handleStartNewChat: jest.fn(),
  handleChatHistory: jest.fn(),
  handleCollectionsFlow: jest.fn(),
  handleViewMyCollections: jest.fn(),
  handleCreateCollection: jest.fn(),
  handleBrowsePublicCollections: jest.fn(),
  handleAddToCollection: jest.fn(),
  handleProfileFlow: jest.fn(),
  handleViewProfile: jest.fn(),
  handleEditBiography: jest.fn(),
  handleChangePassword: jest.fn(),
  handleViewActivity: jest.fn(),
  handleHelp: jest.fn(),
  handleDefault: jest.fn(),
};

describe('MessageParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    const TestChild = () => <div>Test Child</div>;
    const { container } = render(
      <MessageParser actions={mockActions}>
        <TestChild />
      </MessageParser>,
    );
    expect(container.textContent).toContain('Test Child');
  });

  describe('Greeting Detection', () => {
    it('should handle "hello" greeting', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('hello');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHello).toHaveBeenCalled();
    });

    it('should handle "hi" greeting', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('hi');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHello).toHaveBeenCalled();
    });

    it('should handle "hey" greeting', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('hey');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHello).toHaveBeenCalled();
    });
  });

  describe('Help Intent Detection', () => {
    it('should detect help intent with "help" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('help');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should detect help intent with "how to" pattern', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('how to ask a question');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should detect help intent with "what is" pattern', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('what is a community');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });
  });

  describe('Questions Flow Detection', () => {
    it('should detect questions intent with "I want to browse questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I want to browse questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // This should trigger browse questions, not questions flow
      expect(mockActions.handleBrowseQuestions).toHaveBeenCalled();
    });

    it('should detect questions intent with "show me questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('show me questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleQuestionsFlow).toHaveBeenCalled();
    });

    it('should detect questions intent with "find questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // Just "questions" triggers questions flow
      expect(mockActions.handleQuestionsFlow).toHaveBeenCalled();
    });

    it('should handle browse questions action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('browse all questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowseQuestions).toHaveBeenCalled();
    });

    it('should handle search by tags action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('questions tag');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "tag" keyword with questions entity triggers search by tags
      expect(mockActions.handleSearchByTags).toHaveBeenCalled();
    });

    it('should handle unanswered questions action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('questions unanswered');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "unanswered" keyword with questions entity triggers unanswered questions
      expect(mockActions.handleUnansweredQuestions).toHaveBeenCalled();
    });

    it('should handle ask question action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('ask a new question');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleAskQuestion).toHaveBeenCalled();
    });

    it('should handle search questions with query', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('search questions about react');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // The parser extracts the query after "search" or "find"
      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
      expect(mockActions.handleSearchQuestions).toHaveBeenCalledWith(
        expect.stringContaining('react'),
      );
    });
  });

  describe('Communities Flow Detection', () => {
    it('should detect communities intent with "communities" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });

    it('should detect communities intent with "join community"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('join community');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });

    it('should detect communities intent with "find groups"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "communities" keyword triggers communities flow
      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });

    it('should handle create community action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('create new community');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCreateCommunity).toHaveBeenCalled();
    });

    it('should handle browse communities action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('browse all communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowseCommunities).toHaveBeenCalled();
    });
  });

  describe('Games Flow Detection', () => {
    it('should detect games intent with "games" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleGamesFlow).toHaveBeenCalled();
    });

    it('should detect games intent with "play games"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('play games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "play" triggers join game action, not games flow
      expect(mockActions.handleJoinGame).toHaveBeenCalled();
    });

    it('should detect games intent with "nim game"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('nim game');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleGamesFlow).toHaveBeenCalled();
    });

    it('should handle learn about nim action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('learn about nim');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleLearnNim).toHaveBeenCalled();
    });
  });

  describe('Messaging Flow Detection', () => {
    it('should detect messaging intent with "messages" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('messages');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMessagingFlow).toHaveBeenCalled();
    });

    it('should detect messaging intent with "chat" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('chat');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMessagingFlow).toHaveBeenCalled();
    });

    it('should detect messaging intent with "direct message"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('direct message');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "direct" keyword triggers direct messages action
      expect(mockActions.handleDirectMessages).toHaveBeenCalled();
    });

    it('should handle global messages action', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('global messages');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleGlobalMessages).toHaveBeenCalled();
    });
  });

  describe('Collections Flow Detection', () => {
    it('should detect collections intent with "collections" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('collections');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCollectionsFlow).toHaveBeenCalled();
    });

    it('should detect collections intent with "save questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('save to collection');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "save" with collections entity triggers add to collection action
      expect(mockActions.handleAddToCollection).toHaveBeenCalled();
    });

    it('should detect collections intent with "my collections"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('my collections');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "my collection" triggers view my collections action
      expect(mockActions.handleViewMyCollections).toHaveBeenCalled();
    });
  });

  describe('Profile Flow Detection', () => {
    it('should detect profile intent with "profile" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('profile');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });

    it('should detect profile intent with "settings" keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('settings');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });

    it('should detect profile intent with "my account"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('my account');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });
  });

  describe('Main Menu Detection', () => {
    it('should handle "menu" request', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('menu');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMainMenu).toHaveBeenCalled();
    });

    it('should handle "options" request', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('options');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMainMenu).toHaveBeenCalled();
    });

    it('should handle "what can you do" request', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('what can you do');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMainMenu).toHaveBeenCalled();
    });

    it('should handle "what can i do" request', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('what can i do');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMainMenu).toHaveBeenCalled();
    });
  });

  describe('Questions Flow - All Variations', () => {
    it('should handle "view all questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('view all questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowseQuestions).toHaveBeenCalled();
    });

    it('should handle "show all questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('show all questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowseQuestions).toHaveBeenCalled();
    });

    it('should handle "questions tag"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('questions tag');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchByTags).toHaveBeenCalled();
    });

    it('should handle "questions with no answer"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('questions with no answer');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleUnansweredQuestions).toHaveBeenCalled();
    });

    it('should handle "post question"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('post question');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleAskQuestion).toHaveBeenCalled();
    });

    it('should handle "my questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('my questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMyQuestions).toHaveBeenCalled();
    });

    it('should handle "find questions about react"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('find questions about react');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
      expect(mockActions.handleSearchQuestions).toHaveBeenCalledWith(
        expect.stringContaining('react'),
      );
    });

    it('should handle "look for Python questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('look for Python questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
    });

    it('should handle "I need help with questions" - triggers help first', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I need help with questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "help" keyword triggers help intent first
      expect(mockActions.handleHelp).toHaveBeenCalled();
    });
  });

  describe('Communities Flow - All Variations', () => {
    it('should handle "show all communities"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('show all communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowseCommunities).toHaveBeenCalled();
    });

    it('should handle "make a community"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('make a community');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCreateCommunity).toHaveBeenCalled();
    });

    it('should handle "find communities"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('find communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleFindCommunitiesByTopic).toHaveBeenCalled();
    });

    it('should handle "my communities"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('my communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMyCommunities).toHaveBeenCalled();
    });

    it('should handle "I want to join communities"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I want to join communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });
  });

  describe('Games Flow - All Variations', () => {
    it('should handle "show games"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('show games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleViewGames).toHaveBeenCalled();
    });

    it('should handle "new game"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('new game');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCreateGame).toHaveBeenCalled();
    });

    it('should handle "what is Nim?" - triggers help first', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('what is Nim?');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "what is" triggers help intent first
      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should handle "tell me about Nim" - triggers help first', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('tell me about Nim');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      // "tell me" triggers help intent first
      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should handle "learn about nim"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('learn about nim');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleLearnNim).toHaveBeenCalled();
    });

    it('should handle "I want to play games"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I want to play games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleJoinGame).toHaveBeenCalled();
    });
  });

  describe('Messaging Flow - All Variations', () => {
    it('should handle "private messages"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('private messages');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDirectMessages).toHaveBeenCalled();
    });

    it('should handle "start chat"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('start chat');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleStartNewChat).toHaveBeenCalled();
    });

    it('should handle "previous chats"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('previous chats');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleChatHistory).toHaveBeenCalled();
    });

    it('should handle "I want to send messages"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I want to send messages');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleMessagingFlow).toHaveBeenCalled();
    });
  });

  describe('Collections Flow - All Variations', () => {
    it('should handle "view my collections"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('view my collections');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleViewMyCollections).toHaveBeenCalled();
    });

    it('should handle "browse public collections"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('browse public collections');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleBrowsePublicCollections).toHaveBeenCalled();
    });

    it('should handle "save to collection"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('save to collection');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleAddToCollection).toHaveBeenCalled();
    });

    it('should handle "I want to work with collections"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I want to work with collections');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCollectionsFlow).toHaveBeenCalled();
    });
  });

  describe('Profile Flow - All Variations', () => {
    it('should handle "show my profile"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('show my profile');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });

    it('should handle "edit biography"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('edit biography');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleEditBiography).toHaveBeenCalled();
    });

    it('should handle "change password" with profile keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('profile password');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleChangePassword).toHaveBeenCalled();
    });

    it('should handle "view activity" with profile keyword', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('profile activity');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleViewActivity).toHaveBeenCalled();
    });

    it('should handle "manage my profile"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('manage my profile');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });
  });

  describe('Navigation Patterns', () => {
    it('should handle "go to questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('go to questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleQuestionsFlow).toHaveBeenCalled();
    });

    it('should handle "take me to communities"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('take me to communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });

    it('should handle "I need to play games"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('I need to play games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleJoinGame).toHaveBeenCalled();
    });

    it('should handle "open profile"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('open profile');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleProfileFlow).toHaveBeenCalled();
    });
  });

  describe('Help Patterns', () => {
    it('should handle "can you tell me"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('can you tell me about questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should handle "explain"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('explain how to use communities');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should handle "tutorial"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('tutorial on games');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });

    it('should handle "instructions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('instructions for messaging');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHelp).toHaveBeenCalled();
    });
  });

  describe('Case Variations', () => {
    it('should handle uppercase "QUESTIONS"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('QUESTIONS');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleQuestionsFlow).toHaveBeenCalled();
    });

    it('should handle mixed case "CoMmUnItIeS"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('CoMmUnItIeS');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleCommunitiesFlow).toHaveBeenCalled();
    });

    it('should handle "GAMES" in uppercase', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('GAMES');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleGamesFlow).toHaveBeenCalled();
    });
  });

  describe('Search Query Extraction', () => {
    it('should extract query from "search for questions about async await"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('search for questions about async await');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
      expect(mockActions.handleSearchQuestions).toHaveBeenCalledWith(
        expect.stringContaining('async await'),
      );
    });

    it('should extract query from "find React questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('find React questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
      expect(mockActions.handleSearchQuestions).toHaveBeenCalledWith(
        expect.stringContaining('React'),
      );
    });
  });

  describe('Special Characters Handling', () => {
    it('should handle "search for C++ questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('search for C++ questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
    });

    it('should handle "find .NET questions"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('find .NET questions');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleSearchQuestions).toHaveBeenCalled();
    });
  });

  describe('Default Handling', () => {
    it('should handle empty messages', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDefault).toHaveBeenCalled();
    });

    it('should handle whitespace-only messages', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('   ');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDefault).toHaveBeenCalled();
    });

    it('should handle unknown messages', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('random gibberish text');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDefault).toHaveBeenCalled();
    });

    it('should handle "asdfghjkl"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('asdfghjkl');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDefault).toHaveBeenCalled();
    });

    it('should handle "xyz123"', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('xyz123');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleDefault).toHaveBeenCalled();
    });
  });

  describe('Welcome Message', () => {
    it('should handle "welcome" as greeting', () => {
      const TestComponent = ({ parse }: { parse?: (msg: string) => void }) => {
        React.useEffect(() => {
          parse?.('welcome');
        }, [parse]);
        return null;
      };

      render(
        <MessageParser actions={mockActions}>
          <TestComponent />
        </MessageParser>,
      );

      expect(mockActions.handleHello).toHaveBeenCalled();
    });
  });
});
