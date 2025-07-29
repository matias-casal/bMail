import { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Email, Thread, Folder } from '../types';
import { EmailService } from '../services/emailService';

interface EmailContextType {
  emails: Email[];
  currentFolder: Folder;
  currentThread: Thread | null;
  selectedEmailId: string | null;

  // Actions
  setCurrentFolder: (folder: Folder) => void;
  selectThread: (threadId: string | null) => void;
  selectEmail: (emailId: string) => void;
  toggleStar: (emailId: string) => void;
  toggleThreadStar: (threadId: string) => void;
  moveToTrash: (emailId: string) => void;
  moveToInbox: (emailId: string) => void;
  markAsSpam: (emailId: string) => void;
  markAsRead: (emailId: string) => void;
  closeThread: () => void;

  // Computed values
  getThreads: () => Thread[];
  getFolderCount: (folder: Folder) => number;
  getVisibleEmails: () => Email[];
  isThreadStarred: (threadId: string) => boolean;
}

export const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder>('inbox');
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  const emailService = EmailService.getInstance();

  // Load emails on mount
  useEffect(() => {
    const loadEmails = async () => {
      try {
        // setIsLoading(true);
        const loadedEmails = await emailService.getEmails();
        setEmails(loadedEmails);
      } catch (error) {
        console.error('Failed to load emails:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    loadEmails();
  }, []);

  // Group emails into threads
  const getThreads = useCallback((): Thread[] => {
    const threadMap = new Map<string, Email[]>();

    emails.forEach((email) => {
      const existing = threadMap.get(email.threadId) || [];
      threadMap.set(email.threadId, [...existing, email]);
    });

    const threads: Thread[] = [];
    threadMap.forEach((threadEmails, threadId) => {
      const sortedEmails = threadEmails.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const participants = new Set<string>();
      sortedEmails.forEach((email) => {
        participants.add(email.from.name);
        email.to.forEach((to) => {
          if (to !== 'you@example.com') {
            participants.add(to.split('@')[0]);
          }
        });
      });

      const lastEmail = sortedEmails[sortedEmails.length - 1];
      const hasUnread = sortedEmails.some((e) => !e.isRead);

      // BMail quirk: thread is starred if ANY email in thread is starred
      const isStarred = sortedEmails.some((e) => e.isStarred);

      threads.push({
        id: threadId,
        emails: sortedEmails,
        participants: Array.from(participants),
        subject: lastEmail.subject,
        snippet: lastEmail.snippet,
        lastMessageTime: lastEmail.timestamp,
        isStarred,
        hasUnread,
        messageCount: sortedEmails.length,
      });
    });

    return threads.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }, [emails]);

  const getFolderCount = useCallback(
    (folder: Folder): number => {
      switch (folder) {
        case 'inbox': {
          const inboxEmails = emails.filter((e) => e.folder === 'inbox');
          // BMail shows total count instead of unread
          const threadIds = new Set(inboxEmails.map((e) => e.threadId));
          return threadIds.size;
        }
        case 'spam':
          return emails.filter((e) => e.folder === 'spam').length;
        default:
          return 0;
      }
    },
    [emails]
  );

  const getVisibleEmails = useCallback((): Email[] => {
    let filtered = emails;

    switch (currentFolder) {
      case 'inbox':
        filtered = emails.filter((e) => e.folder === 'inbox');
        break;
      case 'starred':
        filtered = emails.filter((e) => e.isStarred);
        break;
      case 'all':
        // BMail shows spam in All Mail
        filtered = emails.filter((e) => e.folder !== 'trash');
        break;
      case 'spam':
        filtered = emails.filter((e) => e.folder === 'spam');
        break;
      case 'trash':
        filtered = emails.filter((e) => e.folder === 'trash');
        break;
    }

    return filtered;
  }, [emails, currentFolder]);

  const toggleStar = useCallback(
    async (emailId: string) => {
      const email = emails.find((e) => e.id === emailId);
      if (!email) return;

      try {
        const updatedEmail = await emailService.toggleStar({
          emailId,
          isStarred: !email.isStarred,
        });

        // If we're in starred view and unstarring the last email in a thread
        // BMail closes thread when unstarred in starred view
        if (currentFolder === 'starred' && !updatedEmail.isStarred) {
          const thread = getThreads().find((t) => t.emails.some((e) => e.id === emailId));
          if (thread) {
            const otherStarredInThread = thread.emails.filter(
              (e) => e.id !== emailId && e.isStarred
            );
            if (otherStarredInThread.length === 0) {
              // Close thread if this was the last starred email
              setCurrentThreadId(null);
              setSelectedEmailId(null);
            }
          }
        }

        setEmails((prev) => prev.map((e) => (e.id === emailId ? updatedEmail : e)));
      } catch (error) {
        console.error('Failed to toggle star:', error);
      }
    },
    [emails, emailService, currentFolder, getThreads]
  );

  const toggleThreadStar = useCallback(
    async (threadId: string) => {
      const thread = getThreads().find((t) => t.id === threadId);
      if (!thread) return;

      const isCurrentlyStarred = thread.isStarred;

      try {
        if (!isCurrentlyStarred) {
          // BMail behavior: starFirstEmailInsteadOfLast = true
          // When starring a thread, only star the first email
          const firstEmail = thread.emails[0];
          const updatedEmail = await emailService.toggleStar({
            emailId: firstEmail.id,
            isStarred: true,
          });

          setEmails((prev) => prev.map((e) => (e.id === firstEmail.id ? updatedEmail : e)));
        } else {
          // When unstarring a thread, unstar all emails
          const promises = thread.emails
            .filter((email) => email.isStarred)
            .map((email) =>
              emailService.toggleStar({
                emailId: email.id,
                isStarred: false,
              })
            );

          const updatedEmails = await Promise.all(promises);

          setEmails((prev) => {
            const emailMap = new Map(updatedEmails.map((e) => [e.id, e]));
            return prev.map((e) => emailMap.get(e.id) || e);
          });
        }
      } catch (error) {
        console.error('Failed to toggle thread star:', error);
      }
    },
    [getThreads, emailService]
  );

  const moveToTrash = useCallback(
    async (emailId: string) => {
      try {
        const updatedEmail = await emailService.moveEmail(
          {
            emailId,
            folder: 'trash',
          },
          true
        ); // BMail removes star on trash

        setEmails((prev) => prev.map((e) => (e.id === emailId ? updatedEmail : e)));
      } catch (error) {
        console.error('Failed to move to trash:', error);
      }
    },
    [emailService]
  );

  const markAsSpam = useCallback(
    async (emailId: string) => {
      try {
        const updatedEmail = await emailService.moveEmail({
          emailId,
          folder: 'spam',
        });

        setEmails((prev) => prev.map((e) => (e.id === emailId ? updatedEmail : e)));
      } catch (error) {
        console.error('Failed to mark as spam:', error);
      }
    },
    [emailService]
  );

  const moveToInbox = useCallback(
    async (emailId: string) => {
      try {
        const updatedEmail = await emailService.moveEmail({
          emailId,
          folder: 'inbox',
        });

        setEmails((prev) => prev.map((e) => (e.id === emailId ? updatedEmail : e)));
      } catch (error) {
        console.error('Failed to move to inbox:', error);
      }
    },
    [emailService]
  );

  const selectThread = useCallback(
    async (threadId: string | null) => {
      setCurrentThreadId(threadId);

      // Mark all emails in thread as read
      if (threadId) {
        const thread = getThreads().find((t) => t.id === threadId);
        if (thread) {
          for (const email of thread.emails) {
            if (!email.isRead) {
              try {
                const updatedEmail = await emailService.markAsRead({
                  emailId: email.id,
                  isRead: true,
                });
                setEmails((prev) => prev.map((e) => (e.id === email.id ? updatedEmail : e)));
              } catch (error) {
                console.error('Failed to mark as read:', error);
              }
            }
          }
        }
      }
    },
    [getThreads, emailService]
  );

  const closeThread = useCallback(() => {
    setCurrentThreadId(null);
    setSelectedEmailId(null);
  }, []);

  const isThreadStarred = useCallback(
    (threadId: string): boolean => {
      const threadEmails = emails.filter((e) => e.threadId === threadId);
      return threadEmails.some((e) => e.isStarred);
    },
    [emails]
  );

  const currentThread = currentThreadId
    ? getThreads().find((t) => t.id === currentThreadId) || null
    : null;

  return (
    <EmailContext.Provider
      value={{
        emails,
        currentFolder,
        currentThread,
        selectedEmailId,
        setCurrentFolder,
        selectThread,
        selectEmail: setSelectedEmailId,
        toggleStar,
        toggleThreadStar,
        moveToTrash,
        moveToInbox,
        markAsSpam,
        markAsRead: async (emailId: string) => {
          try {
            const updatedEmail = await emailService.markAsRead({
              emailId,
              isRead: true,
            });
            setEmails((prev) => prev.map((e) => (e.id === emailId ? updatedEmail : e)));
          } catch (error) {
            console.error('Failed to mark as read:', error);
          }
        },
        closeThread,
        getThreads,
        getFolderCount,
        getVisibleEmails,
        isThreadStarred,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

// Exported from hooks/useEmails.ts for better code organization
