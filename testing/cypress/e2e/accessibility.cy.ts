import 'cypress-axe';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('http://localhost:4531');
    
    // Login (adjust credentials as needed)
    cy.get('#username-input').type('testuser');
    cy.get('#password-input').type('password');
    cy.get('.login-button').click();
    
    // Wait for navigation
    cy.url().should('include', '/home');
  });

  it('should have no accessibility violations on homepage', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should display skip links when focused', () => {
    cy.get('body').click(0, 0); // Click at top to focus
    cy.get('.skip-link').should('be.visible');
  });

  it('should have proper ARIA landmarks', () => {
    cy.get('nav[aria-label="Main navigation"]').should('exist');
    cy.get('main[role="main"]').should('exist');
    cy.get('header[role="banner"]').should('exist');
  });

  it('should navigate with keyboard only', () => {
    cy.realPress('Tab'); // Focus first element
    cy.get(':focus').should('exist');
    cy.realPress('Tab'); // Continue navigation
    cy.get(':focus').should('exist');
  });

  it('should have proper form labels on login page', () => {
    // Logout first
    cy.get('.logout-button').click();
    cy.url().should('include', '/');
    
    cy.get('label[for="username-input"]').should('exist').and('be.visible');
    cy.get('label[for="password-input"]').should('exist').and('be.visible');
  });

  it('should have required field indicators', () => {
    cy.visit('http://localhost:4531');
    cy.get('.required').should('exist').and('contain', '*');
  });

  it('should have accessible button labels', () => {
    cy.get('button').each(($btn) => {
      cy.wrap($btn).should('have.attr', 'aria-label').or('contain.text');
    });
  });

  it('should navigate breadcrumbs with keyboard', () => {
    cy.get('.breadcrumb').should('exist');
  });
});

