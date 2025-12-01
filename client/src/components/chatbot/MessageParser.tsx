import React from 'react';
import { NAVIGATION_PATTERNS, actionPatterns, HELP_PATTERNS, knowledgeBase } from './knowledgeBase';
import type { ChatbotActions } from './types';

interface MessageParserProps {
  children: React.ReactNode;
  actions: ChatbotActions;
}

const MessageParser = ({ children, actions }: MessageParserProps) => {
  /**
   * Detects intent from user message
   */
  const detectIntent = (
    message: string,
  ): { intent: string; entity: string | null; query: string | null } => {
    const lowerMessage = message.toLowerCase().trim();

    // Check for help intent
    if (HELP_PATTERNS.some(pattern => lowerMessage.includes(pattern))) {
      return { intent: 'help', entity: null, query: null };
    }

    // Check for navigation intent
    const hasNavigationPattern = NAVIGATION_PATTERNS.some(pattern =>
      lowerMessage.includes(pattern),
    );

    // Check for action patterns
    const hasCreateAction = actionPatterns.create.some(pattern => lowerMessage.includes(pattern));
    const hasJoinAction = actionPatterns.join.some(pattern => lowerMessage.includes(pattern));
    const hasViewAction = actionPatterns.view.some(pattern => lowerMessage.includes(pattern));
    const hasSearchAction = actionPatterns.search.some(pattern => lowerMessage.includes(pattern));

    // Extract entity (feature) from keywords
    let detectedEntity: string | null = null;
    let searchQuery: string | null = null;

    // Check for feature keywords
    for (const [feature, data] of Object.entries(knowledgeBase.features)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedEntity = feature;
        break;
      }
    }

    // Extract search query if it's a search intent
    if (hasSearchAction && detectedEntity === 'questions') {
      // Try to extract search terms after "search", "find", etc.
      const searchPatterns = ['search', 'find', 'look for'];
      for (const pattern of searchPatterns) {
        const index = lowerMessage.indexOf(pattern);
        if (index !== -1) {
          const afterPattern = message.substring(index + pattern.length).trim();
          if (afterPattern.length > 0) {
            searchQuery = afterPattern;
            break;
          }
        }
      }
    }

    // Determine intent
    if (hasCreateAction && detectedEntity) {
      return { intent: 'create', entity: detectedEntity, query: null };
    }
    if (hasJoinAction && detectedEntity) {
      return { intent: 'join', entity: detectedEntity, query: null };
    }
    if (hasViewAction || hasNavigationPattern) {
      return { intent: 'navigate', entity: detectedEntity, query: searchQuery };
    }
    if (hasSearchAction) {
      return { intent: 'search', entity: detectedEntity, query: searchQuery };
    }
    if (detectedEntity) {
      return { intent: 'navigate', entity: detectedEntity, query: null };
    }

    return { intent: 'unknown', entity: null, query: null };
  };

  const parse = (message: string) => {
    const lowerMessage = message.toLowerCase().trim();

    // Handle empty messages
    if (!message || message.trim().length === 0) {
      actions.handleDefault?.();
      return;
    }

    // Greeting patterns
    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey') ||
      lowerMessage === 'welcome'
    ) {
      actions.handleHello?.();
      return;
    }

    // Main menu request
    if (
      lowerMessage.includes('menu') ||
      lowerMessage.includes('options') ||
      lowerMessage.includes('what can you do') ||
      lowerMessage.includes('what can i do')
    ) {
      actions.handleMainMenu?.();
      return;
    }

    // Detect intent and entity
    const { intent, entity, query } = detectIntent(message);

    // Handle help intent
    if (intent === 'help') {
      actions.handleHelp?.();
      return;
    }

    // Handle questions flow
    if (entity === 'questions') {
      if (intent === 'search' && query) {
        actions.handleSearchQuestions?.(query);
        return;
      }
      if (
        lowerMessage.includes('browse') ||
        lowerMessage.includes('view all') ||
        lowerMessage.includes('show all')
      ) {
        actions.handleBrowseQuestions?.();
        return;
      }
      if (lowerMessage.includes('tag') || lowerMessage.includes('search by tag')) {
        actions.handleSearchByTags?.();
        return;
      }
      if (lowerMessage.includes('unanswered') || lowerMessage.includes('no answer')) {
        actions.handleUnansweredQuestions?.();
        return;
      }
      if (
        lowerMessage.includes('ask') ||
        lowerMessage.includes('new question') ||
        lowerMessage.includes('post question')
      ) {
        actions.handleAskQuestion?.();
        return;
      }
      if (lowerMessage.includes('my question') || lowerMessage.includes('my questions')) {
        actions.handleMyQuestions?.();
        return;
      }
      // Default to questions flow
      actions.handleQuestionsFlow?.();
      return;
    }

    // Handle communities flow
    if (entity === 'communities') {
      if (
        lowerMessage.includes('create') ||
        lowerMessage.includes('new community') ||
        lowerMessage.includes('make')
      ) {
        actions.handleCreateCommunity?.();
        return;
      }
      if (
        lowerMessage.includes('browse') ||
        lowerMessage.includes('view all') ||
        lowerMessage.includes('show all')
      ) {
        actions.handleBrowseCommunities?.();
        return;
      }
      if (lowerMessage.includes('topic') || lowerMessage.includes('find')) {
        actions.handleFindCommunitiesByTopic?.();
        return;
      }
      if (lowerMessage.includes('my communit')) {
        actions.handleMyCommunities?.();
        return;
      }
      // Default to communities flow
      actions.handleCommunitiesFlow?.();
      return;
    }

    // Handle games flow
    if (entity === 'games') {
      if (
        lowerMessage.includes('nim') &&
        (lowerMessage.includes('learn') || lowerMessage.includes('what'))
      ) {
        actions.handleLearnNim?.();
        return;
      }
      if (
        lowerMessage.includes('create') ||
        lowerMessage.includes('new game') ||
        lowerMessage.includes('make')
      ) {
        actions.handleCreateGame?.();
        return;
      }
      if (lowerMessage.includes('join') || lowerMessage.includes('play')) {
        actions.handleJoinGame?.();
        return;
      }
      if (
        lowerMessage.includes('view') ||
        lowerMessage.includes('browse') ||
        lowerMessage.includes('show')
      ) {
        actions.handleViewGames?.();
        return;
      }
      // Default to games flow
      actions.handleGamesFlow?.();
      return;
    }

    // Handle messaging flow
    if (entity === 'messaging') {
      if (lowerMessage.includes('global')) {
        actions.handleGlobalMessages?.();
        return;
      }
      if (lowerMessage.includes('direct') || lowerMessage.includes('private')) {
        actions.handleDirectMessages?.();
        return;
      }
      if (lowerMessage.includes('new chat') || lowerMessage.includes('start chat')) {
        actions.handleStartNewChat?.();
        return;
      }
      if (lowerMessage.includes('history') || lowerMessage.includes('previous')) {
        actions.handleChatHistory?.();
        return;
      }
      // Default to messaging flow
      actions.handleMessagingFlow?.();
      return;
    }

    // Handle collections flow
    if (entity === 'collections') {
      if (
        lowerMessage.includes('create') ||
        lowerMessage.includes('new collection') ||
        lowerMessage.includes('make')
      ) {
        actions.handleCreateCollection?.();
        return;
      }
      if (lowerMessage.includes('my collection') || lowerMessage.includes('view my')) {
        actions.handleViewMyCollections?.();
        return;
      }
      if (lowerMessage.includes('public') || lowerMessage.includes('browse')) {
        actions.handleBrowsePublicCollections?.();
        return;
      }
      if (lowerMessage.includes('add') || lowerMessage.includes('save')) {
        actions.handleAddToCollection?.();
        return;
      }
      // Default to collections flow
      actions.handleCollectionsFlow?.();
      return;
    }

    // Handle profile flow
    if (entity === 'profile') {
      if (lowerMessage.includes('biography') || lowerMessage.includes('bio')) {
        actions.handleEditBiography?.();
        return;
      }
      if (lowerMessage.includes('password')) {
        actions.handleChangePassword?.();
        return;
      }
      if (lowerMessage.includes('activity')) {
        actions.handleViewActivity?.();
        return;
      }
      // Default to profile flow
      actions.handleProfileFlow?.();
      return;
    }

    // Fallback for unknown intents
    actions.handleDefault?.();
  };

  return (
    <div>
      {React.Children.map(children, child => {
        return React.cloneElement(child as React.ReactElement, {
          parse: parse,
          actions: actions,
        } as any);
      })}
    </div>
  );
};

export default MessageParser;
