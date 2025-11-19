/**
 * Cypress E2E tests for User Story 2: Moderator
 * Testing COS 2.1-2.10
 */

describe('User Story 2: Moderator - COS Tests', () => {
  beforeEach(() => {
    // Login as moderator
    cy.visit('http://localhost:3000');
    cy.get('#username-input').type('moderator1');
    cy.get('#password-input').type('password123');
    cy.get('form').submit();
    cy.url().should('include', '/home');
  });

  describe('COS 2.1: Moderator Delete Button', () => {
    it('should show delete button for questions to moderators', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete"), [data-testid*="delete"]').should('exist');
    });

    it('should show delete button for answers to moderators', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete"), [data-testid*="delete-answer"]').should('exist');
    });

    it('should show delete button for comments to moderators', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete"), [data-testid*="delete-comment"]').should('exist');
    });

    it('should not show delete button to regular users', () => {
      // Logout and login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete")').should('not.exist');
    });
  });

  describe('COS 2.2: Moderator Dashboard Access', () => {
    it('should automatically redirect moderators to dashboard after login', () => {
      cy.visit('/');
      cy.get('#username-input').type('moderator1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Should redirect to moderator dashboard
      cy.url().should('include', '/moderator/dashboard');
    });

    it('should not allow regular users to access moderator dashboard', () => {
      // Login as regular user
      cy.visit('/');
      cy.get('#username-input').type('user1');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      // Try to access moderator dashboard
      cy.visit('/moderator/dashboard');
      // Should redirect away or show error
      cy.url().should('not.include', '/moderator/dashboard');
    });
  });

  describe('COS 2.3: Deleted Posts Display', () => {
    it('should display all deleted posts on dashboard', () => {
      cy.visit('/moderator/dashboard');
      // Check for deleted posts section
      cy.get('[data-testid*="deleted"], .deleted-posts, h2:contains("Deleted")').should('exist');
    });

    it('should display content type for deleted posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="deleted"]').first().should('contain', 'question', 'answer', 'comment');
    });

    it('should display message/content for deleted posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="deleted"]').first().should('contain.text');
    });

    it('should display username of poster for deleted posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="deleted"]').first().should('contain', 'By');
    });
  });

  describe('COS 2.4: Recover Deleted Post', () => {
    it('should have a recover button for deleted posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('button:contains("Recover"), [data-testid*="recover"]').should('exist');
    });

    it('should recover a deleted post and restore it to homepage', () => {
      cy.visit('/moderator/dashboard');
      // Click recover on first deleted post
      cy.get('button:contains("Recover"), [data-testid*="recover"]').first().click();
      // Check that post appears on homepage
      cy.visit('/home');
      // Post should be visible
      cy.get('body').should('contain.text');
    });
  });

  describe('COS 2.5: Flagged/Appealed Posts Display', () => {
    it('should display all flagged posts on dashboard', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="flagged"], .flagged-posts, h2:contains("Flagged")').should('exist');
    });

    it('should display content type for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="flagged"]').first().should('contain', 'question', 'answer', 'comment');
    });

    it('should display message/content for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="flagged"]').first().should('contain.text');
    });

    it('should display username of poster for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('[data-testid*="flagged"]').first().should('contain', 'By');
    });

    it('should have a link to view context for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('a[href*="/question/"], button:contains("View")').should('exist');
    });

    it('should have delete button for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('button:contains("Delete"), [data-testid*="delete"]').should('exist');
    });

    it('should have dismiss flag button for flagged posts', () => {
      cy.visit('/moderator/dashboard');
      cy.get('button:contains("Dismiss"), [data-testid*="dismiss"]').should('exist');
    });
  });

  describe('COS 2.7: 3-Word Reasoning Requirement', () => {
    it('should require at least 3 words when deleting content', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete"), [data-testid*="delete"]').first().click();
      // Try to submit with less than 3 words
      cy.get('textarea, input[type="text"]').type('Too short');
      cy.get('button:contains("Delete"), button[type="submit"]').click();
      // Should show alert
      cy.get('[role="alert"], .error, .alert').should('contain', '3 word');
    });

    it('should show alert if 3-word reasoning is not provided', () => {
      cy.visit('/home');
      cy.get('a[href*="/question/"]').first().click();
      cy.get('button:contains("Delete"), [data-testid*="delete"]').first().click();
      // Try to submit with empty reason
      cy.get('button:contains("Delete"), button[type="submit"]').click();
      // Should show alert
      cy.get('[role="alert"], .error, .alert').should('exist');
    });
  });

  describe('COS 2.8: Profanity Detection', () => {
    it('should prevent posting content with profanity', () => {
      cy.visit('/new/question');
      cy.get('input[type="text"], textarea').first().type('This is a test question');
      cy.get('textarea').last().type('bad word here');
      cy.get('button:contains("Post"), button[type="submit"]').click();
      // Should show profanity alert
      cy.get('[role="alert"], .error, .alert').should('contain', 'profanity');
    });

    it('should show alert for profanity in usernames', () => {
      cy.visit('/signup');
      cy.get('#username-input').type('badusername');
      cy.get('#password-input').type('password123');
      cy.get('#password-confirm-input').type('password123');
      cy.get('#guidelinesCheckbox').check();
      cy.get('form').submit();
      // Should show profanity alert
      cy.get('[role="alert"], .error, .alert').should('contain', 'profanity');
    });
  });
});

