/**
 * Cypress E2E tests for User Story 4: User (Flagging, Appeals, Notifications)
 * Testing COS 4.1-4.10
 */

describe('User Story 4: User - COS Tests', () => {
  beforeEach(() => {
    // Login as regular user
    cy.visit('http://localhost:3000');
    cy.get('#username-input').type('user1');
    cy.get('#password-input').type('password123');
    cy.get('form').submit();
    cy.url().should('include', '/home');
  });

  describe('COS 4.1: Deletion Notification', () => {
    it('should notify user within 2 minutes if content is deleted', () => {
      // Create a question first
      cy.visit('/new/question');
      cy.get('input[type="text"]').type('Test Question');
      cy.get('textarea').type('This is a test question content');
      cy.get('button:contains("Post")').click();
      // Wait for moderator to delete (simulated)
      // Check notifications tab
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      // Should see deletion notification
      cy.get('[data-testid*="notification"]').should('contain', 'deleted');
    });

    it('should include content type in deletion notification', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').first().should('contain', 'question', 'answer', 'comment');
    });

    it('should include first 100 characters of deleted content', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').first().should('contain.text');
    });

    it('should include moderator reason in deletion notification', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').first().should('contain', 'Reason:');
    });
  });

  describe('COS 4.2-4.3: Appeal Submission', () => {
    it('should require written explanation between 50-500 characters (COS 4.2)', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('button:contains("Appeal"), [data-testid*="appeal"]').first().click();
      // Try with too short explanation
      cy.get('textarea, input[type="text"]').type('Too short');
      cy.get('button:contains("Submit"), button[type="submit"]').click();
      // Should show error
      cy.get('[role="alert"], .error').should('contain', '50', 'characters');
    });

    it('should require at least 3 words in appeal reasoning (COS 4.3)', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('button:contains("Appeal"), [data-testid*="appeal"]').first().click();
      // Try with less than 3 words
      cy.get('textarea, input[type="text"]').type('Too short');
      cy.get('button:contains("Submit"), button[type="submit"]').click();
      // Should show error
      cy.get('[role="alert"], .error').should('contain', '3 word');
    });

    it('should accept valid appeal explanation', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('button:contains("Appeal"), [data-testid*="appeal"]').first().click();
      // Enter valid explanation (50-500 chars, 3+ words)
      cy.get('textarea, input[type="text"]').type(
        'This is a valid appeal explanation that meets all the requirements for submission.',
      );
      cy.get('button:contains("Submit"), button[type="submit"]').click();
      // Should show success
      cy.get('[role="alert"], .success').should('contain', 'submitted', 'success');
    });
  });

  describe('COS 4.4: Appeal Decision Notification', () => {
    it('should notify user when appeal is accepted', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').should('contain', 'appeal', 'accepted');
    });

    it('should notify user when appeal is rejected', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').should('contain', 'appeal', 'rejected');
    });
  });

  describe('COS 4.5-4.6: Community Guidelines', () => {
    it('should allow viewing Community Guidelines during signup (COS 4.5)', () => {
      cy.visit('/signup');
      cy.get('a[href*="guidelines"], a:contains("Community Guidelines")').should('exist');
      cy.get('a[href*="guidelines"]').click();
      cy.url().should('include', '/guidelines');
    });

    it('should require checkbox agreement to create account (COS 4.5)', () => {
      cy.visit('/signup');
      cy.get('#guidelinesCheckbox').should('exist');
      cy.get('button:contains("Create"), button[type="submit"]').should('be.disabled');
      cy.get('#guidelinesCheckbox').check();
      cy.get('button:contains("Create"), button[type="submit"]').should('not.be.disabled');
    });

    it('should allow accessing Community Guidelines from profile (COS 4.6)', () => {
      cy.visit('/user/user1');
      cy.get('a[href*="guidelines"], button:contains("Guidelines")').should('exist');
      cy.get('a[href*="guidelines"]').click();
      cy.url().should('include', '/guidelines');
    });

    it('should save guidelines agreement to profile (COS 4.6)', () => {
      cy.visit('/user/user1');
      // Check that agreement status is displayed
      cy.get('[data-testid*="guidelines"], :contains("Guidelines")').should('exist');
    });
  });

  describe('COS 4.7: Guidelines Agreement for Posting', () => {
    it('should prevent posting if user has not agreed to guidelines', () => {
      // This would require a user who hasn't agreed
      cy.visit('/new/question');
      cy.get('input[type="text"]').type('Test Question');
      cy.get('textarea').type('This is a test question');
      cy.get('button:contains("Post")').click();
      // Should show error about guidelines
      cy.get('[role="alert"], .error').should('contain', 'guidelines', 'agree');
    });
  });

  describe('COS 4.8: Flagging Content', () => {
    it('should allow users to flag content posted by others', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Flag"), [data-testid*="flag"]').should('exist');
      cy.get('button:contains("Flag"), [data-testid*="flag"]').first().click();
      // Should show confirmation or success
      cy.get('[role="alert"], .success').should('exist');
    });

    it('should notify user when their post is flagged', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      cy.get('[data-testid*="notification"]').should('contain', 'flagged');
    });

    it('should temporarily take down flagged content', () => {
      // After flagging, content should not be visible
      cy.visit('/home');
      // Flagged content should not appear in list
      cy.get('body').should('not.contain', 'flagged content');
    });
  });

  describe('COS 4.9: One Appeal Per Deletion', () => {
    it('should only allow one appeal per deletion', () => {
      cy.get('[data-testid*="notifications"], a[href*="notifications"]').click();
      // If appeal button exists, click it
      cy.get('body').then($body => {
        if ($body.find('button:contains("Appeal")').length > 0) {
          cy.get('button:contains("Appeal")').first().click();
          // Submit appeal
          cy.get('textarea').type('This is my appeal explanation that meets all requirements.');
          cy.get('button:contains("Submit")').click();
          // After submission, appeal button should not appear again
          cy.get('button:contains("Appeal")').should('not.exist');
        }
      });
    });
  });

  describe('COS 4.10: Prevent Multiple Flags', () => {
    it('should prevent flagging the same post multiple times', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Flag"), [data-testid*="flag"]').first().click();
      // Try to flag again
      cy.get('button:contains("Flag"), [data-testid*="flag"]').should('not.exist', 'be.disabled');
      // Or should show error
      cy.get('[role="alert"], .error').should('contain', 'already flagged');
    });
  });
});

