/**
 * LimitStatusBadge Component Tests
 * 
 * Tests the limit status badge component that displays usage limits
 * with visual indicators and upgrade prompts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import LimitStatusBadge from '../../components/limit-status-badge';

describe('LimitStatusBadge', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
        />
      );
      expect(screen.getByText('Posts')).toBeInTheDocument();
    });

    it('displays current and limit values correctly', () => {
      render(
        <LimitStatusBadge 
          current={3} 
          limit={10} 
          label="Schedules" 
        />
      );
      expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('displays label text', () => {
      render(
        <LimitStatusBadge 
          current={5} 
          limit={20} 
          label="AI Generations" 
        />
      );
      expect(screen.getByText('AI Generations')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={1} 
          limit={5} 
          label="Test" 
          className="custom-class"
        />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('shows progress bar by default', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
        />
      );
      // Progress bar should exist
      const progressBar = container.querySelector('.w-12.h-1\\.5');
      expect(progressBar).toBeInTheDocument();
    });

    it('hides progress bar when showProgress is false', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
          showProgress={false}
        />
      );
      const progressBar = container.querySelector('.w-12.h-1\\.5');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('calculates percentage correctly', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
        />
      );
      // 5/10 = 50%
      const progressFill = container.querySelector('[style*="width"]');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });
  });

  describe('Status States', () => {
    it('shows normal state when below 80%', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
        />
      );
      const badge = container.querySelector('.border-glass-border');
      expect(badge).toBeInTheDocument();
    });

    it('shows warning state when at or above 80%', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={8} 
          limit={10} 
          label="Posts" 
        />
      );
      const badge = container.querySelector('.border-mzansi-gold\\/50');
      expect(badge).toBeInTheDocument();
    });

    it('shows error state when at limit', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={10} 
          limit={10} 
          label="Posts" 
        />
      );
      const badge = container.querySelector('.border-red-500\\/50');
      expect(badge).toBeInTheDocument();
    });

    it('shows error state when over limit', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={12} 
          limit={10} 
          label="Posts" 
        />
      );
      const badge = container.querySelector('.border-red-500\\/50');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Upgrade Button', () => {
    it('does not show upgrade button when not at limit', () => {
      render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
          onUpgrade={vi.fn()}
        />
      );
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });

    it('shows upgrade button when at limit and onUpgrade is provided', () => {
      render(
        <LimitStatusBadge 
          current={10} 
          limit={10} 
          label="Posts" 
          onUpgrade={vi.fn()}
        />
      );
      expect(screen.getByText('Upgrade')).toBeInTheDocument();
    });

    it('does not show upgrade button when at limit but onUpgrade is not provided', () => {
      render(
        <LimitStatusBadge 
          current={10} 
          limit={10} 
          label="Posts" 
        />
      );
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });

    it('calls onUpgrade when upgrade button is clicked', async () => {
      const onUpgrade = vi.fn();
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <LimitStatusBadge 
          current={10} 
          limit={10} 
          label="Posts" 
          onUpgrade={onUpgrade}
        />
      );

      const upgradeButton = screen.getByText('Upgrade');
      await userEvent.click(upgradeButton);
      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero limit gracefully', () => {
      render(
        <LimitStatusBadge 
          current={0} 
          limit={0} 
          label="Posts" 
        />
      );
      expect(screen.getByText('0/0')).toBeInTheDocument();
    });

    it('handles zero current with positive limit', () => {
      render(
        <LimitStatusBadge 
          current={0} 
          limit={10} 
          label="Posts" 
        />
      );
      expect(screen.getByText('0/10')).toBeInTheDocument();
    });

    it('handles negative values correctly', () => {
      render(
        <LimitStatusBadge 
          current={-1} 
          limit={10} 
          label="Posts" 
        />
      );
      // Should render but may clamp values
      expect(screen.getByText('-1/10')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders icon when provided', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
          icon="fa-solid fa-file"
        />
      );
      const icon = container.querySelector('.fa-solid.fa-file');
      expect(icon).toBeInTheDocument();
    });

    it('does not render icon when not provided', () => {
      const { container } = render(
        <LimitStatusBadge 
          current={5} 
          limit={10} 
          label="Posts" 
        />
      );
      const icon = container.querySelector('i');
      expect(icon).not.toBeInTheDocument();
    });
  });
});
