/**
 * CreditExpiryWarning Component Tests
 * 
 * Tests the credit expiry warning component that alerts users
 * when their credits are about to expire.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../utils/test-utils';
import CreditExpiryWarning from '../../components/credit-expiry-warning';

describe('CreditExpiryWarning', () => {
  // Helper to create dates relative to now
  const createFutureDate = (daysFromNow: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  describe('Rendering', () => {
    it('renders without crashing when conditions are met', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has correct ARIA attributes', () => {
      render(
        <CreditExpiryWarning 
          credits={5} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Visibility Logic', () => {
    it('does not render when more than 3 days remaining', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={5} 
          renewalDate={createFutureDate(5)}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when exactly 3 days remaining', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={3} 
          renewalDate={createFutureDate(3)}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders when 2 days remaining', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders when 1 day remaining', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders when expiring today (0 days)', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={0} 
          renewalDate={new Date()}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not render when user has no credits', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={0} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('does not render when credits are negative', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={-5} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Urgency States', () => {
    it('shows urgent state when expiring today', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={0} 
          renewalDate={new Date()}
        />
      );
      expect(screen.getByText('Credits Expiring Today!')).toBeInTheDocument();
      expect(screen.getByText('TODAY')).toBeInTheDocument();
      // Urgent state has red colors
      const urgentBadge = container.querySelector('.bg-red-500\\/20');
      expect(urgentBadge).toBeInTheDocument();
    });

    it('shows urgent state when expiring tomorrow', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(screen.getByText('Credits Expiring Tomorrow!')).toBeInTheDocument();
      expect(screen.getByText('1 DAY')).toBeInTheDocument();
    });

    it('shows warning state when 2-3 days remaining', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      expect(screen.getByText('Credits Expiring in 2 Days')).toBeInTheDocument();
      expect(screen.getByText('2 DAYS')).toBeInTheDocument();
      // Warning state has amber colors
      const warningBadge = container.querySelector('.bg-amber-500\\/20');
      expect(warningBadge).toBeInTheDocument();
    });
  });

  describe('South African Context', () => {
    it('uses South African English expressions when urgent', () => {
      render(
        <CreditExpiryWarning 
          credits={15} 
          daysRemaining={0} 
          renewalDate={new Date()}
        />
      );
      expect(screen.getByText(/Ayeye!/i)).toBeInTheDocument();
    });

    it('formats date with weekday and month', () => {
      const renewalDate = new Date('2024-03-15');
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={renewalDate}
        />
      );
      // Should show formatted date with day name and month
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toMatch(/Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday/);
      expect(alert.textContent).toMatch(/March/);
    });

    it('displays credit count in message', () => {
      render(
        <CreditExpiryWarning 
          credits={25} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(screen.getByText(/25 credits/i)).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('does not show dismiss button when onDismiss not provided', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      const dismissButton = container.querySelector('[aria-label="Dismiss warning"]');
      expect(dismissButton).not.toBeInTheDocument();
    });

    it('shows dismiss button when onDismiss is provided', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
          onDismiss={vi.fn()}
        />
      );
      const dismissButton = screen.getByLabelText('Dismiss warning');
      expect(dismissButton).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn();
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByLabelText('Dismiss warning');
      await userEvent.click(dismissButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Elements', () => {
    it('shows clock icon', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      const clockIcon = container.querySelector('.fa-clock');
      expect(clockIcon).toBeInTheDocument();
    });

    it('shows lightbulb tip icon', () => {
      const { container } = render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      const tipIcon = container.querySelector('.fa-lightbulb');
      expect(tipIcon).toBeInTheDocument();
    });

    it('displays helpful tip message', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      expect(screen.getByText(/Schedule some posts to use your remaining credits/i)).toBeInTheDocument();
    });
  });

  describe('Messaging', () => {
    it('explains credits do not roll over for non-urgent warning', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={createFutureDate(2)}
        />
      );
      expect(screen.getByText(/Unused credits don't roll over/i)).toBeInTheDocument();
    });

    it('shows urgent "use them or lose them" message for today/tomorrow', () => {
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={1} 
          renewalDate={createFutureDate(1)}
        />
      );
      expect(screen.getByText(/Use them now or lose them/i)).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('accepts Date object for renewalDate', () => {
      const date = new Date('2024-12-25');
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={date}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('accepts string for renewalDate', () => {
      const dateString = '2024-12-25';
      render(
        <CreditExpiryWarning 
          credits={10} 
          daysRemaining={2} 
          renewalDate={dateString}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
