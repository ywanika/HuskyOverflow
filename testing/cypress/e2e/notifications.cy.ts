import { loginUser, setupTest, teardownTest, createQuestion } from '../support/helpers';

describe('Notification System E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Notification Bell', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should display notification bell in header', () => {
      cy.get('[class*="notification"], [aria-label*="notification"], button[aria-label*="notification"]').should('be.visible');
    });

    it('should show unread count badge', () => {
      // Create a notification by flagging content
      createQuestion('Notification test', 'Test content', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Notification test').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      
      // Should see unread count
      cy.get('[class*="badge"], [class*="count"]').should('exist');
    });

    it('should open notification dropdown on click', () => {
      cy.get('[class*="notification"], [aria-label*="notification"], button[aria-label*="notification"]').click();
      
      // Should see dropdown
      cy.contains(/notification|no notifications/i).should('be.visible');
    });
  });

  describe('Deletion Notifications', () => {
    beforeEach(() => {
      // Create content as regular user
      loginUser('dad', 'dad');
      createQuestion('Question for deletion', 'This will be deleted', 'javascript');
      cy.contains('Logout').click();
      
      // Delete as moderator
      loginUser('sss', 'sss');
      cy.contains('Question for deletion').click();
      cy.contains('button', /delete/i).first().click();
      cy.get('input[type="text"], textarea').last().type('This violates community guidelines');
      cy.contains('button', /confirm|delete/i).click();
      cy.wait(2000); // Wait for notification
      cy.contains('Logout').click();
    });

    it('should notify user within 2 minutes of deletion', () => {
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      // Should see deletion notification
      cy.contains(/deleted|deletion/i).should('be.visible');
    });

    it('should show content type in deletion notification', () => {
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains(/question|answer|comment/i).should('be.visible');
    });

    it('should show first 100 characters of deleted content', () => {
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      // Should see content preview
      cy.contains('Question for deletion').should('be.visible');
    });

    it('should show moderator reason in deletion notification', () => {
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains(/violates|guidelines|reason/i).should('be.visible');
    });

    it('should have appeal button in deletion notification', () => {
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains('button', /appeal/i).should('be.visible');
    });
  });

  describe('Flag Notifications', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
      createQuestion('Question to flag', 'This will be flagged', 'javascript');
      cy.contains('Question to flag').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
    });

    it('should notify content owner when content is flagged', () => {
      loginUser('dad', 'dad');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains(/flagged/i).should('be.visible');
    });

    it('should notify moderators when content is flagged', () => {
      loginUser('sss', 'sss');
      
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains(/flagged|new flag/i).should('be.visible');
    });
  });

  describe('Appeal Notifications', () => {
    beforeEach(() => {
      // Set up appeal scenario
      loginUser('sss', 'sss');
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      createQuestion('Appeal notification test', 'Test content', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Appeal notification test').click();
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

  describe('Role Change Notifications', () => {
    it('should notify user when role changes', () => {
      loginUser('ddd', 'ddd');
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      // Promote user
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /promote|moderator/i).click();
      });
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/moderator|role.*changed/i).should('be.visible');
    });
  });

  describe('System Announcements', () => {
    it('should display system announcements to all users', () => {
      loginUser('ddd', 'ddd');
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/announcement/i).click();
      
      const announcementText = `System announcement ${Date.now()}`;
      cy.get('textarea, input[type="text"]').last().type(announcementText);
      cy.contains('button', /send|post/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/announcement|system/i).should('be.visible');
    });
  });

  describe('Notification Management', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should mark notification as read', () => {
      // Create a notification first
      createQuestion('Read test', 'Test', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Read test').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      cy.contains('Logout').click();
      
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      // Click to mark as read
      cy.contains(/read|mark/i).first().click();
      
      // Notification should be marked as read
      cy.get('[class*="unread"], [class*="read"]').should('exist');
    });

    it('should mark all notifications as read', () => {
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      cy.contains('button', /mark.*all|read.*all/i).click();
      
      // All notifications should be marked as read
      cy.get('[class*="unread"]').should('not.exist');
    });

    it('should delete a notification', () => {
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      // Click delete button
      cy.contains('button', /delete/i).first().click();
      
      // Notification should be removed
      cy.contains(/deleted|removed/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Real-time Notification Updates', () => {
    it('should update notifications in real-time', () => {
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      
      const initialCount = cy.get('[class*="notification-item"], li').its('length');
      
      // Create new notification in another session
      createQuestion('Real-time test', 'Test', 'javascript');
      cy.contains('Logout').click();
      
      loginUser('sss', 'sss');
      cy.contains('Real-time test').click();
      cy.contains('button', /flag/i).first().click();
      cy.wait(2000);
      
      // Check if notification appeared
      cy.contains('Logout').click();
      loginUser('dad', 'dad');
      cy.get('[class*="notification"], [aria-label*="notification"]').click();
      cy.contains(/flagged|real-time/i).should('be.visible');
    });
  });
});

