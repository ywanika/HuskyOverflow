import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import { SafeDatabaseUser, User } from '../../types/types';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
};

const mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
};

const mockAdminUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'admin1',
  dateJoined: new Date('2024-12-03'),
  role: 'admin',
};

const mockRegularUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'regularuser',
  dateJoined: new Date('2024-12-03'),
  role: 'user',
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const suspendUserSpy = jest.spyOn(util, 'suspendUser');
const banUserSpy = jest.spyOn(util, 'banUser');
const promoteToModeratorSpy = jest.spyOn(util, 'promoteToModerator');
const promoteToAdminSpy = jest.spyOn(util, 'promoteToAdmin');
const demoteToUserSpy = jest.spyOn(util, 'demoteToUser');
const checkUserSuspensionStatusSpy = jest.spyOn(util, 'checkUserSuspensionStatus');

describe('Test userController', () => {
  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
      };

      saveUserSpy.mockResolvedValueOnce({ ...mockSafeUser, biography: mockReqBody.biography });

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse, biography: mockReqBody.biography });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        dateJoined: expect.any(Date),
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/api/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({ error: 'Error authenticating user' });

      const response = await supertest(app).post('/api/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/password');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/api/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/api/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/api/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).get('/api/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/api/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/api/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/api/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error deleting user' });

      const response = await supertest(app).delete(`/api/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      // Express automatically returns 404 for missing parameters when
      // defined as required in the route
      const response = await supertest(app).delete('/api/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      // Mock a successful updateUser call
      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/api/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      // Ensure updateUser is called with the correct args
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/api/user/updateBiography').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/api/user/updateBiography').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/username');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/api/user/updateBiography').send(mockReqBody);

      const openApiError = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(openApiError.errors[0].path).toBe('/body/biography');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      // Simulate a DB error
      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/api/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('Admin User Management Operations', () => {
    describe('POST /suspend', () => {
      it('should suspend a user when admin makes the request', async () => {
        const mockReqBody = {
          username: 'targetuser',
          durationDays: 7,
          reason: 'Spam',
          adminUsername: 'admin1',
        };

        const suspendedUser = {
          ...mockRegularUser,
          username: 'targetuser',
          suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          suspensionReason: 'Spam',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockAdminUser);
        suspendUserSpy.mockResolvedValueOnce(suspendedUser);

        const response = await supertest(app).post('/api/user/suspend').send(mockReqBody);

        expect(response.status).toBe(200);
        expect(response.body.suspensionReason).toBe('Spam');
        expect(suspendUserSpy).toHaveBeenCalledWith('targetuser', 7, 'Spam');
      });

      it('should error when non-admin tries to suspend user', async () => {
        const mockReqBody = {
          username: 'targetuser',
          durationDays: 7,
          reason: 'Spam',
          adminUsername: 'regularuser',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app).post('/api/user/suspend').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });

      it('should error when missing required fields', async () => {
        const mockReqBody = {
          username: 'targetuser',
          durationDays: 7,
          // missing reason and adminUsername
        };

        const response = await supertest(app).post('/api/user/suspend').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });
    });

    describe('POST /ban', () => {
      it('should ban a user when admin makes the request with valid reason', async () => {
        const mockReqBody = {
          username: 'targetuser',
          reason: 'Hate Speech: This is a detailed reason with more than 20 characters',
          adminUsername: 'admin1',
        };

        const bannedUser = {
          ...mockRegularUser,
          username: 'targetuser',
          isBanned: true,
          banReason: mockReqBody.reason,
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockAdminUser);
        banUserSpy.mockResolvedValueOnce(bannedUser);

        const response = await supertest(app).post('/api/user/ban').send(mockReqBody);

        expect(response.status).toBe(200);
        expect(response.body.isBanned).toBe(true);
        expect(response.body.banReason).toContain('Hate Speech');
      });

      it('should error when non-admin tries to ban user', async () => {
        const mockReqBody = {
          username: 'targetuser',
          reason: 'Valid reason with enough characters to pass validation',
          adminUsername: 'regularuser',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app).post('/api/user/ban').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });
    });

    describe('POST /promoteToModerator', () => {
      it('should promote user to moderator when admin makes the request', async () => {
        const mockReqBody = {
          username: 'targetuser',
          adminUsername: 'admin1',
        };

        const promotedUser = {
          ...mockRegularUser,
          username: 'targetuser',
          role: 'moderator' as const,
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockAdminUser);
        promoteToModeratorSpy.mockResolvedValueOnce(promotedUser);

        const response = await supertest(app)
          .post('/api/user/promoteToModerator')
          .send(mockReqBody);

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('moderator');
      });

      it('should error when non-admin tries to promote user', async () => {
        const mockReqBody = {
          username: 'targetuser',
          adminUsername: 'regularuser',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app)
          .post('/api/user/promoteToModerator')
          .send(mockReqBody);

        expect(response.status).not.toBe(200);
      });
    });

    describe('POST /promoteToAdmin', () => {
      it('should promote moderator to admin when admin makes the request', async () => {
        const mockModeratorUser = {
          ...mockRegularUser,
          username: 'moderatoruser',
          role: 'moderator' as const,
        };

        const mockReqBody = {
          username: 'moderatoruser',
          adminUsername: 'admin1',
        };

        const promotedUser = {
          ...mockModeratorUser,
          role: 'admin' as const,
        };

        getUserByUsernameSpy
          .mockResolvedValueOnce(mockAdminUser)
          .mockResolvedValueOnce(mockModeratorUser);
        promoteToAdminSpy.mockResolvedValueOnce(promotedUser);

        const response = await supertest(app).post('/api/user/promoteToAdmin').send(mockReqBody);

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('admin');
      });

      it('should error when non-admin tries to promote moderator', async () => {
        const mockReqBody = {
          username: 'moderatoruser',
          adminUsername: 'regularuser',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app).post('/api/user/promoteToAdmin').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });

      it('should error when trying to promote regular user to admin', async () => {
        const mockReqBody = {
          username: 'regularuser',
          adminUsername: 'admin1',
        };

        getUserByUsernameSpy
          .mockResolvedValueOnce(mockAdminUser)
          .mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app).post('/api/user/promoteToAdmin').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });
    });

    describe('POST /demoteToUser', () => {
      it('should demote moderator to user when admin makes the request', async () => {
        const mockModeratorUser = {
          ...mockRegularUser,
          username: 'moderatoruser',
          role: 'moderator' as const,
        };

        const mockReqBody = {
          username: 'moderatoruser',
          adminUsername: 'admin1',
        };

        const demotedUser = {
          ...mockModeratorUser,
          role: 'user' as const,
        };

        getUserByUsernameSpy
          .mockResolvedValueOnce(mockAdminUser)
          .mockResolvedValueOnce(mockModeratorUser);
        demoteToUserSpy.mockResolvedValueOnce(demotedUser);

        const response = await supertest(app).post('/api/user/demoteToUser').send(mockReqBody);

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('user');
      });

      it('should error when non-admin tries to demote user', async () => {
        const mockReqBody = {
          username: 'moderatoruser',
          adminUsername: 'regularuser',
        };

        getUserByUsernameSpy.mockResolvedValueOnce(mockRegularUser);

        const response = await supertest(app).post('/api/user/demoteToUser').send(mockReqBody);

        expect(response.status).not.toBe(200);
      });
    });

    describe('GET /suspensionStatus/:username', () => {
      it('should return suspension status for a user', async () => {
        const suspensionStatus = {
          isSuspended: true,
          suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          suspensionReason: 'Spam',
          isBanned: false,
        };

        checkUserSuspensionStatusSpy.mockResolvedValueOnce(suspensionStatus);

        const response = await supertest(app).get('/api/user/suspensionStatus/targetuser');

        expect(response.status).toBe(200);
        expect(response.body.isSuspended).toBe(true);
        expect(response.body.suspensionReason).toBe('Spam');
      });

      it('should return banned status for a banned user', async () => {
        const suspensionStatus = {
          isSuspended: false,
          isBanned: true,
          banReason: 'Hate Speech: Permanent ban',
        };

        checkUserSuspensionStatusSpy.mockResolvedValueOnce(suspensionStatus);

        const response = await supertest(app).get('/api/user/suspensionStatus/banneduser');

        expect(response.status).toBe(200);
        expect(response.body.isBanned).toBe(true);
        expect(response.body.banReason).toContain('Hate Speech');
      });
    });
  });
});
