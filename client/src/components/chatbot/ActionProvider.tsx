import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../hooks/useUserContext';

interface ActionProviderProps {
  createChatBotMessage: typeof createChatBotMessage;
  setState: (updater: (prev: any) => any) => void;
  children: React.ReactNode;
}

const ActionProvider = ({ createChatBotMessage, setState, children }: ActionProviderProps) => {
  const navigate = useNavigate();
  let user: { username: string } | null = null;
  try {
    user = useUserContext().user;
  } catch {
    // User context not available, continue without user
  }

  // Welcome and Main Menu
  const handleWelcome = () => {
    const botMessage = createChatBotMessage(
      "Hi! I'm your HuskyFlow assistant. I can help you navigate to different parts of the app. What would you like to do?",
      { delay: 500 },
    );
    const menuMessage = createChatBotMessage(
      "• Browse Questions\n• Ask a Question\n• Join Communities\n• Play Games\n• Send Messages\n• View Collections\n• Manage Profile\n• Help & Support",
      {
        delay: 1000,
        widget: 'mainMenu',
      },
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage, menuMessage],
      currentFlow: null,
    }));
  };

  const handleMainMenu = () => {
    const botMessage = createChatBotMessage('Here are the main options:', {
      delay: 500,
      widget: 'mainMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: null,
    }));
  };

  // Questions Flow
  const handleQuestionsFlow = () => {
    const botMessage = createChatBotMessage("I can help you with questions! What would you like to do?", {
      delay: 500,
      widget: 'questionsMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'questions',
    }));
  };

  const handleBrowseQuestions = () => {
    const botMessage = createChatBotMessage('Taking you to browse all questions...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/home'), 600);
  };

  const handleSearchByTags = () => {
    const botMessage = createChatBotMessage('Taking you to search questions by tags...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/tags'), 600);
  };

  const handleUnansweredQuestions = () => {
    const botMessage = createChatBotMessage('Finding unanswered questions for you...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/home?filter=unanswered'), 600);
  };

  const handleAskQuestion = () => {
    const botMessage = createChatBotMessage('Taking you to ask a new question...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/new/question'), 600);
  };

  const handleMyQuestions = () => {
    const botMessage = createChatBotMessage('Finding your questions...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    // Navigate to home page - user can filter their questions there
    setTimeout(() => navigate('/home'), 600);
  };

  // Communities Flow
  const handleCommunitiesFlow = () => {
    const botMessage = createChatBotMessage("Let's explore communities! What interests you?", {
      delay: 500,
      widget: 'communitiesMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'communities',
    }));
  };

  const handleBrowseCommunities = () => {
    const botMessage = createChatBotMessage('Taking you to browse all communities...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/communities'), 600);
  };

  const handleCreateCommunity = () => {
    const botMessage = createChatBotMessage('Taking you to create a new community...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/new/community'), 600);
  };

  const handleFindCommunitiesByTopic = () => {
    const botMessage = createChatBotMessage('Let me help you find communities by topic...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/communities'), 600);
  };

  const handleMyCommunities = () => {
    const botMessage = createChatBotMessage('Finding your communities...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    // Navigate to communities page - user can see their communities there
    setTimeout(() => navigate('/communities'), 600);
  };

  // Games Flow
  const handleGamesFlow = () => {
    const botMessage = createChatBotMessage('Ready to play? We have games available!', {
      delay: 500,
      widget: 'gamesMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'games',
    }));
  };

  const handleViewGames = () => {
    const botMessage = createChatBotMessage('Taking you to view available games...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/games'), 600);
  };

  const handleCreateGame = () => {
    const botMessage = createChatBotMessage('Taking you to create a new game...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/games'), 600);
  };

  const handleJoinGame = () => {
    const botMessage = createChatBotMessage('Taking you to join a game...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/games'), 600);
  };

  const handleLearnNim = () => {
    const botMessage = createChatBotMessage(
      'Nim is a mathematical game of strategy. Players take turns removing objects from distinct heaps. The player who takes the last object wins!',
      { delay: 500 },
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  // Messaging Flow
  const handleMessagingFlow = () => {
    const botMessage = createChatBotMessage("I can help you with messaging!", {
      delay: 500,
      widget: 'messagingMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'messaging',
    }));
  };

  const handleGlobalMessages = () => {
    const botMessage = createChatBotMessage('Taking you to global messages...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/messaging'), 600);
  };

  const handleDirectMessages = () => {
    const botMessage = createChatBotMessage('Taking you to direct messages...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/messaging/direct-message'), 600);
  };

  const handleStartNewChat = () => {
    const botMessage = createChatBotMessage('Taking you to start a new chat...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/messaging'), 600);
  };

  const handleChatHistory = () => {
    const botMessage = createChatBotMessage('Taking you to view chat history...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/messaging'), 600);
  };

  // Collections Flow
  const handleCollectionsFlow = () => {
    const botMessage = createChatBotMessage("Let's work with your collections!", {
      delay: 500,
      widget: 'collectionsMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'collections',
    }));
  };

  const handleViewMyCollections = () => {
    const botMessage = createChatBotMessage('Taking you to view your collections...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    if (user) {
      setTimeout(() => navigate(`/collections/${user.username}`), 600);
    }
  };

  const handleCreateCollection = () => {
    const botMessage = createChatBotMessage('Taking you to create a new collection...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    setTimeout(() => navigate('/new/collection'), 600);
  };

  const handleBrowsePublicCollections = () => {
    const botMessage = createChatBotMessage('Finding public collections...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  const handleAddToCollection = () => {
    const botMessage = createChatBotMessage('To add questions to a collection, navigate to a question and use the save button.', {
      delay: 500,
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  // Profile Flow
  const handleProfileFlow = () => {
    const botMessage = createChatBotMessage("Let's manage your profile!", {
      delay: 500,
      widget: 'profileMenu',
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      currentFlow: 'profile',
    }));
  };

  const handleViewProfile = () => {
    const botMessage = createChatBotMessage('Taking you to view your profile...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    if (user) {
      setTimeout(() => navigate(`/user/${user.username}`), 600);
    }
  };

  const handleEditBiography = () => {
    const botMessage = createChatBotMessage('Taking you to edit your biography...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    if (user) {
      setTimeout(() => navigate(`/user/${user.username}`), 600);
    }
  };

  const handleChangePassword = () => {
    const botMessage = createChatBotMessage('Taking you to change your password...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    if (user) {
      setTimeout(() => navigate(`/user/${user.username}`), 600);
    }
  };

  const handleViewActivity = () => {
    const botMessage = createChatBotMessage('Taking you to view your activity...', { delay: 500 });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
    if (user) {
      setTimeout(() => navigate(`/user/${user.username}`), 600);
    }
  };

  // Help & Support
  const handleHelp = () => {
    const botMessage = createChatBotMessage(
      "I can help you with:\n• Navigating the app\n• Finding questions\n• Joining communities\n• Playing games\n• Using messaging\n• Managing collections\n• Profile settings\n\nWhat would you like help with?",
      { delay: 500 },
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  // Legacy handlers for backward compatibility
  const handleHello = () => {
    handleWelcome();
  };

  const handleDefault = () => {
    const botMessage = createChatBotMessage(
      "I'm not sure how to help with that. Try asking for 'help' or use the menu options to see what I can assist you with!",
      { delay: 500 },
    );

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  // Search questions handler
  const handleSearchQuestions = (searchQuery: string) => {
    const botMessage = createChatBotMessage(`Searching for questions about "${searchQuery}"...`, {
      delay: 500,
      widget: 'questionSearch',
      payload: { searchQuery, maxResults: 5 },
    });

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      searchQuery,
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          actions: {
            // Welcome & Main Menu
            handleWelcome,
            handleMainMenu,
            handleHello,
            // Questions Flow
            handleQuestionsFlow,
            handleBrowseQuestions,
            handleSearchByTags,
            handleUnansweredQuestions,
            handleAskQuestion,
            handleMyQuestions,
            handleSearchQuestions,
            // Communities Flow
            handleCommunitiesFlow,
            handleBrowseCommunities,
            handleCreateCommunity,
            handleFindCommunitiesByTopic,
            handleMyCommunities,
            // Games Flow
            handleGamesFlow,
            handleViewGames,
            handleCreateGame,
            handleJoinGame,
            handleLearnNim,
            // Messaging Flow
            handleMessagingFlow,
            handleGlobalMessages,
            handleDirectMessages,
            handleStartNewChat,
            handleChatHistory,
            // Collections Flow
            handleCollectionsFlow,
            handleViewMyCollections,
            handleCreateCollection,
            handleBrowsePublicCollections,
            handleAddToCollection,
            // Profile Flow
            handleProfileFlow,
            handleViewProfile,
            handleEditBiography,
            handleChangePassword,
            handleViewActivity,
            // Help & Support
            handleHelp,
            handleDefault,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;

