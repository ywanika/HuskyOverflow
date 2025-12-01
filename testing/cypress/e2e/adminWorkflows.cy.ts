import { loginUser, setupTest, teardownTest } from '../support/helpers';

describe('Admin Workflows E2E Tests', () => {
  beforeEach(() => {
    setupTest();
    loginUser('ddd', 'ddd'); // Admin user
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Admin Dashboard Access', () => {
    it('should allow admin to access dashboard', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.url().should('include', '/admin/dashboard');
      
      // Should see metrics and user management tabs
      cy.contains(/metrics|users|management/i).should('be.visible');
    });

    it('should redirect non-admin users away from admin dashboard', () => {
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      
      // Try to access admin dashboard
      cy.visit('http://localhost:4530/admin/dashboard');
      
      // Should be redirected
      cy.url().should('not.include', '/admin/dashboard');
    });
  });

  describe('User Management', () => {
    it('should create a new user', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      const username = `newuser${Date.now()}`;
      
      // Fill create user form
      cy.contains(/create.*user|new user/i).click();
      cy.get('input[type="text"][name*="username"], input[id*="username"]').last().type(username);
      cy.get('input[type="password"][name*="password"], input[id*="password"]').last().type('password123');
      cy.get('input[type="password"][name*="confirm"], input[id*="confirm"]').last().type('password123');
      
      // Select role
      cy.get('input[type="radio"][value="user"]').check();
      
      cy.contains('button', /create/i).click();
      
      // Should see success message
      cy.contains(/created|success/i, { timeout: 3000 }).should('be.visible');
      
      // User should appear in list
      cy.contains(username).should('be.visible');
    });

    it('should create a moderator user', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      const username = `newmod${Date.now()}`;
      
      cy.contains(/create.*user|new user/i).click();
      cy.get('input[type="text"][name*="username"], input[id*="username"]').last().type(username);
      cy.get('input[type="password"][name*="password"], input[id*="password"]').last().type('password123');
      cy.get('input[type="password"][name*="confirm"], input[id*="confirm"]').last().type('password123');
      cy.get('input[type="radio"][value="moderator"]').check();
      
      cy.contains('button', /create/i).click();
      
      cy.contains(/created|success/i, { timeout: 3000 }).should('be.visible');
      cy.contains(username).should('be.visible');
    });

    it('should promote user to moderator', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Find a regular user
      cy.contains('dad').should('be.visible');
      
      // Click edit/promote button
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /promote|edit|role/i).click();
      });
      
      // Select moderator role
      cy.contains('button', /moderator|promote/i).click();
      
      // Should see success
      cy.contains(/promoted|updated/i, { timeout: 3000 }).should('be.visible');
    });

    it('should demote moderator to user', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Find moderator
      cy.contains('sss').should('be.visible');
      
      // Click demote button
      cy.contains('sss').parent().within(() => {
        cy.contains('button', /demote|user|role/i).click();
      });
      
      cy.contains(/demoted|updated/i, { timeout: 3000 }).should('be.visible');
    });

    it('should suspend a user temporarily', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Find user to suspend
      cy.contains('dad').should('be.visible');
      
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /suspend/i).click();
      });
      
      // Select suspension duration
      cy.get('select, [role="combobox"]').select('7 days');
      
      // Select violation reason
      cy.get('select, [role="combobox"]').eq(1).select('Spam');
      
      cy.contains('button', /confirm|suspend/i).click();
      
      cy.contains(/suspended|success/i, { timeout: 3000 }).should('be.visible');
    });

    it('should ban a user permanently', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      const testUsername = 'dad';
      cy.contains(testUsername).should('be.visible');
      
      cy.contains(testUsername).parent().within(() => {
        cy.contains('button', /ban/i).click();
      });
      
      // Enter ban reason (minimum 20 characters)
      const banReason = 'This is a permanent ban reason that exceeds twenty characters minimum requirement.';
      cy.get('textarea, input[type="text"]').last().type(banReason);
      
      cy.contains('button', /confirm|ban/i).click();
      
      cy.contains(/banned|success/i, { timeout: 3000 }).should('be.visible');
    });

    it('should require minimum 20 characters for ban reason', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /ban/i).click();
      });
      
      // Try with short reason
      cy.get('textarea, input[type="text"]').last().type('Too short');
      cy.contains('button', /confirm|ban/i).click();
      
      cy.contains(/20.*characters|minimum/i).should('be.visible');
    });

    it('should delete a user account', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Create a test user first
      const username = `deleteuser${Date.now()}`;
      cy.contains(/create.*user|new user/i).click();
      cy.get('input[type="text"][name*="username"], input[id*="username"]').last().type(username);
      cy.get('input[type="password"][name*="password"], input[id*="password"]').last().type('password123');
      cy.get('input[type="password"][name*="confirm"], input[id*="confirm"]').last().type('password123');
      cy.get('input[type="radio"][value="user"]').check();
      cy.contains('button', /create/i).click();
      cy.wait(1000);
      
      // Now delete the user
      cy.contains(username).parent().within(() => {
        cy.contains('button', /delete/i).click();
      });
      
      // Confirm deletion
      cy.contains('button', /confirm|yes/i).click();
      
      // User should be removed
      cy.contains(username).should('not.exist');
    });

    it('should edit user details', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /edit/i).click();
      });
      
      // Edit username or display name
      cy.get('input[type="text"]').last().clear().type('editeduser');
      cy.contains('button', /save|update/i).click();
      
      cy.contains(/updated|saved/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Dashboard Metrics', () => {
    it('should display platform metrics', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      // Should see various metrics
      cy.contains(/users|posts|questions|answers|flagged/i).should('be.visible');
    });

    it('should show total registered users count', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      cy.contains(/total.*users|registered.*users/i).should('be.visible');
      cy.get('[class*="metric"], [class*="count"]').should('exist');
    });

    it('should show posts per day', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      cy.contains(/posts.*day|per day/i).should('be.visible');
    });

    it('should show questions vs answers ratio', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      cy.contains(/questions.*answers|ratio/i).should('be.visible');
    });

    it('should show flagged content count', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      cy.contains(/flagged/i).should('be.visible');
    });

    it('should auto-refresh metrics', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/metrics/i).click();
      
      // Wait for refresh indicator
      cy.contains(/last updated|updated/i, { timeout: 65000 }).should('be.visible');
    });
  });

  describe('Audit Logs', () => {
    it('should display audit logs', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/audit.*log/i).click();
      
      // Should see log entries
      cy.contains(/timestamp|action|admin/i).should('be.visible');
    });

    it('should filter audit logs by date range', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/audit.*log/i).click();
      
      // Should have date filter options
      cy.get('input[type="date"], [type="date"]').should('exist');
    });

    it('should filter audit logs by admin name', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/audit.*log/i).click();
      
      // Should have admin filter
      cy.get('input[type="text"], select').should('exist');
    });
  });

  describe('System Announcements', () => {
    it('should create system-wide announcement', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/announcement/i).click();
      
      const announcementText = `Test announcement ${Date.now()}`;
      cy.get('textarea, input[type="text"]').last().type(announcementText);
      
      cy.contains('button', /send|post|create/i).click();
      
      cy.contains(/sent|created|success/i, { timeout: 3000 }).should('be.visible');
    });

    it('should send announcement to all users', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/announcement/i).click();
      
      const announcementText = `System announcement ${Date.now()}`;
      cy.get('textarea, input[type="text"]').last().type(announcementText);
      cy.contains('button', /send|post/i).click();
      cy.wait(2000);
      
      // Check as regular user
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/announcement|system/i).should('be.visible');
    });
  });

  describe('Role Change Notifications', () => {
    it('should notify user when promoted to moderator', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Promote user
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /promote|moderator/i).click();
      });
      cy.wait(2000);
      
      // Check notification as promoted user
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/moderator|promoted|role/i).should('be.visible');
    });

    it('should notify user when demoted from moderator', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Demote moderator
      cy.contains('sss').parent().within(() => {
        cy.contains('button', /demote|user/i).click();
      });
      cy.wait(2000);
      
      // Check notification
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/demoted|role.*changed/i).should('be.visible');
    });
  });
});

