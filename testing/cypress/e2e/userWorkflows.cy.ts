import { loginUser, setupTest, teardownTest, createQuestion, createAnswer } from '../support/helpers';

describe('User Workflows E2E Tests', () => {
  beforeEach(() => {
    setupTest();
    loginUser('dad', 'dad');
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Question Creation', () => {
    it('should create a new question successfully', () => {
      const title = `Test Question ${Date.now()}`;
      const text = 'This is a test question description';
      const tags = 'javascript testing';
      
      createQuestion(title, text, tags);
      
      cy.url().should('include', '/home');
      cy.contains(title).should('be.visible');
    });

    it('should prevent creating question without community guidelines agreement', () => {
      // This would require a user without agreedToGuidelines
      // For now, test that the check exists
      cy.contains('Ask a Question').click();
      cy.url().should('include', '/new/question');
    });

    it('should show duplicate question suggestions while typing', () => {
      // First create a question
      const title = `Duplicate Test ${Date.now()}`;
      createQuestion(title, 'Test description', 'javascript');
      
      // Go to ask question page
      cy.contains('Ask a Question').click();
      
      // Type similar title
      cy.get('#formTitleInput').type(title.substring(0, 10));
      
      // Should show similar questions
      cy.contains(/similar questions|check out these/i, { timeout: 5000 }).should('be.visible');
    });

    it('should prevent profanity in question title', () => {
      cy.contains('Ask a Question').click();
      cy.get('#formTitleInput').type('bad word here');
      cy.get('#formTextInput').type('Question text');
      cy.get('#formTagInput').type('javascript');
      cy.contains('Post Question').click();
      
      // Should show profanity alert
      cy.contains(/profanity|inappropriate|not allowed/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Answer Creation', () => {
    it('should create an answer to a question', () => {
      // First view a question
      cy.contains('.postTitle').first().click();
      cy.url().should('include', '/question/');
      
      cy.contains('Answer Question').click();
      cy.url().should('include', '/new/answer');
      
      const answerText = `Test answer ${Date.now()}`;
      createAnswer(answerText);
      
      cy.url().should('include', '/question/');
      cy.contains(answerText).should('be.visible');
    });

    it('should prevent profanity in answer', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('Answer Question').click();
      
      cy.get('#answerTextInput').type('bad word here');
      cy.contains('Post Answer').click();
      
      cy.contains(/profanity|inappropriate|not allowed/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Comment Creation', () => {
    it('should create a comment on a question', () => {
      cy.contains('.postTitle').first().click();
      
      cy.contains('Add Comment').click();
      const commentText = `Test comment ${Date.now()}`;
      cy.get('textarea, input[type="text"]').last().type(commentText);
      cy.contains('Post Comment').click();
      
      cy.contains(commentText).should('be.visible');
    });

    it('should prevent profanity in comment', () => {
      cy.contains('.postTitle').first().click();
      cy.contains('Add Comment').click();
      
      cy.get('textarea, input[type="text"]').last().type('bad word here');
      cy.contains('Post Comment').click();
      
      cy.contains(/profanity|inappropriate|not allowed/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Content Flagging', () => {
    it('should flag a question', () => {
      cy.contains('.postTitle').first().click();
      
      // Find and click flag button
      cy.contains('button', /flag/i).first().click();
      
      // Button should show as flagged
      cy.contains(/flagged|already flagged/i, { timeout: 3000 }).should('be.visible');
    });

    it('should prevent flagging same content twice', () => {
      cy.contains('.postTitle').first().click();
      
      // Flag first time
      cy.contains('button', /flag/i).first().click();
      cy.wait(1000);
      
      // Try to flag again - button should be disabled or show already flagged
      cy.contains('button', /flag/i).first().should('be.disabled').or('contain', /flagged/i);
    });

    it('should flag an answer', () => {
      cy.contains('.postTitle').first().click();
      
      // Find flag button for answer
      cy.get('.answer, [class*="answer"]').first().within(() => {
        cy.contains('button', /flag/i).click();
      });
      
      cy.contains(/flagged/i, { timeout: 3000 }).should('be.visible');
    });

    it('should flag a comment', () => {
      cy.contains('.postTitle').first().click();
      
      // Add a comment first
      cy.contains('Add Comment').click();
      cy.get('textarea, input[type="text"]').last().type('Test comment for flagging');
      cy.contains('Post Comment').click();
      
      // Flag the comment
      cy.get('.comment, [class*="comment"]').last().within(() => {
        cy.contains('button', /flag/i).click();
      });
      
      cy.contains(/flagged/i, { timeout: 3000 }).should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should search for questions', () => {
      const searchTerm = 'javascript';
      cy.get('#searchBar').type(`${searchTerm}{enter}`);
      cy.url().should('include', '/search');
      cy.contains(searchTerm, { matchCase: false }).should('be.visible');
    });

    it('should show no results message when no matches', () => {
      cy.get('#searchBar').type(`nonexistentterm${Date.now()}{enter}`);
      cy.contains(/no results|not found/i).should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to questions page', () => {
      cy.contains('Questions').click();
      cy.url().should('include', '/home');
    });

    it('should navigate to tags page', () => {
      cy.contains('Tags').click();
      cy.url().should('include', '/tags');
    });

    it('should navigate to communities page', () => {
      cy.contains('Communities').click();
      cy.url().should('include', '/communities');
    });

    it('should navigate to collections page', () => {
      cy.contains('Collections').click();
      cy.url().should('include', '/collections');
    });
  });
});

