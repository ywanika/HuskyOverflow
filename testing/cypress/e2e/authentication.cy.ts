import { loginUser, setupTest, teardownTest } from '../support/helpers';

describe('Authentication & User Management E2E Tests', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('User Login', () => {
    it('should successfully log in as regular user', () => {
      cy.visit('http://localhost:4530');
      cy.contains('Welcome to FakeStackOverflow!');
      cy.get('#username-input').type('dad');
      cy.get('#password-input').type('dad');
      cy.contains('Submit').click();
      cy.url().should('include', '/home');
      cy.contains('Fake Stack Overflow');
    });

    it('should successfully log in as moderator', () => {
      cy.visit('http://localhost:4530');
      cy.get('#username-input').type('sss');
      cy.get('#password-input').type('sss');
      cy.contains('Submit').click();
      cy.url().should('include', '/home');
      cy.contains('Fake Stack Overflow');
    });

    it('should successfully log in as admin', () => {
      cy.visit('http://localhost:4530');
      cy.get('#username-input').type('ddd');
      cy.get('#password-input').type('ddd');
      cy.contains('Submit').click();
      cy.url().should('include', '/home');
      cy.contains('Fake Stack Overflow');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('http://localhost:4530');
      cy.get('#username-input').type('invaliduser');
      cy.get('#password-input').type('wrongpassword');
      cy.contains('Submit').click();
      cy.contains(/invalid|incorrect|error/i).should('be.visible');
    });

    it('should have accessible login form', () => {
      cy.visit('http://localhost:4530');
      cy.injectAxe();
      cy.checkA11y();
      
      // Check form labels
      cy.get('label[for="username-input"]').should('exist');
      cy.get('label[for="password-input"]').should('exist');
      
      // Check required field indicators
      cy.get('.required, [aria-required="true"]').should('exist');
      
      // Check fieldset and legend
      cy.get('fieldset').should('exist');
      cy.get('legend').should('exist');
    });
  });

  describe('User Registration', () => {
    it('should register new user with community guidelines agreement', () => {
      cy.visit('http://localhost:4530');
      cy.contains('Sign Up').click();
      cy.url().should('include', '/signup');
      
      const username = `testuser${Date.now()}`;
      cy.get('#username-input').type(username);
      cy.get('#password-input').type('password123');
      cy.get('#confirm-password-input').type('password123');
      
      // Must check community guidelines checkbox
      cy.get('input[type="checkbox"][name*="guideline"], input[type="checkbox"][id*="guideline"]').check();
      
      cy.contains('Sign Up').click();
      cy.url().should('include', '/home');
    });

    it('should prevent registration without community guidelines agreement', () => {
      cy.visit('http://localhost:4530');
      cy.contains('Sign Up').click();
      
      const username = `testuser${Date.now()}`;
      cy.get('#username-input').type(username);
      cy.get('#password-input').type('password123');
      cy.get('#confirm-password-input').type('password123');
      
      // Don't check guidelines checkbox
      cy.contains('Sign Up').should('be.disabled');
    });

    it('should show error for duplicate username', () => {
      cy.visit('http://localhost:4530');
      cy.contains('Sign Up').click();
      
      cy.get('#username-input').type('dad'); // Existing user
      cy.get('#password-input').type('password123');
      cy.get('#confirm-password-input').type('password123');
      cy.get('input[type="checkbox"][name*="guideline"], input[type="checkbox"][id*="guideline"]').check();
      
      cy.contains('Sign Up').click();
      cy.contains(/already exists|duplicate|taken/i).should('be.visible');
    });
  });

  describe('Community Guidelines', () => {
    it('should display community guidelines page', () => {
      cy.visit('http://localhost:4530/guidelines');
      cy.contains(/community guidelines/i).should('be.visible');
    });

    it('should link to community guidelines from profile', () => {
      loginUser('dad', 'dad');
      cy.contains('Profile').click();
      cy.contains(/community guidelines/i).should('be.visible');
      cy.contains(/community guidelines/i).click();
      cy.url().should('include', '/guidelines');
    });
  });

  describe('User Profile', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should display user profile with role', () => {
      cy.contains('Profile').click();
      cy.contains('dad').should('be.visible');
      cy.contains(/role|user/i).should('be.visible');
    });

    it('should show community guidelines agreement status', () => {
      cy.contains('Profile').click();
      cy.contains(/agreed.*guidelines|guidelines.*agreed/i).should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should successfully log out', () => {
      cy.contains('Logout').click();
      cy.url().should('not.include', '/home');
      cy.url().should('include', '/');
      cy.contains('Welcome to FakeStackOverflow!');
    });
  });
});

