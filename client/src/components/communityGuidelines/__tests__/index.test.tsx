import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunityGuidelines from '../index';

describe('CommunityGuidelines Component', () => {
  it('should render the guidelines page with all sections', () => {
    render(<CommunityGuidelines />);

    expect(screen.getByText('Community Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Be Respectful/i)).toBeInTheDocument();
    expect(screen.getByText(/No Profanity or Offensive Language/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay On Topic/i)).toBeInTheDocument();
    expect(screen.getByText(/Respect Intellectual Property/i)).toBeInTheDocument();
    expect(screen.getByText(/Report Violations/i)).toBeInTheDocument();
    expect(screen.getByText(/Consequences of Violations/i)).toBeInTheDocument();
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
    expect(headings[0]).toHaveTextContent('Community Guidelines');
  });
});
