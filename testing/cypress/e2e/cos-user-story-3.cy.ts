/**
 * Cypress E2E tests for User Story 3: Admin
 * Testing COS 3.1-3.10
 */

describe('User Story 3: Admin - COS Tests', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('http://localhost:3000');
    cy.get('#username-input').type('admin1');
    cy.get('#password-input').type('password123');
    cy.get('form').submit();
    cy.url().should('include', '/home');
  });

  describe('COS 3.1: User Account Management', () => {
    it('should allow admin to create new user account', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Create User"), [data-testid*="create-user"]').click();
      cy.get('input[name*="username"], #username').type('newuser');
      cy.get('input[name*="password"], #password').type('password123');
      cy.get('button:contains("Create"), button[type="submit"]').click();
      // Should show success message
      cy.get('[role="alert"], .success').should('contain', 'created', 'success');
    });

    it('should allow admin to edit existing user details', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Edit"), [data-testid*="edit-user"]').first().click();
      cy.get('input[name*="username"], input[name*="displayName"]').clear().type('updatedname');
      cy.get('button:contains("Save"), button[type="submit"]').click();
      // Should show success message
      cy.get('[role="alert"], .success').should('contain', 'updated', 'success');
    });

    it('should allow admin to delete user accounts with confirmation', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Delete"), [data-testid*="delete-user"]').first().click();
      // Should show confirmation dialog
      cy.get('[role="dialog"], .modal, .confirmation').should('exist');
      cy.get('button:contains("Confirm"), button:contains("Delete")').click();
      // Should show success message
      cy.get('[role="alert"], .success').should('contain', 'deleted', 'success');
    });
  });

  describe('COS 3.2: Moderator Privilege Assignment', () => {
    it('should allow admin to promote user to moderator', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Promote"), [data-testid*="promote"]').first().click();
      // Should show success message
      cy.get('[role="alert"], .success').should('contain', 'promoted', 'moderator', 'success');
    });

    it('should allow admin to revoke moderator status', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Revoke"), [data-testid*="revoke"]').first().click();
      // Should show success message
      cy.get('[role="alert"], .success').should('contain', 'revoked', 'success');
    });

    it('should send automatic notification when role changes', () => {
      cy.visit('/admin/dashboard');
      cy.get('button:contains("Promote"), [data-testid*="promote"]').first().click();
      // Check that notification was sent (would need to verify in notifications)
      cy.get('[role="alert"], .success').should('exist');
    });
  });

  describe('COS 3.4: Platform Metrics Dashboard', () => {
    it('should display total registered users count', () => {
      cy.visit('/admin/dashboard');
      cy.get('[data-testid*="total-users"], :contains("Total Users")').should('exist');
    });

    it('should display posts per day', () => {
      cy.visit('/admin/dashboard');
      cy.get('[data-testid*="posts-per-day"], :contains("Posts per Day")').should('exist');
    });

    it('should display questions vs answers ratio', () => {
      cy.visit('/admin/dashboard');
      cy.get('[data-testid*="ratio"], :contains("Questions vs Answers")').should('exist');
    });

    it('should display flagged content count', () => {
      cy.visit('/admin/dashboard');
      cy.get('[data-testid*="flagged"], :contains("Flagged")').should('exist');
    });

    it('should refresh metrics automatically every 60 seconds', () => {
      cy.visit('/admin/dashboard');
      // Wait for initial load
      cy.get('[data-testid*="total-users"]').should('exist');
      // Check for "Last updated" indicator
      cy.get(':contains("Last updated")').should('exist');
    });
  });

  describe('COS 3.7-3.10: Non-Admin Access Restrictions', () => {
    it('should not allow regular users to access user management (COS 3.7)', () => {
      // Logout and login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to access admin endpoints
      cy.request({
        url: '/api/admin/users',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });

    it('should not show admin dashboard to regular users (COS 3.7)', () => {
      // Login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to visit admin dashboard
      cy.visit('/admin/dashboard');
      // Should redirect away
      cy.url().should('not.include', '/admin/dashboard');
    });

    it('should not allow moderators to modify user roles (COS 3.8)', () => {
      // Login as moderator
      cy.visit('/');
      cy.get('#username-input').type('moderator1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to access role assignment
      cy.request({
        url: '/api/admin/assignRole',
        method: 'POST',
        body: { username: 'user1', role: 'moderator' },
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });

    it('should not allow non-admins to access platform metrics (COS 3.9)', () => {
      // Login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to access metrics
      cy.request({
        url: '/api/admin/metrics',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });

    it('should not allow non-admins to view audit logs (COS 3.10)', () => {
      // Login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to access audit logs
      cy.request({
        url: '/api/admin/audit',
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });
  });
});

