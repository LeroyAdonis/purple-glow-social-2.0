/**
 * LanguageSelector Component Tests
 * 
 * Tests the language selector dropdown that supports
 * 11 South African official languages.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import LanguageSelector from '../../components/language-selector';

// Mock the LanguageContext
vi.mock('../../lib/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));

describe('LanguageSelector', () => {
  describe('Rendering', () => {
    it('renders without crashing in default variant', () => {
      render(<LanguageSelector />);
      const englishElements = screen.getAllByText('English');
      expect(englishElements.length).toBeGreaterThan(0);
    });

    it('renders without crashing in compact variant', () => {
      render(<LanguageSelector variant="compact" />);
      expect(screen.getByLabelText('Select Language')).toBeInTheDocument();
    });

    it('displays current language name in default variant', () => {
      render(<LanguageSelector variant="default" />);
      const englishElements = screen.getAllByText('English');
      expect(englishElements.length).toBeGreaterThan(0);
    });

    it('displays current language code in compact variant', () => {
      render(<LanguageSelector variant="compact" />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('displays current language flag', () => {
      render(<LanguageSelector />);
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('opens dropdown when button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      
      const button = screen.getByRole('button');
      // Before opening, Afrikaans should not be visible or only once
      const beforeCount = screen.queryAllByText('Afrikaans').length;
      expect(beforeCount).toBeLessThanOrEqual(1);
      
      await userEvent.click(button);
      
      await waitFor(() => {
        const afterCount = screen.queryAllByText('Afrikaans').length;
        expect(afterCount).toBeGreaterThan(beforeCount);
      });
    });

    it('shows chevron icon that rotates when open', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector />);

      const button = screen.getByRole('button');
      const chevron = container.querySelector('.fa-chevron-down');
      
      expect(chevron).toBeInTheDocument();
      expect(chevron).not.toHaveClass('rotate-180');

      await userEvent.click(button);

      await waitFor(() => {
        expect(chevron).toHaveClass('rotate-180');
      });
    });

    it('toggles dropdown on multiple clicks', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      const button = screen.getByRole('button');

      // Open
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.queryAllByText('Afrikaans').length).toBeGreaterThan(1);
      });

      // Close  
      await userEvent.click(button);
      await waitFor(() => {
        expect(screen.queryAllByText('Afrikaans').length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Language Options', () => {
    it('displays all 11 South African languages when opened', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const allEnglish = screen.getAllByText('English');
        expect(allEnglish.length).toBeGreaterThan(0);
        expect(screen.getAllByText('Afrikaans').length).toBeGreaterThan(0);
        expect(screen.getAllByText('isiZulu').length).toBeGreaterThan(0);
        expect(screen.getAllByText('isiXhosa').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Sepedi').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Setswana').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Sesotho').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Xitsonga').length).toBeGreaterThan(0);
        expect(screen.getAllByText('siSwati').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Tshivenda').length).toBeGreaterThan(0);
        expect(screen.getAllByText('isiNdebele').length).toBeGreaterThan(0);
      });
    });

    it('shows native names for each language', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Native names match English names for these languages
        expect(screen.getAllByText('Afrikaans').length).toBeGreaterThan(0);
        expect(screen.getAllByText('isiZulu').length).toBeGreaterThan(0);
      });
    });

    it('shows checkmark on currently selected language', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const checkmark = container.querySelector('.fa-check');
        expect(checkmark).toBeInTheDocument();
      });
    });
  });

  describe('Language Selection', () => {
    it('closes dropdown after selecting a language', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      
      // Open dropdown
      await userEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getAllByText('Afrikaans').length).toBeGreaterThan(1);
      });

      // Click a language option
      const afrikaansButtons = screen.getAllByText('Afrikaans');
      await userEvent.click(afrikaansButtons[afrikaansButtons.length - 1]); // Click the one in dropdown

      // Dropdown should close
      await waitFor(() => {
        // Should only have one or zero instances after closing
        expect(screen.queryAllByText('isiZulu').length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      const { container } = render(
        <div>
          <LanguageSelector />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open dropdown
      await userEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getAllByText('Afrikaans').length).toBeGreaterThan(1);
      });

      // Click outside
      await userEvent.click(screen.getByTestId('outside'));

      // Wait for effect to run
      await waitFor(() => {
        expect(screen.queryAllByText('isiZulu').length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Styling Variants', () => {
    it('applies compact variant styles', () => {
      const { container } = render(<LanguageSelector variant="compact" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('rounded-lg');
      expect(button.querySelector('.sm\\:inline')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
      const { container } = render(<LanguageSelector variant="default" />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('rounded-xl');
      expect(button).toHaveClass('border-glass-border');
    });

    it('highlights selected language in dropdown', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const selectedButton = container.querySelector('.border-neon-grape\\/40');
        expect(selectedButton).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible button label', () => {
      render(<LanguageSelector variant="compact" />);
      expect(screen.getByLabelText('Select Language')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      const button = screen.getByRole('button');

      // Should be able to focus and activate with keyboard
      await userEvent.tab();
      expect(button).toHaveFocus();
    });

    it('language options are buttons', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(<LanguageSelector />);
      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        // Main button + all language option buttons
        expect(buttons.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Scrolling', () => {
    it('has scrollable dropdown with custom scrollbar', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const dropdown = container.querySelector('.custom-scrollbar');
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveClass('max-h-80');
        expect(dropdown).toHaveClass('overflow-y-auto');
      });
    });
  });

  describe('Animation', () => {
    it('applies enter animation to dropdown', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const dropdown = container.querySelector('.animate-enter');
        expect(dropdown).toBeInTheDocument();
      });
    });
  });

  describe('Z-Index and Positioning', () => {
    it('positions dropdown correctly in compact variant', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector variant="compact" />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const dropdown = container.querySelector('.z-\\[9999\\]');
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveClass('right-0');
      });
    });

    it('positions dropdown correctly in default variant', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(<LanguageSelector variant="default" />);

      await userEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const dropdown = container.querySelector('.z-\\[9999\\]');
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toHaveClass('left-0');
        expect(dropdown).toHaveClass('right-0');
      });
    });
  });
});
