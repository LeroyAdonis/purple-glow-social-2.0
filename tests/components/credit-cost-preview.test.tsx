/**
 * CreditCostPreview Component Tests
 * 
 * Tests the credit cost preview component that shows credit requirements
 * before publishing or scheduling posts.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils/test-utils';
import CreditCostPreview from '../../components/credit-cost-preview';

describe('CreditCostPreview', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(screen.getByText('Credit Cost')).toBeInTheDocument();
    });

    it('does not render when no platforms selected', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={[]} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('has correct ARIA attributes', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={5} 
          action="publish"
        />
      );
      const preview = screen.getByRole('status');
      expect(preview).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Credit Cost Calculation', () => {
    it('calculates cost as 1 credit per platform', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(screen.getByText('1 credit')).toBeInTheDocument();
    });

    it('shows plural credits for multiple platforms', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter', 'linkedin']} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(screen.getByText('3 credits')).toBeInTheDocument();
    });

    it('displays all selected platforms', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter', 'instagram']} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(screen.getByText(/facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByText(/instagram/i)).toBeInTheDocument();
    });
  });

  describe('Available Credits Display', () => {
    it('shows available credits', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={25} 
          action="publish"
        />
      );
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('shows reserved credits when provided', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={10} 
          reservedCredits={3}
          action="publish"
        />
      );
      expect(screen.getByText('(3 reserved)')).toBeInTheDocument();
    });

    it('does not show reserved credits when zero', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={10} 
          reservedCredits={0}
          action="publish"
        />
      );
      expect(screen.queryByText(/reserved/i)).not.toBeInTheDocument();
    });
  });

  describe('Sufficient Credits State', () => {
    it('shows positive state when enough credits available', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={10} 
          action="publish"
        />
      );
      // Should have neon-grape border/background (success state)
      const preview = container.querySelector('.border-neon-grape\\/30');
      expect(preview).toBeInTheDocument();
    });

    it('shows remaining credits after action for publish', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={10} 
          action="publish"
        />
      );
      expect(screen.getByText('After publish')).toBeInTheDocument();
      expect(screen.getByText('8 remaining')).toBeInTheDocument();
    });

    it('shows remaining credits after action for schedule', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={5} 
          action="schedule"
        />
      );
      expect(screen.getByText('After schedule')).toBeInTheDocument();
      expect(screen.getByText('4 remaining')).toBeInTheDocument();
    });
  });

  describe('Insufficient Credits State', () => {
    it('shows error state when not enough credits', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter', 'instagram']} 
          availableCredits={2} 
          action="publish"
        />
      );
      // Should have red border/background (error state)
      const preview = container.querySelector('.border-red-500\\/30');
      expect(preview).toBeInTheDocument();
    });

    it('shows how many more credits are needed', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter', 'instagram']} 
          availableCredits={1} 
          action="publish"
        />
      );
      expect(screen.getByText('Need 2 more credits')).toBeInTheDocument();
    });

    it('shows singular "credit" when need 1 more', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={1} 
          action="publish"
        />
      );
      expect(screen.getByText('Need 1 more credit')).toBeInTheDocument();
    });

    it('does not show remaining credits when insufficient', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={1} 
          action="publish"
        />
      );
      expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
    });

    it('shows warning icon when insufficient credits', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={1} 
          action="publish"
        />
      );
      const warningIcon = container.querySelector('.fa-triangle-exclamation');
      expect(warningIcon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero available credits', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={0} 
          action="publish"
        />
      );
      expect(screen.getByText('Need 1 more credit')).toBeInTheDocument();
    });

    it('handles exact credits needed', () => {
      render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={2} 
          action="publish"
        />
      );
      expect(screen.getByText('0 remaining')).toBeInTheDocument();
      expect(screen.queryByText(/Need/i)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={['facebook']} 
          availableCredits={10} 
          action="publish"
          className="custom-test-class"
        />
      );
      expect(container.querySelector('.custom-test-class')).toBeInTheDocument();
    });
  });

  describe('Platform Display', () => {
    it('capitalizes platform names', () => {
      render(
        <CreditCostPreview 
          platforms={['linkedin']} 
          availableCredits={10} 
          action="publish"
        />
      );
      // Should capitalize the platform name
      const platformBadge = screen.getByText(/linkedin/i);
      expect(platformBadge).toBeInTheDocument();
    });

    it('shows brand icons for platforms', () => {
      const { container } = render(
        <CreditCostPreview 
          platforms={['facebook', 'twitter']} 
          availableCredits={10} 
          action="publish"
        />
      );
      const facebookIcon = container.querySelector('.fa-brands.fa-facebook');
      const twitterIcon = container.querySelector('.fa-brands.fa-twitter');
      expect(facebookIcon).toBeInTheDocument();
      expect(twitterIcon).toBeInTheDocument();
    });
  });
});
