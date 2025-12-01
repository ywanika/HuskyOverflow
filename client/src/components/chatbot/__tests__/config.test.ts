import config from '../config';

// Mock react-chatbot-kit
jest.mock('react-chatbot-kit', () => ({
  createChatBotMessage: jest.fn((message: string, options?: Record<string, unknown>) => ({
    message,
    type: 'bot',
    ...options,
  })),
}));

describe('Chatbot Config', () => {
  describe('Initial Configuration', () => {
    it('should have correct bot name', () => {
      expect(config.botName).toBe('HuskyFlow Assistant');
    });

    it('should have initial messages matching Sprint 0 requirements', () => {
      expect(config.initialMessages).toBeDefined();
      expect(config.initialMessages.length).toBeGreaterThan(0);

      // Check welcome message matches Sprint 0 requirements
      const welcomeMessage = config.initialMessages[0];
      expect(welcomeMessage.message).toBe(
        "Hi! I'm your HuskyFlow assistant. I can help you navigate to different parts of the app. What would you like to do?",
      );
    });

    it('should include main menu in initial messages', () => {
      const menuMessage = config.initialMessages.find(
        (msg: { widget?: string }) => msg.widget === 'mainMenu',
      );
      expect(menuMessage).toBeDefined();
      expect(menuMessage?.message).toContain('Browse Questions');
      expect(menuMessage?.message).toContain('Ask a Question');
      expect(menuMessage?.message).toContain('Join Communities');
      expect(menuMessage?.message).toContain('Play Games');
      expect(menuMessage?.message).toContain('Send Messages');
      expect(menuMessage?.message).toContain('View Collections');
      expect(menuMessage?.message).toContain('Manage Profile');
      expect(menuMessage?.message).toContain('Help & Support');
    });
  });

  describe('Widgets Configuration', () => {
    it('should have all required widgets', () => {
      const widgetNames = config.widgets.map((w: { widgetName: string }) => w.widgetName);

      expect(widgetNames).toContain('mainMenu');
      expect(widgetNames).toContain('questionsMenu');
      expect(widgetNames).toContain('communitiesMenu');
      expect(widgetNames).toContain('gamesMenu');
      expect(widgetNames).toContain('messagingMenu');
      expect(widgetNames).toContain('collectionsMenu');
      expect(widgetNames).toContain('profileMenu');
      expect(widgetNames).toContain('questionSearch');
    });

    it('should have mainMenu widget configured', () => {
      const mainMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'mainMenu',
      );
      expect(mainMenuWidget).toBeDefined();
      expect(mainMenuWidget?.widgetFunc).toBeDefined();
      expect(mainMenuWidget?.mapStateToProps).toContain('currentFlow');
      expect(mainMenuWidget?.mapStateToProps).toContain('userContext');
    });

    it('should have questionsMenu widget configured', () => {
      const questionsMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'questionsMenu',
      );
      expect(questionsMenuWidget).toBeDefined();
      expect(questionsMenuWidget?.widgetFunc).toBeDefined();
      expect(questionsMenuWidget?.mapStateToProps).toContain('currentFlow');
    });

    it('should have communitiesMenu widget configured', () => {
      const communitiesMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'communitiesMenu',
      );
      expect(communitiesMenuWidget).toBeDefined();
      expect(communitiesMenuWidget?.widgetFunc).toBeDefined();
    });

    it('should have gamesMenu widget configured', () => {
      const gamesMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'gamesMenu',
      );
      expect(gamesMenuWidget).toBeDefined();
      expect(gamesMenuWidget?.widgetFunc).toBeDefined();
    });

    it('should have messagingMenu widget configured', () => {
      const messagingMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'messagingMenu',
      );
      expect(messagingMenuWidget).toBeDefined();
      expect(messagingMenuWidget?.widgetFunc).toBeDefined();
    });

    it('should have collectionsMenu widget configured', () => {
      const collectionsMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'collectionsMenu',
      );
      expect(collectionsMenuWidget).toBeDefined();
      expect(collectionsMenuWidget?.widgetFunc).toBeDefined();
    });

    it('should have profileMenu widget configured', () => {
      const profileMenuWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'profileMenu',
      );
      expect(profileMenuWidget).toBeDefined();
      expect(profileMenuWidget?.widgetFunc).toBeDefined();
    });

    it('should have questionSearch widget configured', () => {
      const questionSearchWidget = config.widgets.find(
        (w: { widgetName: string }) => w.widgetName === 'questionSearch',
      );
      expect(questionSearchWidget).toBeDefined();
      expect(questionSearchWidget?.widgetFunc).toBeDefined();
      expect(questionSearchWidget?.mapStateToProps).toContain('searchQuery');
    });
  });

  describe('State Configuration', () => {
    it('should have initial state with correct structure', () => {
      expect(config.state).toBeDefined();
      expect(config.state.currentFlow).toBeNull();
      expect(config.state.userContext).toBe('returning_user');
      expect(config.state.selectedFeature).toBeNull();
      expect(config.state.searchQuery).toBe('');
      expect(config.state.navigationTarget).toBeNull();
    });
  });

  describe('Custom Styles', () => {
    it('should have custom styles configured', () => {
      expect(config.customStyles).toBeDefined();
      expect(config.customStyles.botMessageBox).toBeDefined();
      expect(config.customStyles.chatButton).toBeDefined();
    });
  });
});
