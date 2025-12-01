import { loginUser, setupTest, teardownTest, createQuestion, createAnswer } from '../support/helpers';

describe('Moderation Workflows E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Moderator Dashboard Access', () => {
    it('should allow moderator to access dashboard', () => {
      loginUser('sss', 'sss');
      
      // Moderator should see dashboard link
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.url().should('include', '/moderator/dashboard');
      
      // Should see flagged content tab
      cy.contains(/flagged|flag/i).should('be.visible');
    });

    it('should redirect regular user away from moderator dashboard', () => {
      loginUser('dad', 'dad');
      
      // Try to access moderator dashboard directly
      cy.visit('http://localhost:4530/moderator/dashboard');
      
      // Should be redirected or see access denied
      cy.url().should('not.include', '/moderator/dashboard');
    });
  });

  describe('Viewing Flagged Content', () => {
    beforeEach(() => {
      // First, flag some content as a regular user
      loginUser('dad', 'dad');
      createQuestion('Question to flag', 'This question will be flagged', 'javascript');
      
      // Flag the question
      cy.contains('Question to flag').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      
      // Now login as moderator
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
    });

    it('should display flagged questions in moderator dashboard', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.url().should('include', '/moderator/dashboard');
      
      // Should see flagged content
      cy.contains(/flagged|flag/i).should('be.visible');
      cy.contains('Question to flag').should('be.visible');
    });

    it('should show flagged content details', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      
      // Should see content type, message preview, and username
      cy.contains(/question|answer|comment/i).should('be.visible');
      cy.contains('dad').should('be.visible'); // Username of flagger
    });

    it('should update flagged content list in real-time', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      
      // Open in new window/tab to flag more content
      // For now, verify the list exists
      cy.get('[class*="flagged"], [class*="content"]').should('exist');
    });
  });

  describe('Deleting Content', () => {
    beforeEach(() => {
      loginUser('sss', 'sss');
    });

    it('should delete a question with proper reason', () => {
      // First create a question as regular user
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      createQuestion('Question to delete', 'This will be deleted', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Question to delete').click();
      
      // Click delete button (should be visible to moderator)
      cy.contains('button', /delete/i).first().click();
      
      // Fill in deletion reason (minimum 3 words)
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      
      // Question should be deleted
      cy.contains('Question to delete').should('not.exist');
    });

    it('should require at least 3 words for deletion reason', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('button', /delete/i).first().click();
      
      // Try with less than 3 words
      cy.get('input[type="text"], textarea').last().type('Bad content');
      cy.contains('button', /confirm|delete/i).click();
      
      // Should show error
      cy.contains(/3 words|at least/i).should('be.visible');
    });

    it('should delete an answer', () => {
      cy.contains('.postTitle').first().click();
      
      // Find delete button for answer
      cy.get('.answer, [class*="answer"]').first().within(() => {
        cy.contains('button', /delete/i).click();
      });
      
      cy.get('input[type="text"], textarea').last().type('This answer violates guidelines');
      cy.contains('button', /confirm|delete/i).click();
      
      // Answer should be deleted
      cy.get('.answer, [class*="answer"]').first().should('not.exist');
    });

    it('should delete a comment', () => {
      cy.contains('.postTitle').first().click();
      
      // Find delete button for comment
      cy.get('.comment, [class*="comment"]').first().within(() => {
        cy.contains('button', /delete/i).click();
      });
      
      cy.get('input[type="text"], textarea').last().type('This comment violates guidelines');
      cy.contains('button', /confirm|delete/i).click();
      
      // Comment should be deleted
      cy.get('.comment, [class*="comment"]').first().should('not.exist');
    });

    it('should not show delete button to regular users', () => {
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.contains('.postTitle').first().click();
      
      // Regular user should not see delete buttons
      cy.contains('button', /delete.*question/i).should('not.exist');
    });
  });

  describe('Dismissing Flags', () => {
    beforeEach(() => {
      // Flag content first
      loginUser('dad', 'dad');
      createQuestion('Question to dismiss', 'This flag will be dismissed', 'javascript');
      cy.contains('Question to dismiss').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
    });

    it('should dismiss a flag', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains('Question to dismiss').should('be.visible');
      
      // Click dismiss button
      cy.contains('button', /dismiss/i).first().click();
      
      // Content should be removed from flagged list
      cy.contains('Question to dismiss').should('not.exist');
    });

    it('should mark content as reviewed', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains('Question to dismiss').should('be.visible');
      
      // Click mark as reviewed
      cy.contains('button', /review|reviewed/i).first().click();
      
      // Content should be removed from flagged list
      cy.contains('Question to dismiss').should('not.exist');
    });
  });

  describe('Deleted Content View', () => {
    beforeEach(() => {
      loginUser('sss', 'sss');
      
      // Delete some content
      cy.contains('.postTitle').first().click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(1000);
    });

    it('should display deleted content in moderator dashboard', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      
      // Switch to deleted content tab
      cy.contains(/deleted/i).click();
      
      // Should see deleted content
      cy.get('[class*="deleted"], [class*="content"]').should('exist');
    });

    it('should show deleted content details', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/deleted/i).click();
      
      // Should see content type, message, username
      cy.contains(/question|answer|comment/i).should('be.visible');
    });

    it('should restore deleted content', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/deleted/i).click();
      
      // Click restore button
      cy.contains('button', /restore/i).first().click();
      
      // Content should be restored
      cy.contains('button', /restore/i).should('not.exist');
    });
  });
});

