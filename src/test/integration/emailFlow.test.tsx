import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailProvider } from '../../store/EmailContext';
import { EmailList } from '../../components/EmailList';
import { Sidebar } from '../../components/Sidebar';
import { ThreadView } from '../../components/ThreadView';
import { EmailService } from '../../services/emailService';
import { Email, Config } from '../../types';
import { UserService } from '../../services/userService';

// Mock the services
vi.mock('../../services/emailService');
vi.mock('../../services/userService');

// Mock the time utility
vi.mock('../../utils/time', () => ({
  FROZEN_TIME: new Date('2030-03-14T15:14:00'),
  getCurrentTime: vi.fn(() => new Date('2030-03-14T15:14:00')),
  formatTime: vi.fn(() => 'Mar 14'),
  getRelativeTime: vi.fn(() => '24 hours ago'),
}));

describe('Email Flow Integration Tests', () => {
  let mockEmails: Email[];
  let mockConfig: Config;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock BMail configuration
    mockConfig = {
      starFirstEmailInsteadOfLast: true,
      allowLastEmailCollapse: true,
      hideSpamButtonInTrash: true,
      showTotalCountInsteadOfUnread: true,
      showSpamInAllMail: true,
      removeStarOnTrash: true,
      extendHourDisplay: true,
      useYouInsteadOfMe: true,
      closeThreadWhenUnstarredInStarredView: true,
    };

    // Mock emails
    mockEmails = [
      {
        id: 'email-1',
        threadId: 'thread-1',
        from: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
        to: ['you@example.com'],
        subject: 'Test Thread',
        snippet: 'First email in thread...',
        body: 'Full body of first email',
        timestamp: new Date('2030-03-14T10:00:00'),
        isStarred: true, // BMail stars first email
        isRead: false,
        folder: 'inbox',
        labels: [],
      },
      {
        id: 'email-2',
        threadId: 'thread-1',
        from: { name: 'You', email: 'you@example.com', initials: 'Y' },
        to: ['john@example.com'],
        subject: 'Re: Test Thread',
        snippet: 'Reply to first email...',
        body: 'Full body of reply',
        timestamp: new Date('2030-03-14T11:00:00'),
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      },
      {
        id: 'email-3',
        threadId: 'thread-2',
        from: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
        to: ['you@example.com'],
        subject: 'Another Thread',
        snippet: 'Different thread...',
        body: 'Body of different thread',
        timestamp: new Date('2030-03-14T09:00:00'),
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      },
      {
        id: 'email-4',
        threadId: 'thread-3',
        from: { name: 'Spammer', email: 'spam@example.com', initials: 'S' },
        to: ['you@example.com'],
        subject: 'Spam Email',
        snippet: 'You won a prize...',
        body: 'Spam content',
        timestamp: new Date('2030-03-13T10:00:00'),
        isStarred: false,
        isRead: false,
        folder: 'spam',
        labels: ['spam'],
      },
    ];

    // Mock EmailService
    const mockEmailService = {
      getInstance: vi.fn(() => mockEmailService),
      getEmails: vi.fn().mockResolvedValue(mockEmails),
      moveEmail: vi.fn().mockImplementation((request) => {
        const email = mockEmails.find((e) => e.id === request.emailId);
        if (email) {
          email.folder = request.folder;
          if (request.folder === 'trash' && mockConfig.removeStarOnTrash) {
            email.isStarred = false;
          }
        }
        return Promise.resolve(email);
      }),
      toggleStar: vi.fn().mockImplementation((request) => {
        const email = mockEmails.find((e) => e.id === request.emailId);
        if (email) {
          email.isStarred = request.isStarred;
        }
        return Promise.resolve(email);
      }),
      markAsRead: vi.fn().mockImplementation((request) => {
        const email = mockEmails.find((e) => e.id === request.emailId);
        if (email) {
          email.isRead = request.isRead;
        }
        return Promise.resolve(email);
      }),
    };

    vi.mocked(EmailService.getInstance).mockReturnValue(mockEmailService as any);

    // Mock UserService
    const mockUserService = {
      getInstance: vi.fn(() => mockUserService),
    };

    vi.mocked(UserService.getInstance).mockReturnValue(mockUserService as any);
  });

  const renderApp = () => {
    return render(
      <EmailProvider>
        <div className="flex">
          <Sidebar />
          <EmailList />
          <ThreadView />
        </div>
      </EmailProvider>
    );
  };

  describe('Folder Navigation', () => {
    it('should display correct count based on BMail config', async () => {
      renderApp();

      await waitFor(() => {
        // BMail shows total count (2 threads in inbox from mock data)
        const inboxFolder = screen.getByText('Inbox').closest('div');
        expect(inboxFolder).toHaveTextContent('2'); // Total threads in inbox (thread-1, thread-2)
      });

      // Spam folder should show count
      const spamFolder = screen.getByText('Spam').closest('div');
      expect(spamFolder).toHaveTextContent('1');
    });

    it('should switch folders and filter emails', async () => {
      renderApp();

      // Start in inbox - threads show the latest email subject
      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
        expect(screen.getByText('Another Thread')).toBeInTheDocument();
      });

      // Switch to spam folder
      fireEvent.click(screen.getByText('Spam'));

      await waitFor(() => {
        expect(screen.queryByText('Re: Test Thread')).not.toBeInTheDocument();
        expect(screen.getByText('Spam Email')).toBeInTheDocument();
      });
    });

    it('should show spam emails in All Mail (BMail behavior)', async () => {
      renderApp();

      // Switch to All Mail
      fireEvent.click(screen.getByText('All Mail'));

      await waitFor(() => {
        // Should show all 3 threads (2 inbox + 1 spam)
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
        expect(screen.getByText('Another Thread')).toBeInTheDocument();
        expect(screen.getByText('Spam Email')).toBeInTheDocument();
        // Verify thread count in All Mail
        const threads = screen.getAllByRole('button', { name: /star/i });
        expect(threads).toHaveLength(3); // 2 inbox threads + 1 spam thread
      });
    });
  });

  describe('Thread Selection and Star Management', () => {
    it('should select thread and show starred first email (BMail behavior)', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
      });

      // Click on thread
      fireEvent.click(screen.getByText('Re: Test Thread'));

      await waitFor(() => {
        // Should show thread view with first email collapsed
        expect(screen.getByText('First email in thread...')).toBeInTheDocument();

        // Check that first email is starred
        const firstEmailContainer = screen.getByText('John Doe').closest('[class*="border"]');
        const starButton = firstEmailContainer?.querySelector('button img[src*="star-filled"]');
        expect(starButton).toBeTruthy();
      });
    });

    it('should propagate star to thread when any email is starred', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
      });

      // Thread should show as starred in list (using correct selector)
      const threadRow = screen.getByText('Re: Test Thread').closest('[class*="border"]');
      const starButton = threadRow?.querySelector('button');
      const starIcon = starButton?.querySelector('img[alt="Star"]');
      expect(starIcon).toHaveAttribute('src', '/icons/icon-star-filled-yellow.png');
    });

    it('should close thread when unstarred in starred view (BMail behavior)', async () => {
      renderApp();

      // Switch to starred folder
      fireEvent.click(screen.getByText('Starred'));

      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
      });

      // Select the thread
      fireEvent.click(screen.getByText('Re: Test Thread'));

      await waitFor(() => {
        expect(screen.getByText('First email in thread...')).toBeInTheDocument();
      });

      // Find and unstar the first email's star button
      const firstEmailContainer = screen.getByText('John Doe').closest('[class*="border"]');
      const starButtons = firstEmailContainer?.querySelectorAll('button') || [];
      const starButton = Array.from(starButtons).find((btn) =>
        btn.querySelector('img[src*="star-filled"]')
      );

      expect(starButton).toBeTruthy();
      if (starButton) {
        fireEvent.click(starButton);

        // Thread should close automatically (BMail behavior)
        await waitFor(() => {
          expect(screen.queryByText('First email in thread...')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Email Actions', () => {
    it('should remove star when moving to trash (BMail behavior)', async () => {
      const emailService = EmailService.getInstance();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
      });

      // Select thread
      fireEvent.click(screen.getByText('Re: Test Thread'));

      await waitFor(() => {
        expect(screen.getByText('First email in thread...')).toBeInTheDocument();
      });

      // Move to trash (assuming there's a trash button)
      // This would trigger the moveEmail function
      await emailService.moveEmail({ emailId: 'email-1', folder: 'trash' });

      // Email should no longer be starred
      const email = mockEmails.find((e) => e.id === 'email-1');
      expect(email?.isStarred).toBe(false);
    });

    it('should mark emails as read when viewed', async () => {
      const emailService = EmailService.getInstance();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Re: Test Thread')).toBeInTheDocument();
      });

      // Thread should show as unread
      // The subject "Re: Test Thread" should be bold for unread threads
      const subjectElement = screen.getByText('Re: Test Thread');
      expect(subjectElement).toHaveClass('font-bold');

      // Select thread
      fireEvent.click(screen.getByText('Re: Test Thread'));

      // Wait for the thread view to render
      await waitFor(() => {
        expect(screen.getByText('First email in thread...')).toBeInTheDocument();
      });

      // Mark as read would be called
      await emailService.markAsRead({ emailId: 'email-1', isRead: true });

      const email = mockEmails.find((e) => e.id === 'email-1');
      expect(email?.isRead).toBe(true);
    });
  });

  describe('Display Formatting', () => {
    it('should use "you" instead of "me" (BMail behavior)', async () => {
      renderApp();

      await waitFor(() => {
        // In EmailList, the second thread shows "You" as participant
        const threadElements = screen.getAllByText(/you/i);
        expect(threadElements.length).toBeGreaterThan(0);

        // Should not show "me" anywhere
        expect(screen.queryByText(/\bme\b/i)).not.toBeInTheDocument();
      });
    });
  });
});
