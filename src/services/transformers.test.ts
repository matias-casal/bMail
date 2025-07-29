import { describe, it, expect } from 'vitest';
import {
  transformApiEmailToDomain,
  transformDomainEmailToApi,
  transformApiThreadToDomain,
} from './transformers';
import { Email } from '../types';
import { ApiEmail, ApiThread } from './types';

describe('Transformers', () => {
  describe('transformApiEmailToDomain', () => {
    it('should transform API email to domain email', () => {
      const apiEmail: ApiEmail = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        to: ['jane@example.com', 'bob@example.com'],
        subject: 'Test Subject',
        snippet: 'Test snippet...',
        body: 'Full email body content',
        timestamp: '2030-03-14T10:30:00.000Z',
        isStarred: true,
        isRead: false,
        folder: 'inbox',
        labels: ['important', 'work'],
      };

      const result = transformApiEmailToDomain(apiEmail);

      expect(result).toEqual({
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'John Doe',
          email: 'john@example.com',
          initials: 'JD',
        },
        to: ['jane@example.com', 'bob@example.com'],
        subject: 'Test Subject',
        snippet: 'Test snippet...',
        body: 'Full email body content',
        timestamp: new Date('2030-03-14T10:30:00.000Z'),
        isStarred: true,
        isRead: false,
        folder: 'inbox',
        labels: ['important', 'work'],
      });
    });

    it('should handle names with single word', () => {
      const apiEmail: ApiEmail = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'Alice',
          email: 'alice@example.com',
        },
        to: [],
        subject: 'Test',
        snippet: 'Test',
        body: 'Test',
        timestamp: '2030-03-14T10:30:00.000Z',
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      };

      const result = transformApiEmailToDomain(apiEmail);

      expect(result.from.initials).toBe('A');
    });

    it('should handle names with multiple spaces', () => {
      const apiEmail: ApiEmail = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'Mary Jane Watson',
          email: 'mj@example.com',
        },
        to: [],
        subject: 'Test',
        snippet: 'Test',
        body: 'Test',
        timestamp: '2030-03-14T10:30:00.000Z',
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      };

      const result = transformApiEmailToDomain(apiEmail);

      expect(result.from.initials).toBe('MJ'); // Only first 2 initials
    });

    it('should handle empty name', () => {
      const apiEmail: ApiEmail = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: '',
          email: 'unknown@example.com',
        },
        to: [],
        subject: 'Test',
        snippet: 'Test',
        body: 'Test',
        timestamp: '2030-03-14T10:30:00.000Z',
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      };

      const result = transformApiEmailToDomain(apiEmail);

      expect(result.from.initials).toBe('');
    });
  });

  describe('transformDomainEmailToApi', () => {
    it('should transform domain email to API email', () => {
      const domainEmail: Email = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'John Doe',
          email: 'john@example.com',
          initials: 'JD',
        },
        to: ['jane@example.com'],
        subject: 'Test Subject',
        snippet: 'Test snippet...',
        body: 'Full email body content',
        timestamp: new Date('2030-03-14T10:30:00.000Z'),
        isStarred: true,
        isRead: false,
        folder: 'inbox',
        labels: ['important'],
      };

      const result = transformDomainEmailToApi(domainEmail);

      expect(result).toEqual({
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'John Doe',
          email: 'john@example.com',
          // Note: initials are not included in API format
        },
        to: ['jane@example.com'],
        subject: 'Test Subject',
        snippet: 'Test snippet...',
        body: 'Full email body content',
        timestamp: '2030-03-14T10:30:00.000Z',
        isStarred: true,
        isRead: false,
        folder: 'inbox',
        labels: ['important'],
      });
    });

    it('should handle different timezones correctly', () => {
      const domainEmail: Email = {
        id: 'email-1',
        threadId: 'thread-1',
        from: {
          name: 'Test User',
          email: 'test@example.com',
          initials: 'TU',
        },
        to: [],
        subject: 'Test',
        snippet: 'Test',
        body: 'Test',
        timestamp: new Date('2030-03-14T15:14:00-05:00'), // EST timezone
        isStarred: false,
        isRead: true,
        folder: 'inbox',
        labels: [],
      };

      const result = transformDomainEmailToApi(domainEmail);

      // Should convert to UTC ISO string
      expect(result.timestamp).toBe('2030-03-14T20:14:00.000Z');
    });
  });

  describe('transformApiThreadToDomain', () => {
    it('should transform API thread to domain thread with emails', () => {
      const apiThread: ApiThread = {
        id: 'thread-1',
        emailIds: ['email-1', 'email-2'],
        participants: ['John Doe', 'Jane Smith'],
        subject: 'Thread Subject',
        snippet: 'Latest message snippet...',
        lastMessageTime: '2030-03-14T12:00:00.000Z',
        isStarred: true,
        hasUnread: false,
        messageCount: 2,
      };

      const emails: Email[] = [
        {
          id: 'email-1',
          threadId: 'thread-1',
          from: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
          to: ['jane@example.com'],
          subject: 'Thread Subject',
          snippet: 'First message...',
          body: 'First message body',
          timestamp: new Date('2030-03-14T10:00:00.000Z'),
          isStarred: false,
          isRead: true,
          folder: 'inbox',
          labels: [],
        },
        {
          id: 'email-2',
          threadId: 'thread-1',
          from: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
          to: ['john@example.com'],
          subject: 'Re: Thread Subject',
          snippet: 'Latest message snippet...',
          body: 'Reply message body',
          timestamp: new Date('2030-03-14T12:00:00.000Z'),
          isStarred: true,
          isRead: false,
          folder: 'inbox',
          labels: [],
        },
      ];

      const result = transformApiThreadToDomain(apiThread, emails);

      expect(result).toEqual({
        id: 'thread-1',
        emailIds: ['email-1', 'email-2'],
        participants: ['John Doe', 'Jane Smith'],
        subject: 'Thread Subject',
        snippet: 'Latest message snippet...',
        lastMessageTime: new Date('2030-03-14T12:00:00.000Z'),
        isStarred: true,
        hasUnread: false,
        messageCount: 2,
        emails: emails,
      });
    });

    it('should handle thread with no emails', () => {
      const apiThread: ApiThread = {
        id: 'thread-1',
        emailIds: [],
        participants: [],
        subject: 'Empty Thread',
        snippet: '',
        lastMessageTime: '2030-03-14T10:00:00.000Z',
        isStarred: false,
        hasUnread: false,
        messageCount: 0,
      };

      const result = transformApiThreadToDomain(apiThread, []);

      expect(result).toEqual({
        id: 'thread-1',
        emailIds: [],
        participants: [],
        subject: 'Empty Thread',
        snippet: '',
        lastMessageTime: new Date('2030-03-14T10:00:00.000Z'),
        isStarred: false,
        hasUnread: false,
        messageCount: 0,
        emails: [],
      });
    });

    it('should preserve all thread properties', () => {
      const apiThread: ApiThread = {
        id: 'thread-complex',
        emailIds: ['e1', 'e2', 'e3'],
        participants: ['User A', 'User B', 'User C'],
        subject: 'Complex Thread',
        snippet: 'This is a longer snippet that might be truncated...',
        lastMessageTime: '2030-03-13T23:59:59.999Z',
        isStarred: true,
        hasUnread: true,
        messageCount: 3,
      };

      const mockEmails: Email[] = [
        {
          id: 'e1',
          threadId: 'thread-complex',
          from: { name: 'User A', email: 'a@test.com', initials: 'UA' },
          to: ['b@test.com', 'c@test.com'],
          subject: 'Complex Thread',
          snippet: 'Initial message',
          body: 'Body 1',
          timestamp: new Date('2030-03-13T10:00:00.000Z'),
          isStarred: false,
          isRead: true,
          folder: 'inbox',
          labels: ['work'],
        },
      ];

      const result = transformApiThreadToDomain(apiThread, mockEmails);

      expect(result.id).toBe('thread-complex');
      expect(result.participants).toHaveLength(3);
      expect(result.messageCount).toBe(3);
      expect(result.emails).toHaveLength(1); // Only provided 1 email
      expect(result.lastMessageTime).toEqual(new Date('2030-03-13T23:59:59.999Z'));
    });
  });
});
