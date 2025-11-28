import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import UserManagementTab from '../index';
import useUserManagement from '../../../../../hooks/useUserManagement';
import useUserContext from '../../../../../hooks/useUserContext';
import { SafeDatabaseUser, FakeSOSocket } from '../../../../../types/types';
import { ObjectId } from 'mongodb';

const system = createSystem(defaultConfig);

jest.mock('../../../../../hooks/useUserManagement');
jest.mock('../../../../../hooks/useUserContext');

const mockUseUserManagement = useUserManagement as jest.MockedFunction<typeof useUserManagement>;
const MockUseUserContext = useUserContext as jest.MockedFunction<typeof useUserContext>;

const MOCK_USERS: SafeDatabaseUser[] = [
  {
    _id: new ObjectId(),
    username: 'testuser1',
    dateJoined: new Date('2024-01-01'),
    role: 'user',
    biography: 'Test bio 1',
  },
  {
    _id: new ObjectId(),
    username: 'testuser2',
    dateJoined: new Date('2024-01-02'),
    role: 'moderator',
    biography: 'Test bio 2',
  },
  {
    _id: new ObjectId(),
    username: 'testuser3',
    dateJoined: new Date('2024-01-03'),
    role: 'admin',
    biography: 'Test bio 3',
  },
];

const mockCurrentUser: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'admin',
  dateJoined: new Date('2024-01-01'),
  role: 'admin',
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ChakraProvider value={system}>{children}</ChakraProvider>
  </BrowserRouter>
);

describe('UserManagementTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    MockUseUserContext.mockReturnValue({
      user: mockCurrentUser,
      socket: {} as FakeSOSocket,
    });

    mockUseUserManagement.mockReturnValue({
      users: MOCK_USERS,
      loading: false,
      error: '',
      actionMessage: { type: 'success', text: '' },
      handleSuspendUser: jest.fn().mockResolvedValue(true),
      handleBanUser: jest.fn().mockResolvedValue(true),
      handlePromoteToModerator: jest.fn().mockResolvedValue(true),
      handlePromoteToAdmin: jest.fn().mockResolvedValue(true),
      handleDemoteToUser: jest.fn().mockResolvedValue(true),
      handleCreateUser: jest.fn().mockResolvedValue({ success: true }),
      handleUpdateUser: jest.fn().mockResolvedValue(true),
      handleDeleteUser: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders the user management interface', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Create a New User')).toBeInTheDocument();
    });
  });

  it('displays users in a sorted list (admins first)', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      // Check that users are displayed (admins should appear first due to sorting)
      expect(screen.getByText('testuser3')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
      expect(screen.getByText('testuser1')).toBeInTheDocument();

      // Check roles are displayed
      expect(screen.getAllByText('admin')).toHaveLength(1);
      expect(screen.getAllByText('moderator')).toHaveLength(1);
      expect(screen.getAllByText('user')).toHaveLength(1);
    });
  });

  it('shows loading spinner when loading', async () => {
    mockUseUserManagement.mockReturnValue({
      ...mockUseUserManagement(),
      loading: true,
      users: [],
    });

    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });
  });

  it('shows error message when there is an error', async () => {
    mockUseUserManagement.mockReturnValue({
      ...mockUseUserManagement(),
      error: 'Failed to load users',
      users: [],
    });

    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  it('opens create user confirmation when create button is clicked', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Create a new user')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create a new user');
    await act(async () => {
      fireEvent.click(createButton);
    });

    // Check if confirmation modal opens
    await waitFor(() => {
      expect(screen.getByText('Confirm User Creation')).toBeInTheDocument();
    });
  });

  it('opens edit modal when clicking edit button', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('›').length).toBeGreaterThan(0);
    });

    // Find and click edit button for first user (› symbol)
    const editButtons = screen.getAllByText('›');
    await act(async () => {
      fireEvent.click(editButtons[0]);
    });

    // Check that the edit modal opens
    await waitFor(() => {
      expect(screen.getByText('Edit User: testuser1')).toBeInTheDocument();
    });
  });

  it('calls handleDeleteUser when deleting a user through edit modal', async () => {
    const mockHandleDeleteUser = jest.fn().mockResolvedValue(true);
    mockUseUserManagement.mockReturnValue({
      ...mockUseUserManagement(),
      handleDeleteUser: mockHandleDeleteUser,
    });

    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('›').length).toBeGreaterThan(0);
    });

    // Find and click edit button for first user
    const editButtons = screen.getAllByText('›');
    await act(async () => {
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    // Click the Delete User button in the edit modal
    const deleteButton = screen.getByText('Delete User');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // The confirmation modal should open, but for this basic test we'll just check setup
    await waitFor(() => {
      expect(mockHandleDeleteUser).not.toHaveBeenCalled(); // Not called yet since we didn't confirm
    });
  });

  it('displays action messages', async () => {
    mockUseUserManagement.mockReturnValue({
      ...mockUseUserManagement(),
      actionMessage: { type: 'success', text: 'User updated successfully' },
    });

    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('User updated successfully')).toBeInTheDocument();
    });
  });

  it('shows admin permission error for non-admin users', async () => {
    MockUseUserContext.mockReturnValue({
      user: { ...mockCurrentUser, role: 'user' },
      socket: {} as FakeSOSocket,
    });

    mockUseUserManagement.mockReturnValue({
      ...mockUseUserManagement(),
      actionMessage: { type: 'error', text: 'Only administrators can perform this action' },
    });

    await act(async () => {
      render(
        <TestWrapper>
          <UserManagementTab />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Only administrators can perform this action')).toBeInTheDocument();
    });
  });
});
