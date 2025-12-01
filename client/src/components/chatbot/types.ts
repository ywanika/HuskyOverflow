// Type definitions for chatbot components

export interface ChatbotActions {
  handleWelcome?: () => void;
  handleMainMenu?: () => void;
  handleHello?: () => void;
  handleQuestionsFlow?: () => void;
  handleBrowseQuestions?: () => void;
  handleSearchByTags?: () => void;
  handleUnansweredQuestions?: () => void;
  handleAskQuestion?: () => void;
  handleMyQuestions?: () => void;
  handleSearchQuestions?: (query: string) => void;
  handleCommunitiesFlow?: () => void;
  handleBrowseCommunities?: () => void;
  handleCreateCommunity?: () => void;
  handleFindCommunitiesByTopic?: () => void;
  handleMyCommunities?: () => void;
  handleGamesFlow?: () => void;
  handleViewGames?: () => void;
  handleCreateGame?: () => void;
  handleJoinGame?: () => void;
  handleLearnNim?: () => void;
  handleMessagingFlow?: () => void;
  handleGlobalMessages?: () => void;
  handleDirectMessages?: () => void;
  handleStartNewChat?: () => void;
  handleChatHistory?: () => void;
  handleCollectionsFlow?: () => void;
  handleViewMyCollections?: () => void;
  handleCreateCollection?: () => void;
  handleBrowsePublicCollections?: () => void;
  handleAddToCollection?: () => void;
  handleProfileFlow?: () => void;
  handleViewProfile?: () => void;
  handleEditBiography?: () => void;
  handleChangePassword?: () => void;
  handleViewActivity?: () => void;
  handleHelp?: () => void;
  handleDefault?: () => void;
  [key: string]: ((...args: any[]) => void) | undefined;
}

export interface ChatbotMessage {
  message: string;
  type: 'user' | 'bot';
  widget?: string;
  payload?: unknown;
}

export interface ChatbotState {
  messages: ChatbotMessage[];
  currentFlow: string | null;
  userContext: string;
  selectedFeature: string | null;
  searchQuery: string;
  navigationTarget: string | null;
}

export type SetStateFunction = (updater: (prev: ChatbotState) => ChatbotState) => void;

export interface WidgetProps {
  state: ChatbotState;
  actions: ChatbotActions;
}

export interface BaseWidgetProps {
  actionProvider?: { actions: ChatbotActions };
  setState?: SetStateFunction;
  scrollIntoView?: () => void;
  state?: ChatbotState;
}
