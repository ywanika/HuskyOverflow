/**
 * Knowledge base structure for the HuskyFlow chatbot
 * Contains feature descriptions, keywords, routes, and context-aware responses
 */

export interface FeatureKnowledge {
  description: string;
  actions: string[];
  routes: string[];
  keywords: string[];
}

export interface KnowledgeBase {
  features: {
    questions: FeatureKnowledge;
    communities: FeatureKnowledge;
    games: FeatureKnowledge;
    messaging: FeatureKnowledge;
    collections: FeatureKnowledge;
    profile: FeatureKnowledge;
  };
  contexts: {
    new_user: {
      greeting: string;
      suggestions: string[];
    };
    returning_user: {
      greeting: string;
      suggestions: string[];
    };
    feature_specific: {
      questions: string;
      communities: string;
      games: string;
      messaging: string;
      collections: string;
      profile: string;
    };
  };
}

export const knowledgeBase: KnowledgeBase = {
  features: {
    questions: {
      description: 'Ask and answer programming questions',
      actions: ['browse', 'ask', 'search', 'vote', 'comment'],
      routes: ['/home', '/new/question', '/question/:qid', '/tags'],
      keywords: ['question', 'ask', 'answer', 'programming', 'help', 'questions'],
    },
    communities: {
      description: 'Join topic-based communities',
      actions: ['browse', 'join', 'create', 'admin'],
      routes: ['/communities', '/new/community', '/communities/:communityID'],
      keywords: ['community', 'group', 'topic', 'join', 'create', 'communities'],
    },
    games: {
      description: 'Play multiplayer games like Nim',
      actions: ['play', 'create', 'join', 'spectate'],
      routes: ['/games', '/games/:gameID'],
      keywords: ['game', 'play', 'nim', 'multiplayer', 'fun', 'games'],
    },
    messaging: {
      description: 'Global and direct messaging system',
      actions: ['send', 'receive', 'chat', 'direct'],
      routes: ['/messaging', '/messaging/direct-message'],
      keywords: ['message', 'chat', 'direct', 'global', 'talk', 'messages'],
    },
    collections: {
      description: 'Save and organize questions',
      actions: ['create', 'save', 'organize', 'share'],
      routes: ['/collections/:username', '/new/collection', '/collections/:username/:collectionId'],
      keywords: ['collection', 'save', 'organize', 'bookmark', 'collections'],
    },
    profile: {
      description: 'Manage your profile and settings',
      actions: ['view', 'edit', 'update', 'manage'],
      routes: ['/user/:username'],
      keywords: ['profile', 'settings', 'account', 'biography', 'my account'],
    },
  },
  contexts: {
    new_user: {
      greeting: 'Welcome to HuskyFlow! Let me show you around.',
      suggestions: ['Browse questions', 'Join a community', 'Create your profile'],
    },
    returning_user: {
      greeting: 'Welcome back! What can I help you with today?',
      suggestions: ['Check new questions', 'View your communities', 'Play a game'],
    },
    feature_specific: {
      questions: 'I can help you find questions, ask new ones, or search by tags.',
      communities: "Let's explore communities or create your own!",
      games: 'Ready to play? We have Nim games available!',
      messaging: 'I can help you with global messages or direct chats.',
      collections: "Let's work with your collections!",
      profile: "Let's manage your profile!",
    },
  },
};

// Intent recognition patterns
export const NAVIGATION_PATTERNS = [
  'go to',
  'navigate to',
  'show me',
  'take me to',
  'i want to',
  'i need to',
  'help me with',
  'open',
  'view',
  'see',
];

export const actionPatterns = {
  create: ['create', 'make', 'start', 'new', 'add'],
  join: ['join', 'enter', 'participate', 'play'],
  view: ['view', 'see', 'browse', 'look at', 'show', 'display'],
  search: ['search', 'find', 'look for', 'seek'],
};

export const HELP_PATTERNS = [
  'help',
  'how to',
  'what is',
  'explain',
  'tutorial',
  'guide',
  'instructions',
  'can you',
  'tell me',
];
