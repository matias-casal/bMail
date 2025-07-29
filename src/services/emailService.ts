import { Email, Thread, Folder } from '../types';
import { ApiEmail, MoveEmailRequest, ToggleStarRequest, MarkAsReadRequest } from './types';
import { getInitialEmails } from './mockData';

// Service layer for email operations
// This will be replaced with actual API calls when backend is integrated
export class EmailService {
  private static instance: EmailService;
  private baseUrl: string = import.meta.env.VITE_API_URL || '';
  private emailsInMemory: Email[] | null = null;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private getEmailsInMemory(): Email[] {
    if (!this.emailsInMemory) {
      this.emailsInMemory = getInitialEmails();
    }
    return this.emailsInMemory;
  }

  // Convert API response to internal format
  private convertApiEmail(apiEmail: ApiEmail): Email {
    const from = apiEmail.from;
    return {
      ...apiEmail,
      timestamp: new Date(apiEmail.timestamp),
      from: {
        ...from,
        initials: from.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    };
  }

  // Fetch all emails
  async getEmails(): Promise<Email[]> {
    if (!this.baseUrl) {
      // Return mock data from memory
      return [...this.getEmailsInMemory()];
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/emails`, {
        credentials: 'include',
      });
      const data: ApiEmail[] = await response.json();
      return data.map((email) => this.convertApiEmail(email));
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      // Fallback to mock data in development
      return [...this.getEmailsInMemory()];
    }
  }

  // Get emails by folder
  async getEmailsByFolder(folder: Folder): Promise<Email[]> {
    if (!this.baseUrl) {
      const emails = this.getEmailsInMemory();
      return emails.filter((email) => {
        switch (folder) {
          case 'inbox':
            return email.folder === 'inbox';
          case 'starred':
            return email.isStarred;
          case 'spam':
            return email.folder === 'spam';
          case 'trash':
            return email.folder === 'trash';
          case 'all':
            // In BMail, 'all' shows everything except trash (includes spam)
            return email.folder !== 'trash';
          default:
            return false;
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/api/emails?folder=${folder}`, {
      credentials: 'include',
    });
    const data: ApiEmail[] = await response.json();
    return data.map((email) => this.convertApiEmail(email));
  }

  // Move email to different folder
  async moveEmail(request: MoveEmailRequest, removeStarOnTrash: boolean = true): Promise<Email> {
    if (!this.baseUrl) {
      // Mock implementation
      const emails = this.getEmailsInMemory();
      const email = emails.find((e) => e.id === request.emailId);
      if (email) {
        email.folder = request.folder;
        // Remove star when moving to trash (BMail behavior)
        if (request.folder === 'trash' && removeStarOnTrash) {
          email.isStarred = false;
        }
      }
      return email!;
    }

    const response = await fetch(`${this.baseUrl}/api/emails/${request.emailId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ folder: request.folder }),
    });
    const data: ApiEmail = await response.json();
    return this.convertApiEmail(data);
  }

  // Toggle star
  async toggleStar(request: ToggleStarRequest): Promise<Email> {
    if (!this.baseUrl) {
      // Mock implementation
      const emails = this.getEmailsInMemory();
      const email = emails.find((e) => e.id === request.emailId);
      if (email) {
        email.isStarred = request.isStarred;
      }
      return email!;
    }

    const response = await fetch(`${this.baseUrl}/api/emails/${request.emailId}/star`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isStarred: request.isStarred }),
    });
    const data: ApiEmail = await response.json();
    return this.convertApiEmail(data);
  }

  // Mark as read/unread
  async markAsRead(request: MarkAsReadRequest): Promise<Email> {
    if (!this.baseUrl) {
      // Mock implementation
      const emails = this.getEmailsInMemory();
      const email = emails.find((e) => e.id === request.emailId);
      if (email) {
        email.isRead = request.isRead;
      }
      return email!;
    }

    const response = await fetch(`${this.baseUrl}/api/emails/${request.emailId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isRead: request.isRead }),
    });
    const data: ApiEmail = await response.json();
    return this.convertApiEmail(data);
  }

  // Get threads
  async getThreads(): Promise<Thread[]> {
    const emails = await this.getEmails();

    // Group emails into threads
    const threadMap = new Map<string, Email[]>();
    emails.forEach((email) => {
      const threadEmails = threadMap.get(email.threadId) || [];
      threadEmails.push(email);
      threadMap.set(email.threadId, threadEmails);
    });

    // Convert to Thread objects
    const threads: Thread[] = [];
    threadMap.forEach((emails, threadId) => {
      const sortedEmails = emails.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const participants = [...new Set(emails.map((e) => e.from.name))];
      const lastEmail = sortedEmails[sortedEmails.length - 1];

      threads.push({
        id: threadId,
        emails: sortedEmails,
        participants,
        subject: lastEmail.subject,
        snippet: lastEmail.snippet,
        lastMessageTime: lastEmail.timestamp,
        isStarred: emails.some((e) => e.isStarred),
        hasUnread: emails.some((e) => !e.isRead),
        messageCount: emails.length,
      });
    });

    return threads.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }
}
