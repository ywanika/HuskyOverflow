import { knowledgeBase, navigationPatterns, actionPatterns, helpPatterns } from '../knowledgeBase';

describe('Knowledge Base', () => {
  describe('Structure', () => {
    it('should have all required features', () => {
      expect(knowledgeBase.features).toHaveProperty('questions');
      expect(knowledgeBase.features).toHaveProperty('communities');
      expect(knowledgeBase.features).toHaveProperty('games');
      expect(knowledgeBase.features).toHaveProperty('messaging');
      expect(knowledgeBase.features).toHaveProperty('collections');
      expect(knowledgeBase.features).toHaveProperty('profile');
    });

    it('should have all required contexts', () => {
      expect(knowledgeBase.contexts).toHaveProperty('new_user');
      expect(knowledgeBase.contexts).toHaveProperty('returning_user');
      expect(knowledgeBase.contexts).toHaveProperty('feature_specific');
    });

    it('should have feature_specific context for all features', () => {
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('questions');
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('communities');
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('games');
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('messaging');
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('collections');
      expect(knowledgeBase.contexts.feature_specific).toHaveProperty('profile');
    });
  });

  describe('Questions Feature', () => {
    const questions = knowledgeBase.features.questions;

    it('should have correct description', () => {
      expect(questions.description).toBe('Ask and answer programming questions');
    });

    it('should have required actions', () => {
      expect(questions.actions).toContain('browse');
      expect(questions.actions).toContain('ask');
      expect(questions.actions).toContain('search');
      expect(questions.actions).toContain('vote');
      expect(questions.actions).toContain('comment');
    });

    it('should have correct routes', () => {
      expect(questions.routes).toContain('/home');
      expect(questions.routes).toContain('/new/question');
      expect(questions.routes).toContain('/question/:qid');
      expect(questions.routes).toContain('/tags');
    });

    it('should have relevant keywords', () => {
      expect(questions.keywords).toContain('question');
      expect(questions.keywords).toContain('ask');
      expect(questions.keywords).toContain('answer');
      expect(questions.keywords).toContain('programming');
      expect(questions.keywords).toContain('help');
    });
  });

  describe('Communities Feature', () => {
    const communities = knowledgeBase.features.communities;

    it('should have correct description', () => {
      expect(communities.description).toBe('Join topic-based communities');
    });

    it('should have required actions', () => {
      expect(communities.actions).toContain('browse');
      expect(communities.actions).toContain('join');
      expect(communities.actions).toContain('create');
      expect(communities.actions).toContain('admin');
    });

    it('should have correct routes', () => {
      expect(communities.routes).toContain('/communities');
      expect(communities.routes).toContain('/new/community');
      expect(communities.routes).toContain('/communities/:communityID');
    });

    it('should have relevant keywords', () => {
      expect(communities.keywords).toContain('community');
      expect(communities.keywords).toContain('group');
      expect(communities.keywords).toContain('topic');
      expect(communities.keywords).toContain('join');
      expect(communities.keywords).toContain('create');
    });
  });

  describe('Games Feature', () => {
    const games = knowledgeBase.features.games;

    it('should have correct description', () => {
      expect(games.description).toBe('Play multiplayer games like Nim');
    });

    it('should have required actions', () => {
      expect(games.actions).toContain('play');
      expect(games.actions).toContain('create');
      expect(games.actions).toContain('join');
      expect(games.actions).toContain('spectate');
    });

    it('should have correct routes', () => {
      expect(games.routes).toContain('/games');
      expect(games.routes).toContain('/games/:gameID');
    });

    it('should have relevant keywords', () => {
      expect(games.keywords).toContain('game');
      expect(games.keywords).toContain('play');
      expect(games.keywords).toContain('nim');
      expect(games.keywords).toContain('multiplayer');
      expect(games.keywords).toContain('fun');
    });
  });

  describe('Messaging Feature', () => {
    const messaging = knowledgeBase.features.messaging;

    it('should have correct description', () => {
      expect(messaging.description).toBe('Global and direct messaging system');
    });

    it('should have required actions', () => {
      expect(messaging.actions).toContain('send');
      expect(messaging.actions).toContain('receive');
      expect(messaging.actions).toContain('chat');
      expect(messaging.actions).toContain('direct');
    });

    it('should have correct routes', () => {
      expect(messaging.routes).toContain('/messaging');
      expect(messaging.routes).toContain('/messaging/direct-message');
    });

    it('should have relevant keywords', () => {
      expect(messaging.keywords).toContain('message');
      expect(messaging.keywords).toContain('chat');
      expect(messaging.keywords).toContain('direct');
      expect(messaging.keywords).toContain('global');
      expect(messaging.keywords).toContain('talk');
    });
  });

  describe('Collections Feature', () => {
    const collections = knowledgeBase.features.collections;

    it('should have correct description', () => {
      expect(collections.description).toBe('Save and organize questions');
    });

    it('should have required actions', () => {
      expect(collections.actions).toContain('create');
      expect(collections.actions).toContain('save');
      expect(collections.actions).toContain('organize');
      expect(collections.actions).toContain('share');
    });

    it('should have correct routes', () => {
      expect(collections.routes).toContain('/collections/:username');
      expect(collections.routes).toContain('/new/collection');
      expect(collections.routes).toContain('/collections/:username/:collectionId');
    });

    it('should have relevant keywords', () => {
      expect(collections.keywords).toContain('collection');
      expect(collections.keywords).toContain('save');
      expect(collections.keywords).toContain('organize');
      expect(collections.keywords).toContain('bookmark');
    });
  });

  describe('Profile Feature', () => {
    const profile = knowledgeBase.features.profile;

    it('should have correct description', () => {
      expect(profile.description).toBe('Manage your profile and settings');
    });

    it('should have required actions', () => {
      expect(profile.actions).toContain('view');
      expect(profile.actions).toContain('edit');
      expect(profile.actions).toContain('update');
      expect(profile.actions).toContain('manage');
    });

    it('should have correct routes', () => {
      expect(profile.routes).toContain('/user/:username');
    });

    it('should have relevant keywords', () => {
      expect(profile.keywords).toContain('profile');
      expect(profile.keywords).toContain('settings');
      expect(profile.keywords).toContain('account');
      expect(profile.keywords).toContain('biography');
      expect(profile.keywords).toContain('my account');
    });
  });

  describe('Context-Aware Responses', () => {
    it('should have new_user greeting matching Sprint 0 requirements', () => {
      expect(knowledgeBase.contexts.new_user.greeting).toBe('Welcome to HuskyFlow! Let me show you around.');
    });

    it('should have new_user suggestions', () => {
      expect(knowledgeBase.contexts.new_user.suggestions).toContain('Browse questions');
      expect(knowledgeBase.contexts.new_user.suggestions).toContain('Join a community');
      expect(knowledgeBase.contexts.new_user.suggestions).toContain('Create your profile');
    });

    it('should have returning_user greeting matching Sprint 0 requirements', () => {
      expect(knowledgeBase.contexts.returning_user.greeting).toBe('Welcome back! What can I help you with today?');
    });

    it('should have returning_user suggestions', () => {
      expect(knowledgeBase.contexts.returning_user.suggestions).toContain('Check new questions');
      expect(knowledgeBase.contexts.returning_user.suggestions).toContain('View your communities');
      expect(knowledgeBase.contexts.returning_user.suggestions).toContain('Play a game');
    });

    it('should have feature-specific responses matching Sprint 0 requirements', () => {
      expect(knowledgeBase.contexts.feature_specific.questions).toBe(
        "I can help you find questions, ask new ones, or search by tags."
      );
      expect(knowledgeBase.contexts.feature_specific.communities).toBe(
        "Let's explore communities or create your own!"
      );
      expect(knowledgeBase.contexts.feature_specific.games).toBe(
        "Ready to play? We have Nim games available!"
      );
      expect(knowledgeBase.contexts.feature_specific.messaging).toBe(
        "I can help you with global messages or direct chats."
      );
      expect(knowledgeBase.contexts.feature_specific.collections).toBe(
        "Let's work with your collections!"
      );
      expect(knowledgeBase.contexts.feature_specific.profile).toBe(
        "Let's manage your profile!"
      );
    });
  });

  describe('Intent Recognition Patterns', () => {
    it('should have navigation patterns matching Sprint 0 requirements', () => {
      expect(navigationPatterns).toContain('go to');
      expect(navigationPatterns).toContain('navigate to');
      expect(navigationPatterns).toContain('show me');
      expect(navigationPatterns).toContain('take me to');
      expect(navigationPatterns).toContain('i want to');
      expect(navigationPatterns).toContain('i need to');
      expect(navigationPatterns).toContain('help me with');
    });

    it('should have create action patterns', () => {
      expect(actionPatterns.create).toContain('create');
      expect(actionPatterns.create).toContain('make');
      expect(actionPatterns.create).toContain('start');
      expect(actionPatterns.create).toContain('new');
    });

    it('should have join action patterns', () => {
      expect(actionPatterns.join).toContain('join');
      expect(actionPatterns.join).toContain('enter');
      expect(actionPatterns.join).toContain('participate');
      expect(actionPatterns.join).toContain('play');
    });

    it('should have view action patterns', () => {
      expect(actionPatterns.view).toContain('view');
      expect(actionPatterns.view).toContain('see');
      expect(actionPatterns.view).toContain('browse');
      expect(actionPatterns.view).toContain('look at');
    });

    it('should have search action patterns', () => {
      expect(actionPatterns.search).toContain('search');
      expect(actionPatterns.search).toContain('find');
      expect(actionPatterns.search).toContain('look for');
    });

    it('should have help patterns matching Sprint 0 requirements', () => {
      expect(helpPatterns).toContain('help');
      expect(helpPatterns).toContain('how to');
      expect(helpPatterns).toContain('what is');
      expect(helpPatterns).toContain('explain');
      expect(helpPatterns).toContain('tutorial');
      expect(helpPatterns).toContain('guide');
      expect(helpPatterns).toContain('instructions');
    });
  });
});

