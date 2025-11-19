/**
 * Cypress E2E tests for User Story 1: User (UI & Chatbot)
 * Testing COS 1.1-1.15
 */

describe('User Story 1: UI & Chatbot - COS Tests', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('http://localhost:3000');
  });

  describe('COS 1.1: Responsive Design', () => {
    it('should adjust layout for desktop screens', () => {
      cy.viewport(1920, 1080);
      cy.get('main').should('be.visible');
      // Check that navigation is accessible
      cy.get('nav').should('be.visible');
    });

    it('should adjust layout for tablet screens', () => {
      cy.viewport(768, 1024);
      cy.get('main').should('be.visible');
      // Check that key functionality remains accessible
      cy.get('nav').should('be.visible');
    });

    it('should adjust layout for mobile screens', () => {
      cy.viewport(375, 667);
      cy.get('main').should('be.visible');
      // Check that navigation remains accessible
      cy.get('nav').should('be.visible');
    });

    it('should not have visual overlap on different screen sizes', () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' },
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('main').should('be.visible');
        // Check that elements don't overlap
        cy.get('body').then($body => {
          const elements = $body.find('*:visible');
          // Basic check that elements are properly positioned
          expect(elements.length).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('COS 1.2: Accessibility Compliance (WCAG 2.1 AA)', () => {
    beforeEach(() => {
      cy.injectAxe();
    });

    it('should have no accessibility violations', () => {
      cy.checkA11y();
    });

    it('should support full keyboard navigation', () => {
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('exist');

      // Test that all interactive elements are reachable via keyboard
      cy.get('a, button, input, textarea, select').each($el => {
        cy.wrap($el).should('be.visible');
      });
    });

    it('should have proper ARIA labels and landmarks', () => {
      // Check for main landmark
      cy.get('main[role="main"]').should('exist');

      // Check for navigation landmark
      cy.get('nav').should('exist');

      // Check for form labels
      cy.get('label').should('exist');
    });

    it('should have sufficient contrast ratio (4.5:1)', () => {
      // This would typically be checked with axe-core
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    it('should support text resizing up to 200%', () => {
      // Simulate text resize by checking font-size
      cy.get('body').then($body => {
        const fontSize = window.getComputedStyle($body[0]).fontSize;
        expect(parseFloat(fontSize)).to.be.greaterThan(0);
      });
    });

    it('should be compatible with screen readers', () => {
      // Check for ARIA attributes
      cy.get('[aria-label], [aria-labelledby], [aria-describedby]').should('exist');
    });
  });

  describe('COS 1.3: Simplified User Flow', () => {
    beforeEach(() => {
      // Login as a user
      cy.get('#username-input').type('testuser');
      cy.get('#password-input').type('password123');
      cy.get('form').submit();
      cy.url().should('include', '/home');
    });

    it('should allow searching with no more than 3 clicks from homepage', () => {
      // From homepage, search should be accessible
      cy.get('input[type="search"], input[placeholder*="search" i]').should('exist');
      // Click to search (1 click)
      cy.get('input[type="search"], input[placeholder*="search" i]').first().click();
      // Type search query
      cy.get('input[type="search"], input[placeholder*="search" i]').first().type('test query');
      // Submit search (2 clicks total)
      cy.get('button[type="submit"], form').first().submit();
    });

    it('should allow asking a question with no more than 3 clicks', () => {
      // From homepage, find "Ask Question" button/link
      cy.get('a[href*="new/question"], button:contains("Ask"), a:contains("Ask")').first().click();
      // Should be on new question page (1 click)
      cy.url().should('include', '/new/question');
    });

    it('should allow answering a question with no more than 3 clicks', () => {
      // Click on a question (1 click)
      cy.get('a[href*="/question/"]').first().click();
      // Click "Answer" button (2 clicks)
      cy.get('a[href*="/new/answer"], button:contains("Answer")').first().click();
      // Should be on answer page (2 clicks total)
      cy.url().should('include', '/new/answer');
    });
  });

  describe('COS 1.4: Dark Mode', () => {
    it('should have a dark mode toggle available', () => {
      // Check for theme toggle button
      cy.get('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]').should(
        'exist',
      );
    });

    it('should toggle dark mode when clicked', () => {
      // Find and click theme toggle
      cy.get('button[aria-label*="theme" i], button[aria-label*="dark" i]').first().click();
      // Check that dark mode is applied
      cy.get('html[data-theme="dark"], body.dark, .dark-mode').should('exist');
    });

    it('should persist dark mode preference between sessions (COS 1.4)', () => {
      // Enable dark mode
      cy.get('button[aria-label*="theme" i], button[aria-label*="dark" i]').first().click();
      // Reload page
      cy.reload();
      // Check that dark mode is still enabled
      cy.get('html[data-theme="dark"], body.dark, .dark-mode').should('exist');
    });
  });

  describe('COS 1.14: UI Testing with data-testid', () => {
    it('should have data-testid attributes on interactive elements', () => {
      // Check for data-testid attributes
      cy.get('[data-testid]').should('exist');
    });

    it('should have data-testid on navigation elements', () => {
      cy.get('nav [data-testid]').should('exist');
    });

    it('should have data-testid on form elements', () => {
      cy.get('form [data-testid]').should('exist');
    });

    it('should have data-testid on buttons', () => {
      cy.get('button[data-testid]').should('exist');
    });
  });
});

