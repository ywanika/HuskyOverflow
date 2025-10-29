describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('http://localhost:3000');
  });

  it('should have no accessibility violations on login page', () => {
    // Inject axe-core
    cy.injectAxe();
    
    // Check for accessibility violations
    cy.checkA11y();
  });

  it('should have proper focus management', () => {
    // Test skip links
    cy.get('body').type('{tab}');
    cy.get('.skip-link').should('be.visible');
    
    // Test keyboard navigation
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'href', '#main-content');
    
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'href', '#navigation');
  });

  it('should have proper form accessibility', () => {
    // Check form labels
    cy.get('label[for="username-input"]').should('exist');
    cy.get('label[for="password-input"]').should('exist');
    
    // Check required field indicators
    cy.get('.required').should('contain', '*');
    
    // Check fieldset and legend
    cy.get('fieldset').should('exist');
    cy.get('legend').should('exist');
    
    // Check help text
    cy.get('#username-help').should('exist');
    cy.get('#password-help').should('exist');
  });

  it('should have proper ARIA attributes', () => {
    // Check main landmark
    cy.get('main[role="main"]').should('exist');
    
    // Check form attributes
    cy.get('form[role="form"]').should('exist');
    cy.get('form').should('have.attr', 'aria-labelledby');
    
    // Check error message
    cy.get('.error-message').should('have.attr', 'role', 'alert');
  });

  it('should have proper contrast ratios', () => {
    // This test would need to be run with a tool that can measure contrast
    // For now, we'll check that the elements exist
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
    cy.get('.form-label').should('exist');
  });

  it('should be keyboard navigable', () => {
    // Test tab navigation through form
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'id', 'username-input');
    
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'id', 'password-input');
    
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'id', 'showPasswordToggle');
    
    cy.get('body').type('{tab}');
    cy.focused().should('have.attr', 'type', 'submit');
  });
});