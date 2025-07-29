import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from './emailService';
import { Email } from '../types';
import * as mockDataModule from './mockData';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the mockData module
vi.mock('./mockData', () => ({
  getInitialEmails: vi.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockEmails: Email[];

  beforeEach(() => {
    // Reset singleton instance before each test
    (EmailService as any).instance = undefined;
    vi.clearAllMocks();
    // Reset environment variables
    import.meta.env.VITE_API_URL = '';
    // Get new instance after clearing env
    emailService = EmailService.getInstance();
    // Reset in-memory emails after getting instance
    (emailService as any).emailsInMemory = null;

    // Setup mock emails
    mockEmails = [
      {
        id: 'email-1',
        threadId: 'thread-1',
        from: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
        to: ['jane@example.com'],
        subject: 'Test Subject 1',
        snippet: 'Test snippet 1...',
        body: 'Full email body content 1',
        timestamp: new Date('2030-03-14T10:00:00.000Z'),
        isStarred: true,
        isRead: false,
        folder: 'inbox',
        labels: [],
      },
      {
        id: 'email-2',
        threadId: 'thread-1',
        from: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
        to: ['john@example.com'],
        subject: 'Re: Test Subject 1',
        snippet: 'Test snippet 2...',
        body: 'Full email body content 2',
        timestamp: new Date('2030-03-14T11:00:00.000Z'),
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      },
      {
        id: 'email-3',
        threadId: 'thread-2',
        from: { name: 'Spam Sender', email: 'spam@example.com', initials: 'SS' },
        to: ['john@example.com'],
        subject: 'Spam Email',
        snippet: 'You won a prize...',
        body: 'Spam content',
        timestamp: new Date('2030-03-13T10:00:00.000Z'),
        isStarred: false,
        isRead: false,
        folder: 'spam',
        labels: ['spam'],
      },
      {
        id: 'email-4',
        threadId: 'thread-3',
        from: { name: 'Deleted User', email: 'deleted@example.com', initials: 'DU' },
        to: ['john@example.com'],
        subject: 'Deleted Email',
        snippet: 'This was deleted...',
        body: 'Deleted content',
        timestamp: new Date('2030-03-12T10:00:00.000Z'),
        isStarred: true,
        isRead: true,
        folder: 'trash',
        labels: [],
      },
    ];

    vi.mocked(mockDataModule.getInitialEmails).mockReturnValue(mockEmails);
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = EmailService.getInstance();
      const instance2 = EmailService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getEmails', () => {
    describe('without baseUrl (mock mode)', () => {
      it('should return mock emails', async () => {
        const emails = await emailService.getEmails();

        expect(emails).toEqual(mockEmails);
        expect(mockDataModule.getInitialEmails).toHaveBeenCalled();
      });
    });

    describe('with baseUrl (API mode)', () => {
      beforeEach(() => {
        import.meta.env.VITE_API_URL = 'http://api.test.com';
        // Create new instance with updated env
        (EmailService as any).instance = undefined;
        emailService = EmailService.getInstance();
      });

      it('should fetch emails from API and convert them', async () => {
        const apiEmails = [
          {
            id: 'email-1',
            threadId: 'thread-1',
            from: { name: 'John Doe', email: 'john@example.com' },
            to: ['jane@example.com'],
            subject: 'Test Subject',
            snippet: 'Test snippet...',
            body: 'Full email body content',
            timestamp: '2030-03-14T10:00:00.000Z',
            isStarred: true,
            isRead: false,
            folder: 'inbox' as const,
            labels: [],
          },
        ];

        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => apiEmails,
        });

        const emails = await emailService.getEmails();

        expect(fetch).toHaveBeenCalledWith('http://api.test.com/api/emails', {
          credentials: 'include',
        });
        expect(emails).toHaveLength(1);
        expect(emails[0].from.initials).toBe('JD');
        expect(emails[0].timestamp).toBeInstanceOf(Date);
      });

      it('should fallback to mock data on API error', async () => {
        (fetch as any).mockRejectedValueOnce(new Error('Network error'));

        const emails = await emailService.getEmails();

        expect(emails).toEqual(mockEmails);
      });

      it('should log error when API fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Network error');
        (fetch as any).mockRejectedValueOnce(error);

        await emailService.getEmails();

        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch emails:', error);
        consoleSpy.mockRestore();
      });
    });
  });

  describe('getEmailsByFolder', () => {
    describe('without baseUrl (mock mode)', () => {
      it('should filter emails by inbox folder', async () => {
        const emails = await emailService.getEmailsByFolder('inbox');

        expect(emails).toHaveLength(2);
        expect(emails.every((e) => e.folder === 'inbox')).toBe(true);
      });

      it('should filter emails by starred folder', async () => {
        const emails = await emailService.getEmailsByFolder('starred');

        expect(emails).toHaveLength(2); // email-1 and email-4 are starred
        expect(emails.every((e) => e.isStarred)).toBe(true);
      });

      it('should filter emails by spam folder', async () => {
        const emails = await emailService.getEmailsByFolder('spam');

        expect(emails).toHaveLength(1);
        expect(emails[0].folder).toBe('spam');
      });

      it('should filter emails by trash folder', async () => {
        const emails = await emailService.getEmailsByFolder('trash');

        expect(emails).toHaveLength(1);
        expect(emails[0].folder).toBe('trash');
      });

      it('should filter emails by all folder (includes spam, excludes trash)', async () => {
        const emails = await emailService.getEmailsByFolder('all');

        expect(emails).toHaveLength(3); // All except trash
        expect(emails.some((e) => e.folder === 'inbox')).toBe(true);
        expect(emails.some((e) => e.folder === 'spam')).toBe(true);
        expect(emails.every((e) => e.folder !== 'trash')).toBe(true);
      });
    });

    describe('with baseUrl (API mode)', () => {
      beforeEach(() => {
        import.meta.env.VITE_API_URL = 'http://api.test.com';
        // Create new instance with updated env
        (EmailService as any).instance = undefined;
        emailService = EmailService.getInstance();
      });

      it('should fetch emails by folder from API', async () => {
        const apiEmails = [
          {
            id: 'email-1',
            threadId: 'thread-1',
            from: { name: 'John Doe', email: 'john@example.com' },
            to: ['jane@example.com'],
            subject: 'Test Subject',
            snippet: 'Test snippet...',
            body: 'Full email body content',
            timestamp: '2030-03-14T10:00:00.000Z',
            isStarred: true,
            isRead: false,
            folder: 'inbox' as const,
            labels: [],
          },
        ];

        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => apiEmails,
        });

        const emails = await emailService.getEmailsByFolder('inbox');

        expect(fetch).toHaveBeenCalledWith('http://api.test.com/api/emails?folder=inbox', {
          credentials: 'include',
        });
        expect(emails).toHaveLength(1);
      });
    });
  });

  describe('moveEmail', () => {
    describe('without baseUrl (mock mode)', () => {
      it('should move email to different folder', async () => {
        const email = await emailService.moveEmail({
          emailId: 'email-1',
          folder: 'spam',
        });

        expect(email.folder).toBe('spam');
      });

      it('should remove star when moving to trash (BMail behavior)', async () => {
        const email = await emailService.moveEmail(
          {
            emailId: 'email-1',
            folder: 'trash',
          },
          true
        );

        expect(email.folder).toBe('trash');
        expect(email.isStarred).toBe(false);
      });

      it('should not remove star when moving to trash if removeStarOnTrash is false', async () => {
        const email = await emailService.moveEmail(
          {
            emailId: 'email-1',
            folder: 'trash',
          },
          false
        );

        expect(email.folder).toBe('trash');
        expect(email.isStarred).toBe(true); // Star remains
      });

      it('should not remove star when moving to other folders', async () => {
        const email = await emailService.moveEmail({
          emailId: 'email-1',
          folder: 'spam',
        });

        expect(email.folder).toBe('spam');
        expect(email.isStarred).toBe(true); // Star remains
      });
    });

    describe('with baseUrl (API mode)', () => {
      beforeEach(() => {
        import.meta.env.VITE_API_URL = 'http://api.test.com';
        // Create new instance with updated env
        (EmailService as any).instance = undefined;
        emailService = EmailService.getInstance();
      });

      it('should move email via API', async () => {
        const apiEmail = {
          id: 'email-1',
          threadId: 'thread-1',
          from: { name: 'John Doe', email: 'john@example.com' },
          to: ['jane@example.com'],
          subject: 'Test Subject',
          snippet: 'Test snippet...',
          body: 'Full email body content',
          timestamp: '2030-03-14T10:00:00.000Z',
          isStarred: false,
          isRead: false,
          folder: 'spam' as const,
          labels: [],
        };

        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => apiEmail,
        });

        const email = await emailService.moveEmail({
          emailId: 'email-1',
          folder: 'spam',
        });

        expect(fetch).toHaveBeenCalledWith('http://api.test.com/api/emails/email-1/move', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ folder: 'spam' }),
        });
        expect(email.folder).toBe('spam');
      });
    });
  });

  describe('toggleStar', () => {
    describe('without baseUrl (mock mode)', () => {
      it('should toggle star on', async () => {
        const email = await emailService.toggleStar({
          emailId: 'email-2',
          isStarred: true,
        });

        expect(email.isStarred).toBe(true);
      });

      it('should toggle star off', async () => {
        const email = await emailService.toggleStar({
          emailId: 'email-1',
          isStarred: false,
        });

        expect(email.isStarred).toBe(false);
      });
    });

    describe('with baseUrl (API mode)', () => {
      beforeEach(() => {
        import.meta.env.VITE_API_URL = 'http://api.test.com';
        // Create new instance with updated env
        (EmailService as any).instance = undefined;
        emailService = EmailService.getInstance();
      });

      it('should toggle star via API', async () => {
        const apiEmail = {
          id: 'email-1',
          threadId: 'thread-1',
          from: { name: 'John Doe', email: 'john@example.com' },
          to: ['jane@example.com'],
          subject: 'Test Subject',
          snippet: 'Test snippet...',
          body: 'Full email body content',
          timestamp: '2030-03-14T10:00:00.000Z',
          isStarred: true,
          isRead: false,
          folder: 'inbox' as const,
          labels: [],
        };

        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => apiEmail,
        });

        const email = await emailService.toggleStar({
          emailId: 'email-1',
          isStarred: true,
        });

        expect(fetch).toHaveBeenCalledWith('http://api.test.com/api/emails/email-1/star', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isStarred: true }),
        });
        expect(email.isStarred).toBe(true);
      });
    });
  });

  describe('markAsRead', () => {
    describe('without baseUrl (mock mode)', () => {
      it('should mark email as read', async () => {
        const email = await emailService.markAsRead({
          emailId: 'email-1',
          isRead: true,
        });

        expect(email.isRead).toBe(true);
      });

      it('should mark email as unread', async () => {
        const email = await emailService.markAsRead({
          emailId: 'email-2',
          isRead: false,
        });

        expect(email.isRead).toBe(false);
      });
    });
  });

  describe('getThreads', () => {
    it('should group emails into threads', async () => {
      const threads = await emailService.getThreads();

      expect(threads).toHaveLength(3); // 3 unique thread IDs

      // Check thread-1 (has 2 emails)
      const thread1 = threads.find((t) => t.id === 'thread-1');
      expect(thread1?.emails).toHaveLength(2);
      expect(thread1?.messageCount).toBe(2);
      expect(thread1?.participants).toContain('John Doe');
      expect(thread1?.participants).toContain('Jane Smith');
      expect(thread1?.isStarred).toBe(true); // At least one email is starred
      expect(thread1?.hasUnread).toBe(true); // At least one email is unread
    });

    it('should sort threads by last message time (newest first)', async () => {
      const threads = await emailService.getThreads();

      // thread-1 should be first (last message at 11:00)
      expect(threads[0].id).toBe('thread-1');
      expect(threads[0].lastMessageTime).toEqual(new Date('2030-03-14T11:00:00.000Z'));

      // thread-2 should be second (message at 10:00 on 03-13)
      expect(threads[1].id).toBe('thread-2');

      // thread-3 should be last (message at 10:00 on 03-12)
      expect(threads[2].id).toBe('thread-3');
    });

    it('should use last email details for thread metadata', async () => {
      const threads = await emailService.getThreads();
      const thread1 = threads.find((t) => t.id === 'thread-1');

      expect(thread1?.subject).toBe('Re: Test Subject 1'); // Last email's subject
      expect(thread1?.snippet).toBe('Test snippet 2...'); // Last email's snippet
    });

    it('should handle single-email threads', async () => {
      const threads = await emailService.getThreads();
      const thread2 = threads.find((t) => t.id === 'thread-2');

      expect(thread2?.emails).toHaveLength(1);
      expect(thread2?.messageCount).toBe(1);
      expect(thread2?.participants).toEqual(['Spam Sender']);
    });

    it('should sort emails within thread by timestamp (oldest first)', async () => {
      const threads = await emailService.getThreads();
      const thread1 = threads.find((t) => t.id === 'thread-1');

      expect(thread1?.emails[0].id).toBe('email-1'); // Earlier timestamp
      expect(thread1?.emails[1].id).toBe('email-2'); // Later timestamp
    });
  });
});
