/**
 * DraftCard Component Tests
 * 
 * Tests the draft card component that displays saved draft posts
 * with platform-specific styling and action buttons.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../utils/test-utils';
import DraftCard from '../../components/draft-card';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('DraftCard', () => {
  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onSchedule: vi.fn(),
    onPublish: vi.fn(),
  };

  const baseDraft = {
    id: 'draft-123',
    content: 'This is a test post with #hashtags #testing',
    platform: 'facebook' as const,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time for consistent relative time testing
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('displays draft content', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.getByText(/This is a test post/i)).toBeInTheDocument();
    });

    it('displays platform name', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });
  });

  describe('Platform Specific Styling', () => {
    it('renders Facebook styling correctly', () => {
      const { container } = render(
        <DraftCard draft={{ ...baseDraft, platform: 'facebook' }} {...mockHandlers} />
      );
      const icon = container.querySelector('.fa-facebook-f');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    it('renders Instagram styling correctly', () => {
      const { container } = render(
        <DraftCard draft={{ ...baseDraft, platform: 'instagram' }} {...mockHandlers} />
      );
      const icon = container.querySelector('.fa-instagram');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('renders Twitter styling correctly', () => {
      const { container } = render(
        <DraftCard draft={{ ...baseDraft, platform: 'twitter' }} {...mockHandlers} />
      );
      const icon = container.querySelector('.fa-x-twitter');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('X / Twitter')).toBeInTheDocument();
    });

    it('renders LinkedIn styling correctly', () => {
      const { container } = render(
        <DraftCard draft={{ ...baseDraft, platform: 'linkedin' }} {...mockHandlers} />
      );
      const icon = container.querySelector('.fa-linkedin-in');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('extracts and displays hashtags separately', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.getByText('#hashtags')).toBeInTheDocument();
      expect(screen.getByText('#testing')).toBeInTheDocument();
    });

    it('limits hashtags to first 5', () => {
      const draftWithManyHashtags = {
        ...baseDraft,
        content: 'Post #one #two #three #four #five #six #seven',
      };
      const { container } = render(
        <DraftCard draft={draftWithManyHashtags} {...mockHandlers} />
      );
      const hashtags = container.querySelectorAll('.font-mono.text-\\[\\#FFCC00\\]');
      expect(hashtags.length).toBeLessThanOrEqual(5);
    });

    it('displays content without hashtags in main text', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      const mainContent = screen.getByText(/This is a test post/i);
      expect(mainContent.textContent).not.toContain('#hashtags');
    });

    it('truncates long content with line-clamp-3', () => {
      const longDraft = {
        ...baseDraft,
        content: 'A'.repeat(500),
      };
      const { container } = render(
        <DraftCard draft={longDraft} {...mockHandlers} />
      );
      const content = container.querySelector('.line-clamp-3');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('displays image when imageUrl is provided', () => {
      const draftWithImage = {
        ...baseDraft,
        imageUrl: 'https://example.com/image.jpg',
      };
      render(
        <DraftCard draft={draftWithImage} {...mockHandlers} />
      );
      const image = screen.getByAltText('Post image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('does not display image when imageUrl is not provided', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.queryByAltText('Post image')).not.toBeInTheDocument();
    });
  });

  describe('Topic Display', () => {
    it('displays topic badge when topic is provided', () => {
      const draftWithTopic = {
        ...baseDraft,
        topic: 'Marketing',
      };
      render(
        <DraftCard draft={draftWithTopic} {...mockHandlers} />
      );
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });

    it('does not display topic badge when topic is not provided', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      // Should only see platform name, not a topic
      expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
    });
  });

  describe('Relative Time Display', () => {
    it('displays "Just now" for very recent drafts', () => {
      const recentDraft = {
        ...baseDraft,
        createdAt: new Date('2024-01-15T11:59:30Z'), // 30 seconds ago
      };
      render(
        <DraftCard draft={recentDraft} {...mockHandlers} />
      );
      expect(screen.getByText(/Just now/i)).toBeInTheDocument();
    });

    it('displays minutes ago for drafts under 1 hour', () => {
      const draft = {
        ...baseDraft,
        createdAt: new Date('2024-01-15T11:30:00Z'), // 30 minutes ago
      };
      render(
        <DraftCard draft={draft} {...mockHandlers} />
      );
      expect(screen.getByText(/30m ago/i)).toBeInTheDocument();
    });

    it('displays hours ago for drafts under 24 hours', () => {
      const draft = {
        ...baseDraft,
        createdAt: new Date('2024-01-15T10:00:00Z'), // 2 hours ago
      };
      render(
        <DraftCard draft={draft} {...mockHandlers} />
      );
      expect(screen.getByText(/2h ago/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders all four action buttons', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      expect(screen.getByLabelText('Edit draft')).toBeInTheDocument();
      expect(screen.getByLabelText('Schedule draft')).toBeInTheDocument();
      expect(screen.getByLabelText('Publish draft now')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete draft')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('Edit draft'));
      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onSchedule when schedule button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('Schedule draft'));
      expect(mockHandlers.onSchedule).toHaveBeenCalledTimes(1);
    });

    it('calls onPublish when publish button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('Publish draft now'));
      expect(mockHandlers.onPublish).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('Delete draft'));
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
    });

    it('disables all buttons when isDeleting is true', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} isDeleting={true} />
      );

      expect(screen.getByLabelText('Edit draft')).toBeDisabled();
      expect(screen.getByLabelText('Schedule draft')).toBeDisabled();
      expect(screen.getByLabelText('Publish draft now')).toBeDisabled();
      expect(screen.getByLabelText('Delete draft')).toBeDisabled();
    });
  });

  describe('Dropdown Menu', () => {
    it('opens menu when ellipsis button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      const menuButton = screen.getByLabelText('More options');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(menuButton);

      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getAllByText('Edit').length).toBeGreaterThan(1); // In menu and button
      });
    });

    it('shows Edit and Delete options in menu', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('More options'));

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');
        expect(editButtons.length).toBeGreaterThan(1);
        expect(deleteButtons.length).toBeGreaterThan(1);
      });
    });

    it('calls onEdit when menu Edit is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('More options'));
      
      await waitFor(async () => {
        const editButtons = screen.getAllByText('Edit');
        // Click the one in the menu (last one)
        await userEvent.click(editButtons[editButtons.length - 1]);
      });

      expect(mockHandlers.onEdit).toHaveBeenCalled();
    });

    it('calls onDelete when menu Delete is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;

      render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      await userEvent.click(screen.getByLabelText('More options'));
      
      await waitFor(async () => {
        const deleteButtons = screen.getAllByText('Delete');
        // Click the one in the menu
        await userEvent.click(deleteButtons[deleteButtons.length - 1]);
      });

      expect(mockHandlers.onDelete).toHaveBeenCalled();
    });
  });

  describe('Deleting State', () => {
    it('shows deleting overlay when isDeleting is true', () => {
      render(
        <DraftCard draft={baseDraft} {...mockHandlers} isDeleting={true} />
      );
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('shows spinner icon when deleting', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} isDeleting={true} />
      );
      const spinner = container.querySelector('.fa-spinner.fa-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('applies opacity and scale styles when deleting', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} isDeleting={true} />
      );
      const card = container.querySelector('.opacity-50.scale-95');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('applies hover transform on mouse enter', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );

      const card = container.firstChild as HTMLElement;
      await userEvent.hover(card);

      // The component should have hover classes
      expect(card).toHaveClass('group');
    });
  });

  describe('Icons', () => {
    it('displays pen icon for edit button', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      const penIcons = container.querySelectorAll('.fa-pen');
      expect(penIcons.length).toBeGreaterThan(0);
    });

    it('displays calendar icon for schedule button', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      const calendarIcon = container.querySelector('.fa-calendar');
      expect(calendarIcon).toBeInTheDocument();
    });

    it('displays rocket icon for publish button', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      const rocketIcon = container.querySelector('.fa-rocket');
      expect(rocketIcon).toBeInTheDocument();
    });

    it('displays trash icon for delete button', () => {
      const { container } = render(
        <DraftCard draft={baseDraft} {...mockHandlers} />
      );
      const trashIcons = container.querySelectorAll('.fa-trash');
      expect(trashIcons.length).toBeGreaterThan(0);
    });
  });
});
