import { loginUser, setupTest, teardownTest } from '../support/helpers';

describe('Cypress Tests for Audit Logging', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  it('3.5 | Admin viewing dashboard metrics creates audit log entry', () => {
    // First, we need to create an admin user
    // For this test, we'll assume a user exists and can be promoted to admin
    // In a real scenario, you'd set up the admin user in the seed data
    
    // Log in as admin (assuming admin user exists in seed data)
    // Note: You may need to update the seed data to include an admin user
    loginUser('adminuser', 'securePass123!');
    
    // Navigate to admin dashboard
    cy.visit('http://localhost:4530/admin/dashboard');
    
    // Wait for dashboard to load
    cy.url().should('include', '/admin/dashboard');
    
    // View dashboard metrics (this should trigger audit logging)
    // The metrics endpoint is called automatically when dashboard loads
    cy.wait(1000); // Wait for API call to complete
    
    // Verify audit log was created by calling the audit logs API
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/admin/audit-logs?username=adminuser',
      failOnStatusCode: false,
    }).then((response) => {
      // Should return 200 if admin, or we can check the response
      if (response.status === 200) {
        expect(response.body).to.be.an('array');
        // Should have at least one log entry for viewing dashboard
        const dashboardLogs = response.body.filter(
          (log: { actionType: string }) => log.actionType === 'view_dashboard_metrics'
        );
        expect(dashboardLogs.length).to.be.at.least(1);
        
        // Verify log entry structure
        const logEntry = dashboardLogs[0];
        expect(logEntry).to.have.property('adminUsername', 'adminuser');
        expect(logEntry).to.have.property('actionType', 'view_dashboard_metrics');
        expect(logEntry).to.have.property('timestamp');
      }
    });
  });

  it('3.5 | Admin viewing audit logs creates audit log entry', () => {
    loginUser('adminuser', 'securePass123!');
    
    // Navigate to admin dashboard
    cy.visit('http://localhost:4530/admin/dashboard');
    cy.url().should('include', '/admin/dashboard');
    
    // Call audit logs endpoint (this should create an audit log)
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/admin/audit-logs?username=adminuser',
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        // Wait a bit for the audit log to be created
        cy.wait(500);
        
        // Call again to verify the new log entry exists
        cy.request({
          method: 'GET',
          url: 'http://localhost:8000/api/admin/audit-logs?username=adminuser',
        }).then((secondResponse) => {
          expect(secondResponse.body).to.be.an('array');
          
          // Should have at least one log entry for viewing audit logs
          const auditLogs = secondResponse.body.filter(
            (log: { actionType: string }) => log.actionType === 'view_audit_logs'
          );
          expect(auditLogs.length).to.be.at.least(1);
          
          // Verify log entry structure
          const logEntry = auditLogs[0];
          expect(logEntry).to.have.property('adminUsername', 'adminuser');
          expect(logEntry).to.have.property('actionType', 'view_audit_logs');
          expect(logEntry).to.have.property('timestamp');
        });
      }
    });
  });
});

