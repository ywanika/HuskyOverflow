import express, { Request, Response, Router } from 'express';
import {
  UserRequest,
  User,
  UserCredentials,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  SignUpUserRequest,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
  suspendUser,
  banUser,
  promoteToModerator,
  promoteToAdmin,
  demoteToUser,
  checkUserSuspensionStatus,
} from '../services/user.service';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: SignUpUserRequest, res: Response): Promise<void> => {
    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      dateJoined: new Date(),
      biography: requestUser.biography ?? '',
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const loginCredentials: UserCredentials = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Login failed');
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  /**
   * Updates a user's community guidelines agreement status.
   * @param req The request containing the username and agreedToGuidelines in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateGuidelinesAgreement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, agreedToGuidelines } = req.body;

      if (typeof agreedToGuidelines !== 'boolean') {
        throw new Error('agreedToGuidelines must be a boolean value');
      }

      const updatedUser = await updateUser(username, { agreedToGuidelines });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating guidelines agreement: ${error}`);
    }
  };

  /**
   * Checks if a user has agreed to the community guidelines.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming agreement or returning an error.
   * @returns A promise resolving to void.
   */
  const checkGuidelinesAgreement = async (
    req: UserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      if (!user.agreedToGuidelines) {
        res.status(403).json({
          agreed: false,
          message:
            'You must agree to the community guidelines before posting. Please visit your profile settings to agree to the guidelines.',
        });
        return;
      }

      res.status(200).json({
        agreed: true,
        message: 'User has agreed to community guidelines.',
      });
    } catch (error) {
      res.status(500).send(`Error when checking guidelines agreement: ${error}`);
    }
  };

  /**
   * Suspends a user for a specific duration with a violation reason.
   * @param req The request containing username, durationDays, and reason in the body.
   * @param res The response, either confirming suspension or returning an error.
   * @returns A promise resolving to void.
   */
  const suspendUserRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, durationDays, reason, adminUsername } = req.body;

      if (!username || !durationDays || !reason || !adminUsername) {
        res
          .status(400)
          .send('Missing required fields: username, durationDays, reason, adminUsername');
        return;
      }

      // Verify the requesting user is an admin
      const adminUser = await getUserByUsername(adminUsername);
      if ('error' in adminUser || adminUser.role !== 'admin') {
        res.status(403).send('Only administrators can suspend users');
        return;
      }

      const result = await suspendUser(username, durationDays, reason);

      if ('error' in result) {
        throw Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'updated',
      });

      // Emit notification update for the suspended user
      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: result.username,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when suspending user: ${error}`);
    }
  };

  /**
   * Bans a user permanently with a mandatory reason.
   * @param req The request containing username and reason in the body.
   * @param res The response, either confirming ban or returning an error.
   * @returns A promise resolving to void.
   */
  const banUserRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, reason, adminUsername } = req.body;

      if (!username || !reason || !adminUsername) {
        res.status(400).send('Missing required fields: username, reason, adminUsername');
        return;
      }

      // Verify the requesting user is an admin
      const adminUser = await getUserByUsername(adminUsername);
      if ('error' in adminUser || adminUser.role !== 'admin') {
        res.status(403).send('Only administrators can ban users');
        return;
      }

      const result = await banUser(username, reason);

      if ('error' in result) {
        throw Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'updated',
      });

      // Emit notification update for the banned user
      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: result.username,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when banning user: ${error}`);
    }
  };

  /**
   * Promotes a user to moderator role.
   * @param req The request containing username in the body.
   * @param res The response, either confirming promotion or returning an error.
   * @returns A promise resolving to void.
   */
  const promoteToModeratorRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, adminUsername } = req.body;

      if (!username || !adminUsername) {
        res.status(400).send('Missing required fields: username, adminUsername');
        return;
      }

      // Verify the requesting user is an admin
      const adminUser = await getUserByUsername(adminUsername);
      if ('error' in adminUser || adminUser.role !== 'admin') {
        res.status(403).send('Only administrators can promote users to moderator');
        return;
      }

      const result = await promoteToModerator(username);

      if ('error' in result) {
        throw Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'updated',
      });

      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: result.username,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when promoting user to moderator: ${error}`);
    }
  };

  /**
   * Promotes a moderator to admin role.
   * @param req The request containing username in the body.
   * @param res The response, either confirming promotion or returning an error.
   * @returns A promise resolving to void.
   */
  const promoteToAdminRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, adminUsername } = req.body;

      if (!username || !adminUsername) {
        res.status(400).send('Missing required fields: username, adminUsername');
        return;
      }

      // Verify the requesting user is an admin
      const adminUser = await getUserByUsername(adminUsername);
      if ('error' in adminUser || adminUser.role !== 'admin') {
        res.status(403).send('Only administrators can promote moderators to admin');
        return;
      }

      //check if user is moderator
      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      if (user.role !== 'moderator') {
        res.status(400).send('User must be a moderator to be promoted to admin');
        return;
      }

      const result = await promoteToAdmin(username);

      if ('error' in result) {
        throw Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'updated',
      });

      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: result.username,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when promoting moderator to admin: ${error}`);
    }
  };

  /**
   * Demotes a user back to regular user role.
   * @param req The request containing username in the body.
   * @param res The response, either confirming demotion or returning an error.
   * @returns A promise resolving to void.
   */
  const demoteToUserRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, adminUsername } = req.body;

      if (!username || !adminUsername) {
        res.status(400).send('Missing required fields: username, adminUsername');
        return;
      }

      // Verify the requesting user is an admin
      const adminUser = await getUserByUsername(adminUsername);
      if ('error' in adminUser || adminUser.role !== 'admin') {
        res.status(403).send('Only administrators can demote users');
        return;
      }

      //check if user is moderator
      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      if (user.role !== 'moderator' && user.role !== 'admin') {
        res.status(400).send('User must be a moderator or admin to be demoted to user');
        return;
      }

      const result = await demoteToUser(username);

      if ('error' in result) {
        throw Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'updated',
      });

      socket.emit('notificationUpdate', {
        type: 'newNotification',
        username: result.username,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when demoting user: ${error}`);
    }
  };

  /**
   * Checks if a user is currently suspended or banned.
   * @param req The request containing the username as a route parameter.
   * @param res The response with suspension status information.
   * @returns A promise resolving to void.
   */
  const checkSuspensionStatusRoute = async (
    req: UserByUsernameRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { username } = req.params;

      const result = await checkUserSuspensionStatus(username);

      if ('error' in result) {
        throw Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when checking suspension status: ${error}`);
    }
  };

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.patch('/updateGuidelinesAgreement', updateGuidelinesAgreement);
  router.get('/checkGuidelines/:username', checkGuidelinesAgreement);
  router.post('/suspend', suspendUserRoute);
  router.post('/ban', banUserRoute);
  router.post('/promoteToModerator', promoteToModeratorRoute);
  router.post('/promoteToAdmin', promoteToAdminRoute);
  router.post('/demoteToUser', demoteToUserRoute);
  router.get('/suspensionStatus/:username', checkSuspensionStatusRoute);
  return router;
};

export default userController;
