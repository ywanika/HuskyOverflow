import { loginUser, setupTest, teardownTest, createQuestion } from '../support/helpers';

describe('Appeals Workflow E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('User Submitting Appeal', () => {
    beforeEach(() => {
      // Create and delete content as moderator
      loginUser('sss', 'sss');
      cy.contains('Logout').click();
      
      // Create question as regular user
      loginUser('dad', 'dad');
      createQuestion('Question to appeal', 'This will be deleted and appealed', 'javascript');
      cy.contains('Logout').click();
      
      // Delete as moderator
      loginUser('sss', 'sss');
      cy.contains('Question to appeal').click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000); // Wait for notification
      cy.contains('Logout').click();
    });

    it('should allow user to appeal deletion via notification', () => {
      loginUser('dad', 'dad');
      
      // Open notifications
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      // Find deletion notification
      cy.contains(/deleted|deletion/i).should('be.visible');
      
      // Click appeal button
      cy.contains('button', /appeal/i).first().click();
      
      // Should open appeal form
      cy.contains(/appeal|reason/i).should('be.visible');
    });

    it('should require appeal reason between 50-500 characters', () => {
      loginUser('dad', 'dad');
      
      // Open notifications and click appeal
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      
      // Try with too short reason
      cy.get('textarea, input[type="text"]').last().type('Too short');
      cy.contains('button', /submit|appeal/i).click();
      
      // Should show error
      cy.contains(/50.*500|between/i).should('be.visible');
    });

    it('should require at least 3 words in appeal reason', () => {
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      
      // Try with less than 3 words (but enough characters)
      cy.get('textarea, input[type="text"]').last().type('a'.repeat(60));
      cy.contains('button', /submit|appeal/i).click();
      
      // Should show error
      cy.contains(/3 words|at least/i).should('be.visible');
    });

    it('should successfully submit valid appeal', () => {
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      
      // Valid appeal reason (50+ chars, 3+ words)
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information and does not violate any rules.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      
      // Should show success message
      cy.contains(/submitted|success/i, { timeout: 3000 }).should('be.visible');
    });

    it('should prevent duplicate appeals for same content', () => {
      loginUser('dad', 'dad');
      
      // Submit first appeal
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
      
      // Try to appeal again - should not see appeal button
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).should('not.exist');
    });

    it('should prevent profanity in appeal reason', () => {
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      
      // Appeal reason with profanity
      cy.get('textarea, input[type="text"]').last().type('This is a bad word here and I think my content should be restored because it follows guidelines.');
      cy.contains('button', /submit|appeal/i).click();
      
      cy.contains(/profanity|inappropriate/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Moderator Processing Appeals', () => {
    beforeEach(() => {
      // Create, delete, and appeal content
      loginUser('sss', 'sss');
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      createQuestion('Appeal test question', 'Content to appeal', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Appeal test question').click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information and does not violate any rules.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
    });

    it('should display appeals in moderator dashboard', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      
      // Should see appeals tab
      cy.contains(/appeal/i).should('be.visible');
      cy.contains('Appeal test question').should('be.visible');
    });

    it('should show appeal details', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      
      // Should see appeal reason, content type, username
      cy.contains(/aligns|guidelines/i).should('be.visible');
      cy.contains('dad').should('be.visible');
    });

    it('should approve an appeal', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      
      // Click approve button
      cy.contains('button', /approve/i).first().click();
      
      // Appeal should be processed
      cy.contains('Appeal test question').should('not.exist');
      
      // Content should be restored
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.contains('Appeal test question').should('be.visible');
    });

    it('should reject an appeal', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      
      // Click reject button
      cy.contains('button', /reject/i).first().click();
      
      // Appeal should be processed
      cy.contains('Appeal test question').should('not.exist');
      
      // User should receive notification
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/rejected|denied/i).should('be.visible');
    });
  });

  describe('Appeal Notifications', () => {
    beforeEach(() => {
      // Set up appeal scenario
      loginUser('sss', 'sss');
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      createQuestion('Notification test', 'Test content', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Notification test').click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
    });

    it('should notify moderators when appeal is submitted', () => {
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/appeal.*submitted|new appeal/i).should('be.visible');
    });

    it('should notify user when appeal is approved', () => {
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      cy.contains('button', /approve/i).first().click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/approved|accepted/i).should('be.visible');
    });

    it('should notify user when appeal is rejected', () => {
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      cy.contains('button', /reject/i).first().click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/rejected|denied/i).should('be.visible');
    });
  });
});

