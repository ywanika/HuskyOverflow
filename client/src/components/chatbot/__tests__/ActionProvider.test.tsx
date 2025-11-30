import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActionProvider from '../ActionProvider';
import { createChatBotMessage } from 'react-chatbot-kit';

// Mock react-chatbot-kit
jest.mock('react-chatbot-kit', () => ({
  createChatBotMessage: jest.fn((message: string, options?: any) => ({
    message,
    type: 'bot',
    ...options,
  })),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useUserContext
jest.mock('../../../hooks/useUserContext', () => ({
  __esModule: true,
  default: () => ({
    user: { username: 'testuser' },
    socket: {},
  }),
}));

describe('ActionProvider', () => {
  let mockSetState: jest.Mock;
  let mockCreateChatBotMessage: jest.MockedFunction<typeof createChatBotMessage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockSetState = jest.fn((updater) => {
      const prevState = {
        messages: [],
        currentFlow: null,
        userContext: 'returning_user',
        selectedFeature: null,
        searchQuery: '',
        navigationTarget: null,
      };
      return updater(prevState);
    });
    mockCreateChatBotMessage = createChatBotMessage as jest.MockedFunction<typeof createChatBotMessage>;
  });

  it('should render children', () => {
    const { container } = render(
      <MemoryRouter>
        <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
          <div>Test Child</div>
        </ActionProvider>
      </MemoryRouter>
    );
    expect(container.textContent).toContain('Test Child');
  });

  describe('Welcome Message', () => {
    it('should have correct welcome message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleWelcome();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "Hi! I'm your HuskyFlow assistant. I can help you navigate to different parts of the app. What would you like to do?",
        { delay: 500 }
      );
    });
  });

  describe('Questions Flow', () => {
    it('should have correct questions flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleQuestionsFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "I can help you with questions! What would you like to do?",
        expect.objectContaining({
          delay: 500,
          widget: 'questionsMenu',
        })
      );
    });

    it('should handle browse questions action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleBrowseQuestions();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to browse all questions...',
        { delay: 500 }
      );
    });

    it('should handle ask question action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleAskQuestion();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to ask a new question...',
        { delay: 500 }
      );
    });
  });

  describe('Communities Flow', () => {
    it('should have correct communities flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCommunitiesFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "Let's explore communities! What interests you?",
        expect.objectContaining({
          delay: 500,
          widget: 'communitiesMenu',
        })
      );
    });

    it('should handle browse communities action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleBrowseCommunities();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to browse all communities...',
        { delay: 500 }
      );
    });

    it('should handle create community action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCreateCommunity();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to create a new community...',
        { delay: 500 }
      );
    });
  });

  describe('Games Flow', () => {
    it('should have correct games flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleGamesFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Ready to play? We have games available!',
        expect.objectContaining({
          delay: 500,
          widget: 'gamesMenu',
        })
      );
    });

    it('should handle learn about Nim action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleLearnNim();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        expect.stringContaining('Nim is a mathematical game'),
        { delay: 500 }
      );
    });
  });

  describe('Messaging Flow', () => {
    it('should have correct messaging flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleMessagingFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "I can help you with messaging!",
        expect.objectContaining({
          delay: 500,
          widget: 'messagingMenu',
        })
      );
    });

    it('should handle global messages action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleGlobalMessages();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to global messages...',
        { delay: 500 }
      );
    });
  });

  describe('Collections Flow', () => {
    it('should have correct collections flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCollectionsFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "Let's work with your collections!",
        expect.objectContaining({
          delay: 500,
          widget: 'collectionsMenu',
        })
      );
    });

    it('should handle create collection action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCreateCollection();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to create a new collection...',
        { delay: 500 }
      );
    });
  });

  describe('Profile Flow', () => {
    it('should have correct profile flow message matching Sprint 0 requirements', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleProfileFlow();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        "Let's manage your profile!",
        expect.objectContaining({
          delay: 500,
          widget: 'profileMenu',
        })
      );
    });

    it('should handle view profile action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleViewProfile();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to view your profile...',
        { delay: 500 }
      );
    });
  });

  describe('Help & Support', () => {
    it('should handle help action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleHelp();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        expect.stringContaining('I can help you with:'),
        { delay: 500 }
      );
    });
  });

  describe('Default Handling', () => {
    it('should handle default/unknown messages', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleDefault();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        expect.stringContaining("I'm not sure how to help with that"),
        { delay: 500 }
      );
    });
  });

  describe('Search Questions', () => {
    it('should handle search questions with query', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleSearchQuestions('react hooks');
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        expect.stringContaining('Searching for questions about "react hooks"'),
        expect.objectContaining({
          delay: 500,
          widget: 'questionSearch',
        })
      );
    });
  });

  describe('All Questions Actions', () => {
    it('should handle search by tags action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleSearchByTags();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to search questions by tags...',
        { delay: 500 }
      );
    });

    it('should handle unanswered questions action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleUnansweredQuestions();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Finding unanswered questions for you...',
        { delay: 500 }
      );
    });

    it('should handle my questions action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleMyQuestions();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Finding your questions...',
        { delay: 500 }
      );
    });
  });

  describe('All Communities Actions', () => {
    it('should handle find communities by topic action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleFindCommunitiesByTopic();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Let me help you find communities by topic...',
        { delay: 500 }
      );
    });

    it('should handle my communities action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleMyCommunities();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Finding your communities...',
        { delay: 500 }
      );
    });
  });

  describe('All Games Actions', () => {
    it('should handle view games action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleViewGames();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to view available games...',
        { delay: 500 }
      );
    });

    it('should handle create game action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCreateGame();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to create a new game...',
        { delay: 500 }
      );
    });

    it('should handle join game action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleJoinGame();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to join a game...',
        { delay: 500 }
      );
    });
  });

  describe('All Messaging Actions', () => {
    it('should handle direct messages action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleDirectMessages();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to direct messages...',
        { delay: 500 }
      );
    });

    it('should handle start new chat action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleStartNewChat();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to start a new chat...',
        { delay: 500 }
      );
    });

    it('should handle chat history action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleChatHistory();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to view chat history...',
        { delay: 500 }
      );
    });
  });

  describe('All Collections Actions', () => {
    it('should handle view my collections action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleViewMyCollections();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to view your collections...',
        { delay: 500 }
      );
    });

    it('should handle browse public collections action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleBrowsePublicCollections();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Finding public collections...',
        { delay: 500 }
      );
    });

    it('should handle add to collection action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleAddToCollection();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        expect.stringContaining('To add questions to a collection'),
        { delay: 500 }
      );
    });
  });

  describe('All Profile Actions', () => {
    it('should handle edit biography action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleEditBiography();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to edit your biography...',
        { delay: 500 }
      );
    });

    it('should handle change password action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleChangePassword();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to change your password...',
        { delay: 500 }
      );
    });

    it('should handle view activity action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleViewActivity();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Taking you to view your activity...',
        { delay: 500 }
      );
    });
  });

  describe('Main Menu', () => {
    it('should handle main menu action', () => {
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleMainMenu();
        }, [actions]);
        return null;
      };

      render(
        <MemoryRouter>
          <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={mockSetState}>
            <TestComponent />
          </ActionProvider>
        </MemoryRouter>
      );

      expect(mockCreateChatBotMessage).toHaveBeenCalledWith(
        'Here are the main options:',
        expect.objectContaining({
          delay: 500,
          widget: 'mainMenu',
        })
      );
    });
  });

  describe('State Management', () => {
    it('should update currentFlow state for questions flow', () => {
      let capturedState: any = null;
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleQuestionsFlow();
        }, [actions]);
        return null;
      };

      const customSetState = jest.fn((updater) => {
        const prevState = {
          messages: [],
          currentFlow: null,
          userContext: 'returning_user',
          selectedFeature: null,
          searchQuery: '',
          navigationTarget: null,
        };
        capturedState = updater(prevState);
        return capturedState;
      });

      render(
        <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={customSetState}>
          <TestComponent />
        </ActionProvider>
      );

      expect(capturedState.currentFlow).toBe('questions');
    });

    it('should update currentFlow state for communities flow', () => {
      let capturedState: any = null;
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleCommunitiesFlow();
        }, [actions]);
        return null;
      };

      const customSetState = jest.fn((updater) => {
        const prevState = {
          messages: [],
          currentFlow: null,
          userContext: 'returning_user',
          selectedFeature: null,
          searchQuery: '',
          navigationTarget: null,
        };
        capturedState = updater(prevState);
        return capturedState;
      });

      render(
        <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={customSetState}>
          <TestComponent />
        </ActionProvider>
      );

      expect(capturedState.currentFlow).toBe('communities');
    });

    it('should update searchQuery state for search questions', () => {
      let capturedState: any = null;
      const TestComponent = ({ actions }: { actions: any }) => {
        React.useEffect(() => {
          actions.handleSearchQuestions('javascript async');
        }, [actions]);
        return null;
      };

      const customSetState = jest.fn((updater) => {
        const prevState = {
          messages: [],
          currentFlow: null,
          userContext: 'returning_user',
          selectedFeature: null,
          searchQuery: '',
          navigationTarget: null,
        };
        capturedState = updater(prevState);
        return capturedState;
      });

      render(
        <ActionProvider createChatBotMessage={mockCreateChatBotMessage} setState={customSetState}>
          <TestComponent />
        </ActionProvider>
      );

      expect(capturedState.searchQuery).toBe('javascript async');
    });
  });
});

