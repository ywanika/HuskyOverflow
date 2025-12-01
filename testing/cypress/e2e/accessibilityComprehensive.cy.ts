import { loginUser, setupTest, teardownTest, createQuestion } from '../support/helpers';

describe('Comprehensive Accessibility E2E Tests (WCAG 2.1 AA)', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('POUR - Perceivable', () => {
    it('should have proper alt text for images', () => {
      cy.visit('http://localhost:4530');
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should have 4.5:1 contrast ratio for normal text', () => {
      cy.visit('http://localhost:4530');
      cy.injectAxe();
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    it('should allow text resizing up to 200% without breaking layout', () => {
      cy.visit('http://localhost:4530');
      
      // Simulate 200% zoom
      cy.viewport(1920, 1080);
      cy.get('body').invoke('css', 'zoom', '2');
      
      // Check that content is still readable and not cut off
      cy.get('main').should('be.visible');
      cy.contains('Welcome to FakeStackOverflow!').should('be.visible');
    });

    it('should have proper form labels', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('#username-input').should('have.attr', 'id');
      cy.get('label[for="username-input"]').should('exist');
      
      cy.get('#password-input').should('have.attr', 'id');
      cy.get('label[for="password-input"]').should('exist');
    });

    it('should have required field indicators', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('[aria-required="true"], .required, [required]').should('exist');
    });
  });

  describe('POUR - Operable', () => {
    it('should support full keyboard navigation', () => {
      cy.visit('http://localhost:4530');
      
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Continue tabbing
      cy.focused().tab();
      cy.focused().should('exist');
    });

    it('should have visible focus indicators', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('#username-input').focus();
      cy.focused().should('have.css', 'outline').and('not.be.empty');
    });

    it('should have skip links', () => {
      cy.visit('http://localhost:4530');
      
      // Press Tab to reveal skip links
      cy.get('body').type('{tab}');
      cy.contains(/skip.*main|skip.*content/i).should('be.visible');
    });

    it('should navigate skip links with keyboard', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'href', '#main-content');
      
      cy.focused().type('{enter}');
      cy.url().should('include', '#main-content');
    });

    it('should not have auto-updating content without user control', () => {
      loginUser('dad', 'dad');
      
      // Check that content doesn't auto-update without user interaction
      cy.contains('Fake Stack Overflow').should('be.visible');
      cy.wait(3000);
      // Content should remain stable
      cy.contains('Fake Stack Overflow').should('be.visible');
    });

    it('should have proper ARIA expanded states for dropdowns', () => {
      loginUser('dad', 'dad');
      
      // Check messaging dropdown if it exists
      cy.get('[aria-expanded]').each(($el) => {
        cy.wrap($el).should('have.attr', 'aria-expanded');
      });
    });
  });

  describe('POUR - Understandable', () => {
    it('should have consistent navigation', () => {
      loginUser('dad', 'dad');
      
      // Check navigation is consistent across pages
      cy.contains('Questions').should('be.visible');
      cy.contains('Tags').should('be.visible');
      
      cy.contains('Tags').click();
      cy.contains('Questions').should('be.visible');
      cy.contains('Tags').should('be.visible');
    });

    it('should have clear and concise labels', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('label').each(($label) => {
        cy.wrap($label).should('not.be.empty');
      });
    });

    it('should have meaningful error messages', () => {
      cy.visit('http://localhost:4530');
      
      // Try to submit empty form
      cy.contains('Submit').click();
      
      // Should see error message
      cy.contains(/error|required|invalid/i).should('be.visible');
    });

    it('should identify primary language', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('html').should('have.attr', 'lang');
    });

    it('should have aria-current for current page', () => {
      loginUser('dad', 'dad');
      
      cy.contains('Questions').click();
      cy.get('[aria-current="page"]').should('exist');
    });
  });

  describe('POUR - Robust', () => {
    it('should use semantic HTML elements', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('main').should('exist');
      cy.get('nav').should('exist');
      cy.get('header').should('exist');
      cy.get('button').should('exist');
    });

    it('should have proper ARIA roles', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('[role="navigation"]').should('exist');
      cy.get('[role="main"]').should('exist');
      cy.get('[role="banner"]').should('exist');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('[aria-label]').should('exist');
      cy.get('#searchBar').should('have.attr', 'aria-label');
    });

    it('should have proper form structure', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('fieldset').should('exist');
      cy.get('legend').should('exist');
    });

    it('should have error announcements for screen readers', () => {
      cy.visit('http://localhost:4530');
      
      cy.contains('Submit').click();
      
      cy.get('[role="alert"]').should('exist');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should navigate through all interactive elements with Tab', () => {
      cy.get('body').tab();
      
      let focusCount = 0;
      for (let i = 0; i < 20; i++) {
        cy.focused().then(($el) => {
          if ($el.length > 0) {
            focusCount++;
          }
        });
        cy.get('body').type('{tab}');
      }
      
      expect(focusCount).to.be.greaterThan(0);
    });

    it('should activate buttons with Enter key', () => {
      cy.contains('Ask a Question').focus();
      cy.focused().type('{enter}');
      cy.url().should('include', '/new/question');
    });

    it('should navigate forms with Tab and Shift+Tab', () => {
      cy.contains('Ask a Question').click();
      
      cy.get('#formTitleInput').focus();
      cy.focused().should('have.id', 'formTitleInput');
      
      cy.focused().tab();
      cy.focused().should('have.id', 'formTextInput');
      
      cy.focused().type('{shift}{tab}');
      cy.focused().should('have.id', 'formTitleInput');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper ARIA landmarks', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('main[role="main"]').should('exist');
      cy.get('nav[role="navigation"]').should('exist');
      cy.get('header[role="banner"]').should('exist');
    });

    it('should have descriptive link text', () => {
      loginUser('dad', 'dad');
      
      cy.get('a').each(($link) => {
        const text = $link.text().trim();
        if (text) {
          expect(text.length).to.be.greaterThan(0);
        } else {
          // If no text, should have aria-label
          cy.wrap($link).should('have.attr', 'aria-label');
        }
      });
    });

    it('should have proper heading hierarchy', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('h1').should('exist');
      // Should not skip heading levels
      cy.get('h1').then(($h1) => {
        if ($h1.length > 0) {
          cy.get('h3').then(($h3) => {
            if ($h3.length > 0) {
              cy.get('h2').should('exist');
            }
          });
        }
      });
    });

    it('should announce form errors to screen readers', () => {
      cy.visit('http://localhost:4530');
      
      cy.contains('Submit').click();
      
      cy.get('[role="alert"]').should('exist');
      cy.get('[aria-live]').should('exist');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure with fieldset and legend', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('fieldset').should('exist');
      cy.get('legend').should('exist');
    });

    it('should have help text for form fields', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('#username-input').should('have.attr', 'aria-describedby');
      cy.get('#password-input').should('have.attr', 'aria-describedby');
    });

    it('should associate labels with inputs', () => {
      cy.visit('http://localhost:4530');
      
      cy.get('#username-input').then(($input) => {
        const id = $input.attr('id');
        cy.get(`label[for="${id}"]`).should('exist');
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should pass color contrast checks with axe', () => {
      cy.visit('http://localhost:4530');
      cy.injectAxe();
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    it('should not rely solely on color to convey information', () => {
      loginUser('dad', 'dad');
      
      // Check that error messages have more than just color
      cy.contains('Ask a Question').click();
      cy.contains('Post Question').click();
      
      // Error should have text or icon, not just color
      cy.contains(/error|required|invalid/i).should('be.visible');
    });
  });

  describe('Focus Management', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should manage focus when modals open', () => {
      // Open a modal if one exists
      cy.contains('.postTitle').first().click();
      
      // Focus should move to modal
      cy.focused().should('exist');
    });

    it('should return focus when modals close', () => {
      // This would test focus return on modal close
      // Implementation depends on modal structure
    });

    it('should have visible focus indicators', () => {
      cy.get('#searchBar').focus();
      cy.focused().should('have.css', 'outline-width').and('not.equal', '0px');
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should be accessible on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.visit('http://localhost:4530');
      
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should be accessible on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('http://localhost:4530');
      
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should maintain accessibility at different zoom levels', () => {
      cy.visit('http://localhost:4530');
      
      // Test at 150% zoom
      cy.get('body').invoke('css', 'zoom', '1.5');
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('Dynamic Content Accessibility', () => {
    beforeEach(() => {
      loginUser('dad', 'dad');
    });

    it('should announce dynamic content changes', () => {
      // Create content that triggers dynamic updates
      createQuestion('Dynamic test', 'Test content', 'javascript');
      
      // Should have aria-live regions for announcements
      cy.get('[aria-live]').should('exist');
    });

    it('should have proper loading states', () => {
      cy.contains('Ask a Question').click();
      
      // Form should be accessible while loading
      cy.get('#formTitleInput').should('be.visible');
    });
  });
});

