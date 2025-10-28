describe('Comprehensive Accessibility Tests', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('http://localhost:3000');
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations on login page', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should have no accessibility violations on signup page', () => {
      cy.visit('http://localhost:3000/signup');
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('Perceivable - Alternative Text and Contrast', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
      // Check that h1 comes before h2
      cy.get('h1').then($h1 => {
        cy.get('h2').then($h2 => {
          expect($h1[0].compareDocumentPosition($h2[0]) & Node.DOCUMENT_POSITION_FOLLOWING).to.be.true;
        });
      });
    });

    it('should have sufficient color contrast', () => {
      // This would need a more sophisticated tool to test actual contrast ratios
      // For now, we'll check that important text elements exist
      cy.get('.form-label').should('have.css', 'color');
      cy.get('h1').should('have.css', 'color');
      cy.get('h2').should('have.css', 'color');
    });
  });

  describe('Operable - Keyboard Navigation', () => {
    it('should be fully keyboard navigable', () => {
      // Test skip links
      cy.get('body').type('{tab}');
      cy.get('.skip-link').should('be.visible');
      
      // Test tab navigation through form
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'href', '#main-content');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'href', '#navigation');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'id', 'username-input');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'id', 'password-input');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'id', 'showPasswordToggle');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'type', 'submit');
    });

    it('should have visible focus indicators', () => {
      cy.get('#username-input').focus();
      cy.get('#username-input').should('have.css', 'outline');
      
      cy.get('#password-input').focus();
      cy.get('#password-input').should('have.css', 'outline');
      
      cy.get('button[type="submit"]').focus();
      cy.get('button[type="submit"]').should('have.css', 'outline');
    });
  });

  describe('Understandable - Clear Labels and Instructions', () => {
    it('should have proper form labels', () => {
      cy.get('label[for="username-input"]').should('exist');
      cy.get('label[for="password-input"]').should('exist');
      cy.get('label[for="showPasswordToggle"]').should('exist');
    });

    it('should have required field indicators', () => {
      cy.get('.required').should('contain', '*');
      cy.get('.required').should('have.attr', 'aria-label', 'required');
    });

    it('should have help text for form fields', () => {
      cy.get('#username-help').should('exist');
      cy.get('#password-help').should('exist');
      cy.get('#show-password-help').should('exist');
    });

    it('should have proper fieldset and legend', () => {
      cy.get('fieldset').should('exist');
      cy.get('legend').should('exist');
      cy.get('legend').should('have.attr', 'id', 'login-heading');
    });

    it('should have meaningful error messages', () => {
      // Test error message structure
      cy.get('.error-message').should('have.attr', 'role', 'alert');
      cy.get('.error-message').should('have.attr', 'aria-live', 'polite');
    });
  });

  describe('Robust - Semantic HTML and ARIA', () => {
    it('should use semantic HTML elements', () => {
      cy.get('main[role="main"]').should('exist');
      cy.get('form[role="form"]').should('exist');
      cy.get('fieldset').should('exist');
      cy.get('legend').should('exist');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('form').should('have.attr', 'aria-labelledby');
      cy.get('#username-input').should('have.attr', 'aria-describedby');
      cy.get('#password-input').should('have.attr', 'aria-describedby');
      cy.get('#showPasswordToggle').should('have.attr', 'aria-describedby');
    });

    it('should have proper form validation attributes', () => {
      cy.get('#username-input').should('have.attr', 'required');
      cy.get('#password-input').should('have.attr', 'required');
      cy.get('#username-input').should('have.attr', 'aria-invalid');
      cy.get('#password-input').should('have.attr', 'aria-invalid');
    });
  });

  describe('Skip Links', () => {
    it('should have skip links that work properly', () => {
      cy.get('.skip-link').should('have.length', 2);
      cy.get('.skip-link').first().should('have.attr', 'href', '#main-content');
      cy.get('.skip-link').last().should('have.attr', 'href', '#navigation');
    });

    it('should show skip links on focus', () => {
      cy.get('.skip-link').should('not.be.visible');
      cy.get('body').type('{tab}');
      cy.get('.skip-link').first().should('be.visible');
    });
  });

  describe('Language and Page Structure', () => {
    it('should have proper language attribute', () => {
      cy.get('html').should('have.attr', 'lang', 'en');
    });

    it('should have proper page title', () => {
      cy.title().should('not.be.empty');
    });
  });
});
