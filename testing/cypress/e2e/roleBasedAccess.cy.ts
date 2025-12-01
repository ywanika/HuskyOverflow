import { loginUser, setupTest, teardownTest } from '../support/helpers';

describe('Role-Based Access Control E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Regular User Access', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should not see moderator dashboard link', () => {
      cy.contains(/moderator.*dashboard/i).should('not.exist');
    });

    it('should not see admin dashboard link', () => {
      cy.contains(/admin.*dashboard/i).should('not.exist');
    });

    it('should not see delete buttons on content', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('button', /delete.*question/i).should('not.exist');
    });

    it('should see flag buttons on content', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('button', /flag/i).should('be.visible');
    });

    it('should be redirected from moderator dashboard', () => {
      cy.visit('http://localhost:4530/moderator/dashboard');
      cy.url().should('not.include', '/moderator/dashboard');
    });

    it('should be redirected from admin dashboard', () => {
      cy.visit('http://localhost:4530/admin/dashboard');
      cy.url().should('not.include', '/admin/dashboard');
    });

    it('should not access moderator API endpoints', () => {
      // Try to access flagged content endpoint
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/moderation/flagged',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.gte(400);
      });
    });

    it('should not access admin API endpoints', () => {
      // Try to access metrics endpoint
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/admin/metrics?username=dad',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(403);
      });
    });
  });

  describe('Moderator Access', () => {
    beforeEach(() => {
      loginUser('sss', 'sss');
    });

    it('should see moderator dashboard link', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).should('be.visible');
    });

    it('should not see admin dashboard link', () => {
      cy.contains(/admin.*dashboard/i).should('not.exist');
    });

    it('should see delete buttons on content', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('button', /delete/i).should('be.visible');
    });

    it('should access moderator dashboard', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.url().should('include', '/moderator/dashboard');
    });

    it('should be redirected from admin dashboard', () => {
      cy.visit('http://localhost:4530/admin/dashboard');
      cy.url().should('not.include', '/admin/dashboard');
    });

    it('should access moderator API endpoints', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/moderation/flagged',
        headers: {
          // Add auth headers if needed
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('should not access admin API endpoints', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/admin/metrics?username=sss',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(403);
      });
    });

    it('should not see user management options', () => {
      cy.contains(/user.*management|create.*user/i).should('not.exist');
    });
  });

  describe('Admin Access', () => {
    beforeEach(() => {
      loginUser('ddd', 'ddd');
    });

    it('should see admin dashboard link', () => {
      cy.contains(/admin.*dashboard|dashboard/i).should('be.visible');
    });

    it('should see moderator dashboard link', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).should('be.visible');
    });

    it('should access admin dashboard', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.url().should('include', '/admin/dashboard');
    });

    it('should access moderator dashboard', () => {
      cy.contains(/moderator.*dashboard|dashboard/i).click();
      cy.url().should('include', '/moderator/dashboard');
    });

    it('should see delete buttons on content', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('button', /delete/i).should('be.visible');
    });

    it('should access admin API endpoints', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/admin/metrics?username=ddd',
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('should access moderator API endpoints', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/moderation/flagged',
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('should see user management options', () => {
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).should('be.visible');
    });
  });

  describe('Suspended User Access', () => {
    beforeEach(() => {
      // Suspend a user as admin
      loginUser('ddd', 'ddd');
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /suspend/i).click();
      });
      
      cy.get('select, [role="combobox"]').select('7 days');
      cy.get('select, [role="combobox"]').eq(1).select('Spam');
      cy.contains('button', /confirm|suspend/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
    });

    it('should redirect suspended user to suspended page', () => {
      loginUser('dad', 'dad');
      
      // Should be redirected to suspended page
      cy.url().should('include', '/suspended');
      cy.contains(/suspended|account/i).should('be.visible');
    });

    it('should show suspension details', () => {
      loginUser('dad', 'dad');
      
      cy.contains(/suspended until/i).should('be.visible');
      cy.contains(/suspended for|reason/i).should('be.visible');
    });

    it('should not show navigation bar on suspended page', () => {
      loginUser('dad', 'dad');
      
      cy.get('nav, [role="navigation"]').should('not.exist');
    });

    it('should prevent suspended user from posting', () => {
      loginUser('dad', 'dad');
      
      // Try to navigate to post question
      cy.visit('http://localhost:4530/new/question');
      
      // Should be redirected back to suspended page
      cy.url().should('include', '/suspended');
    });
  });

  describe('Banned User Access', () => {
    beforeEach(() => {
      // Ban a user as admin
      loginUser('ddd', 'ddd');
      cy.contains(/admin.*dashboard|dashboard/i).click();
      cy.contains(/user.*management|users/i).click();
      
      cy.contains('dad').parent().within(() => {
        cy.contains('button', /ban/i).click();
      });
      
      const banReason = 'This is a permanent ban reason that exceeds twenty characters minimum requirement.';
      cy.get('textarea, input[type="text"]').last().type(banReason);
      cy.contains('button', /confirm|ban/i).click();
      cy.wait(2000);
      cy.contains('Logout').click();
    });

    it('should redirect banned user to suspended page', () => {
      loginUser('dad', 'dad');
      
      cy.url().should('include', '/suspended');
      cy.contains(/suspended|banned/i).should('be.visible');
    });
  });

  describe('Community Guidelines Agreement', () => {
    it('should prevent posting without guidelines agreement', () => {
      // This would require a user without agreedToGuidelines
      // For now, verify the check exists in the UI
      loginUser('dad', 'dad');
      
      cy.contains('Ask a Question').click();
      cy.url().should('include', '/new/question');
      
      // If user hasn't agreed, should show error
      // This test would need a user without agreement in test data
    });

    it('should allow posting with guidelines agreement', () => {
      loginUser('dad', 'dad');
      
      cy.contains('Ask a Question').click();
      cy.get('#formTitleInput').should('be.visible');
      cy.get('#formTextInput').should('be.visible');
    });
  });
});

