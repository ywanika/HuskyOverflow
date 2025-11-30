import { JSX, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import Login from './auth/login';
import { FakeSOSocket, SafeDatabaseUser } from '../types/types';
import LoginContext from '../contexts/LoginContext';
import UserContext from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import Signup from './auth/signup';
import UsersListPage from './main/usersListPage';
import ProfileSettings from './profileSettings';
import AllGamesPage from './main/games/allGamesPage';
import GamePage from './main/games/gamePage';
import AllCommunitiesPage from './main/communities/allCommunitiesPage';
import NewCommunityPage from './main/communities/newCommunityPage';
import CommunityPage from './main/communities/communityPage';
import AllCollectionsPage from './main/collections/allCollectionsPage';
import CollectionPage from './main/collections/collectionPage';
import NewCollectionPage from './main/collections/newCollectionPage';
import ModeratorDashboard from './main/moderatorDashboard';
import MainMessagePage from './main/mainMessagePage';
import CommunityGuidelines from './communityGuidelines';
import ChatbotPage from './chatbot/ChatbotPage';
import SuspendedPage from './suspendedPage';

const ProtectedRoute = ({
  user,
  socket,
  children,
}: {
  user: SafeDatabaseUser | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!user || !socket) {
    return <Navigate to='/' />;
  }

  return <UserContext.Provider value={{ user, socket }}>{children}</UserContext.Provider>;
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [user, setUser] = useState<SafeDatabaseUser | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for user updates (role changes, suspensions, etc.)
    const handleUserUpdate = (data: { user: SafeDatabaseUser }) => {
      // Only update if it's the current user
      if (data.user.username === user.username) {
        setUser(data.user);
      }
    };

    socket.on('userUpdate', handleUserUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('userUpdate', handleUserUpdate);
    };
  }, [socket, user]);

  return (
    <ThemeProvider>
      <LoginContext.Provider value={{ setUser }}>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/guidelines' element={<CommunityGuidelines />} />

          {/* Suspended Page - Special protected route */}
          <Route
            path='/suspended'
            element={
              <ProtectedRoute user={user} socket={socket}>
                <SuspendedPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          {
            <Route
              element={
                <ProtectedRoute user={user} socket={socket}>
                  <Layout />
                </ProtectedRoute>
              }>
              <Route path='/home' element={<QuestionPage />} />
              <Route path='tags' element={<TagPage />} />
              <Route path='/messaging' element={<MainMessagePage />} />
              <Route path='/question/:qid' element={<AnswerPage />} />
              <Route path='/new/question' element={<NewQuestionPage />} />
              <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
              <Route path='/users' element={<UsersListPage />} />
              <Route path='/user/:username' element={<ProfileSettings />} />
              <Route path='/new/collection' element={<NewCollectionPage />} />
              <Route path='/collections/:username' element={<AllCollectionsPage />} />
              <Route path='/collections/:username/:collectionId' element={<CollectionPage />} />
              <Route path='/games' element={<AllGamesPage />} />
              <Route path='/games/:gameID' element={<GamePage />} />
              <Route path='/communities' element={<AllCommunitiesPage />} />
              <Route path='/new/community' element={<NewCommunityPage />} />
              <Route path='/communities/:communityID' element={<CommunityPage />} />
              <Route path='/moderator/dashboard' element={<ModeratorDashboard />} />
              <Route path='/chatbot' element={<ChatbotPage />} />
            </Route>
          }
        </Routes>
      </LoginContext.Provider>
    </ThemeProvider>
  );
};

export default FakeStackOverflow;
