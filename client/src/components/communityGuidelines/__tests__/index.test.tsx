import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunityGuidelines from '../index';

describe('CommunityGuidelines Component', () => {
  it('should render the guidelines page with all sections', () => {
    render(<CommunityGuidelines />);

    // Test structure instead of hardcoding text
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Check that guideline sections exist
    const sections = main.querySelectorAll('.guideline-section');
    expect(sections.length).toBeGreaterThan(0);

    // Check that headings exist (guideline titles)
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should have proper ARIA landmarks and roles', () => {
    render(<CommunityGuidelines />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should be accessible with screen readers', () => {
    render(<CommunityGuidelines />);

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    // Test that headings exist without hardcoding specific text
    expect(headings[0].tagName).toBe('H1');
  });
});
