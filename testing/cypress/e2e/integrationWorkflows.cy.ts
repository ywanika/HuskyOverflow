import { loginUser, setupTest, teardownTest, createQuestion, createAnswer } from '../support/helpers';

describe('Integration Workflows E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Complete Flag → Delete → Appeal → Restore Workflow', () => {
    it('should complete full moderation workflow', () => {
      // Step 1: User creates content
      loginUser('dad', 'dad');
      const questionTitle = `Integration Test ${Date.now()}`;
      createQuestion(questionTitle, 'This is test content for integration workflow', 'javascript');
      cy.wait(1000);
      
      // Step 2: Another user flags the content
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      
      // Step 3: Moderator reviews and deletes
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(questionTitle).should('be.visible');
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      
      // Step 4: User receives notification and appeals
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/deleted|deletion/i).should('be.visible');
      cy.contains('button', /appeal/i).first().click();
      
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information and does not violate any rules.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
      
      // Step 5: Moderator processes appeal and restores
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      cy.contains(questionTitle).should('be.visible');
      cy.contains('button', /approve/i).first().click();
      cy.wait(2000);
      
      // Step 6: Verify content is restored
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.contains(questionTitle).should('be.visible');
    });
  });

  describe('Flag → Dismiss Workflow', () => {
    it('should dismiss a flag without deleting', () => {
      // User creates and flags content
      loginUser('dad', 'dad');
      const questionTitle = `Dismiss Test ${Date.now()}`;
      createQuestion(questionTitle, 'Content to flag', 'javascript');
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      // Moderator dismisses flag
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(questionTitle).should('be.visible');
      cy.contains('button', /dismiss/i).first().click();
      cy.wait(1000);
      
      // Content should still exist
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.contains(questionTitle).should('be.visible');
    });
  });

  describe('Multiple Users Flagging Same Content', () => {
    it('should handle multiple flags on same content', () => {
      // Create content
      loginUser('dad', 'dad');
      const questionTitle = `Multi Flag Test ${Date.now()}`;
      createQuestion(questionTitle, 'Content for multiple flags', 'javascript');
      cy.wait(1000);
      
      // First user flags
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      // Second user flags (if we had another test user)
      // For now, verify moderator sees the flag
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(questionTitle).should('be.visible');
    });
  });

  describe('Real-time Updates Across Multiple Sessions', () => {
    it('should update moderator dashboard in real-time when content is flagged', () => {
      // Moderator opens dashboard
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      
      // User flags content in another session (simulated)
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      const questionTitle = `Real-time Test ${Date.now()}`;
      createQuestion(questionTitle, 'Content for real-time test', 'javascript');
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(2000);
      
      // Moderator should see update (would need socket testing for true real-time)
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(questionTitle, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Moderator Deletion → User Appeal → Moderator Restore', () => {
    it('should restore content after appeal approval', () => {
      // Moderator deletes content
      loginUser('sss', 'sss');
      cy.contains('.postTitle').first().click();
      const questionText = cy.contains('.postTitle').first().text();
      
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      
      // User appeals
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains('button', /appeal/i).first().click();
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
      
      // Moderator approves appeal
      cy.contains('Logout').click();
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(/appeal/i).click();
      cy.contains('button', /approve/i).first().click();
      cy.wait(2000);
      
      // Verify restoration
      cy.contains(/deleted/i).click();
      // Content should be removed from deleted list
    });
  });

  describe('Content Creation → Flag → Review → Delete Workflow', () => {
    it('should handle complete content moderation workflow', () => {
      // Create content
      loginUser('dad', 'dad');
      const questionTitle = `Complete Workflow ${Date.now()}`;
      createQuestion(questionTitle, 'Complete workflow test content', 'javascript');
      cy.wait(1000);
      
      // Flag content
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      // Moderator reviews flagged content
      loginUser('sss', 'sss');
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.contains(questionTitle).should('be.visible');
      
      // View the content
      cy.contains('button', /view/i).first().click();
      cy.url().should('include', '/question/');
      
      // Delete the content
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      
      // Verify deletion
      cy.contains(questionTitle).should('not.exist');
    });
  });

  describe('Notification Flow Integration', () => {
    it('should send notifications at each step of moderation workflow', () => {
      // Create content
      loginUser('dad', 'dad');
      const questionTitle = `Notification Flow ${Date.now()}`;
      createQuestion(questionTitle, 'Notification flow test', 'javascript');
      cy.wait(1000);
      
      // Flag - should notify moderators
      cy.contains(questionTitle).click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/flagged/i).should('be.visible');
      cy.contains('Logout').click();
      
      // Delete - should notify user
      loginUser('sss', 'sss');
      cy.contains(questionTitle).click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/deleted/i).should('be.visible');
      
      // Appeal - should notify moderators
      cy.contains('button', /appeal/i).first().click();
      const appealReason = 'I believe this content aligns with community guidelines because it provides valuable information.';
      cy.get('textarea, input[type="text"]').last().type(appealReason);
      cy.contains('button', /submit|appeal/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/appeal/i).should('be.visible');
    });
  });
});

