import React from 'react';
import { createChatBotMessage } from 'react-chatbot-kit';
import MainMenuWidget from './widgets/MainMenuWidget';
import QuestionsMenuWidget from './widgets/QuestionsMenuWidget';
import CommunitiesMenuWidget from './widgets/CommunitiesMenuWidget';
import GamesMenuWidget from './widgets/GamesMenuWidget';
import MessagingMenuWidget from './widgets/MessagingMenuWidget';
import CollectionsMenuWidget from './widgets/CollectionsMenuWidget';
import ProfileMenuWidget from './widgets/ProfileMenuWidget';
import QuestionSearchWidget from './widgets/QuestionSearchWidget';
import type { BaseWidgetProps } from './types';

const BOT_NAME = 'HuskyFlow Assistant';

const config = {
  botName: BOT_NAME,
  initialMessages: [
    createChatBotMessage(
      "Hi! I'm your HuskyFlow assistant. I can help you navigate to different parts of the app. What would you like to do?",
      { delay: 500 },
    ),
    createChatBotMessage('Here are some things I can help you with:', { delay: 1000 }),
    createChatBotMessage(
      '• Browse Questions\n• Ask a Question\n• Join Communities\n• Play Games\n• Send Messages\n• View Collections\n• Manage Profile\n• Help & Support',
      {
        delay: 1500,
        widget: 'mainMenu',
      },
    ),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#3182ce',
    },
    chatButton: {
      backgroundColor: '#3182ce',
    },
  },
  state: {
    currentFlow: null as string | null,
    userContext: 'returning_user' as 'new_user' | 'returning_user',
    selectedFeature: null as string | null,
    searchQuery: '' as string,
    navigationTarget: null as string | null,
  },
  customComponents: {},
  widgets: [
    {
      widgetName: 'mainMenu',
      widgetFunc: (props: BaseWidgetProps) => <MainMenuWidget {...props} />,
      mapStateToProps: ['currentFlow', 'userContext'],
    },
    {
      widgetName: 'questionsMenu',
      widgetFunc: (props: BaseWidgetProps) => <QuestionsMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'communitiesMenu',
      widgetFunc: (props: BaseWidgetProps) => <CommunitiesMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'gamesMenu',
      widgetFunc: (props: BaseWidgetProps) => <GamesMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'messagingMenu',
      widgetFunc: (props: BaseWidgetProps) => <MessagingMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'collectionsMenu',
      widgetFunc: (props: BaseWidgetProps) => <CollectionsMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'profileMenu',
      widgetFunc: (props: BaseWidgetProps) => <ProfileMenuWidget {...props} />,
      mapStateToProps: ['currentFlow'],
    },
    {
      widgetName: 'questionSearch',
      widgetFunc: (
        props: BaseWidgetProps & { payload?: { searchQuery?: string; maxResults?: number } },
      ) => <QuestionSearchWidget {...props} />,
      mapStateToProps: ['searchQuery'],
    },
  ],
};

export default config;
