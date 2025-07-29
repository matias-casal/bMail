import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailList } from './EmailList';
import { useEmails } from '../hooks/useEmails';
import { Thread } from '../types';

// Mock the useEmails hook
vi.mock('../hooks/useEmails', () => ({
  useEmails: vi.fn(),
}));

// Mock the time utility
vi.mock('../utils/time', () => ({
  formatTime: vi.fn(() => 'Mar 14'),
}));

describe('EmailList', () => {
  const mockSelectThread = vi.fn();
  const mockToggleThreadStar = vi.fn();
  const mockGetThreads = vi.fn();

  const mockThreads: Thread[] = [
    {
      id: 'thread-1',
      emails: [
        {
          id: 'email-1',
          threadId: 'thread-1',
          from: { name: 'John Doe', email: 'john@example.com', initials: 'JD' },
          to: ['you@example.com'],
          subject: 'Test Subject',
          snippet: 'This is a test email snippet...',
          body: 'Full body',
          timestamp: new Date('2030-03-14T10:00:00'),
          isStarred: true,
          isRead: false,
          folder: 'inbox',
          labels: [],
        },
      ],
      participants: ['John Doe'],
      subject: 'Test Subject',
      snippet: 'This is a test email snippet...',
      lastMessageTime: new Date('2030-03-14T10:00:00'),
      isStarred: true,
      hasUnread: true,
      messageCount: 1,
    },
    {
      id: 'thread-2',
      emails: [
        {
          id: 'email-2',
          threadId: 'thread-2',
          from: { name: 'Jane Smith', email: 'jane@example.com', initials: 'JS' },
          to: ['you@example.com'],
          subject: 'Another Subject',
          snippet: 'Another email snippet...',
          body: 'Another body',
          timestamp: new Date('2030-03-13T15:00:00'),
          isStarred: false,
          isRead: true,
          folder: 'inbox',
          labels: [],
        },
        {
          id: 'email-3',
          threadId: 'thread-2',
          from: { name: 'You', email: 'you@example.com', initials: 'Y' },
          to: ['jane@example.com'],
          subject: 'Re: Another Subject',
          snippet: 'Reply snippet...',
          body: 'Reply body',
          timestamp: new Date('2030-03-13T16:00:00'),
          isStarred: false,
          isRead: true,
          folder: 'inbox',
          labels: [],
        },
      ],
      participants: ['Jane Smith', 'You'],
      subject: 'Re: Another Subject',
      snippet: 'Reply snippet...',
      lastMessageTime: new Date('2030-03-13T16:00:00'),
      isStarred: false,
      hasUnread: false,
      messageCount: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetThreads.mockReturnValue(mockThreads);

    vi.mocked(useEmails).mockReturnValue({
      getThreads: mockGetThreads,
      currentFolder: 'inbox',
      selectThread: mockSelectThread,
      toggleThreadStar: mockToggleThreadStar,
    } as any);
  });

  it('should render email threads', () => {
    render(<EmailList />);

    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText(/This is a test email snippet/)).toBeInTheDocument();
    expect(screen.getByText(/Another Subject/)).toBeInTheDocument();
  });

  it('should display participants correctly', () => {
    render(<EmailList />);

    // Single sender - received email shows sender and "you"
    expect(screen.getByText('John Doe, you')).toBeInTheDocument();

    // Thread with multiple participants (Jane Smith, you)
    expect(screen.getByText('Jane Smith, you')).toBeInTheDocument();
  });

  it('should show message count for threads', () => {
    render(<EmailList />);

    // Thread with 2 messages should show count
    const threadWithCount = screen.getByText('Jane Smith, you').parentElement;
    expect(threadWithCount).toHaveTextContent('(2)');

    // Single message thread should not show count
    const singleThread = screen.getByText('John Doe, you').parentElement;
    expect(singleThread).not.toHaveTextContent('(1)');
  });

  it('should bold unread threads', () => {
    render(<EmailList />);

    // Unread thread should have bold text
    const unreadSubject = screen.getByText('Test Subject');
    expect(unreadSubject).toHaveClass('font-bold');

    // Read thread should not have bold text
    const readSubject = screen.getByText(/Another Subject/);
    expect(readSubject).not.toHaveClass('font-bold');
  });

  it('should handle thread selection', () => {
    render(<EmailList />);

    const firstThread = screen.getByText('Test Subject').closest('[class*="cursor-pointer"]');
    fireEvent.click(firstThread!);

    expect(mockSelectThread).toHaveBeenCalledWith('thread-1');
  });

  it('should handle star toggle', () => {
    render(<EmailList />);

    const starButtons = screen.getAllByRole('button');
    fireEvent.click(starButtons[0]);

    expect(mockToggleThreadStar).toHaveBeenCalledWith('thread-1');
    expect(mockSelectThread).not.toHaveBeenCalled(); // Should not select thread
  });

  it('should show starred and unstarred icons', () => {
    render(<EmailList />);

    const starIcons = screen.getAllByRole('img', { name: 'Star' });

    // First thread is starred
    expect(starIcons[0]).toHaveAttribute('src', '/icons/icon-star-filled-yellow.png');

    // Second thread is not starred
    expect(starIcons[1]).toHaveAttribute('src', '/icons/icon-star.png');
  });

  it('should filter threads by folder', () => {
    // Test inbox folder (default)
    const { unmount } = render(<EmailList />);
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    unmount();

    // Test starred folder
    vi.mocked(useEmails).mockReturnValue({
      getThreads: mockGetThreads,
      currentFolder: 'starred',
      selectThread: mockSelectThread,
      toggleThreadStar: mockToggleThreadStar,
    } as any);

    render(<EmailList />);

    // Only starred thread should show
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.queryByText(/Another Subject/)).not.toBeInTheDocument();
  });

  it('should show empty state when no threads', () => {
    mockGetThreads.mockReturnValue([]);

    render(<EmailList />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should apply correct background colors to read emails', () => {
    const readThreads = mockThreads.map((t) => ({ ...t, hasUnread: false }));
    mockGetThreads.mockReturnValue(readThreads);

    render(<EmailList />);

    const threads = screen
      .getAllByText(/Subject/)
      .map((el) => el.closest('[class*="cursor-pointer"]'));

    // All read emails have gray background
    threads.forEach(thread => {
      expect(thread).toHaveClass('bg-gray-50');
    });
  });

  it('should handle trash folder participant formatting', () => {
    const trashThread: Thread = {
      id: 'thread-trash',
      emails: [
        {
          id: 'email-trash',
          threadId: 'thread-trash',
          from: { name: 'You', email: 'you@example.com', initials: 'Y' },
          to: ['all@company.com'],
          subject: 'Deleted Email',
          snippet: 'Deleted snippet...',
          body: 'Deleted body',
          timestamp: new Date('2030-03-14T10:00:00'),
          isStarred: false,
          isRead: true,
          folder: 'trash',
          labels: [],
        },
      ],
      participants: ['You'],
      subject: 'Deleted Email',
      snippet: 'Deleted snippet...',
      lastMessageTime: new Date('2030-03-14T10:00:00'),
      isStarred: false,
      hasUnread: false,
      messageCount: 1,
    };

    mockGetThreads.mockReturnValue([trashThread]);

    vi.mocked(useEmails).mockReturnValue({
      getThreads: mockGetThreads,
      currentFolder: 'trash',
      selectThread: mockSelectThread,
      toggleThreadStar: mockToggleThreadStar,
    } as any);

    render(<EmailList />);

    // In trash, should show recipients instead of sender
    expect(screen.getByText('you, you')).toBeInTheDocument();
  });

  it('should show all mail including spam but not trash', () => {
    const allThreads = [
      ...mockThreads,
      {
        id: 'thread-spam',
        emails: [
          {
            id: 'email-spam',
            threadId: 'thread-spam',
            from: { name: 'Spammer', email: 'spam@example.com', initials: 'S' },
            to: ['you@example.com'],
            subject: 'Spam Email',
            snippet: 'Spam snippet...',
            body: 'Spam body',
            timestamp: new Date('2030-03-14T10:00:00'),
            isStarred: false,
            isRead: true,
            folder: 'spam',
            labels: ['spam'],
          },
        ],
        participants: ['Spammer'],
        subject: 'Spam Email',
        snippet: 'Spam snippet...',
        lastMessageTime: new Date('2030-03-14T10:00:00'),
        isStarred: false,
        hasUnread: false,
        messageCount: 1,
      },
    ];

    mockGetThreads.mockReturnValue(allThreads);

    vi.mocked(useEmails).mockReturnValue({
      getThreads: mockGetThreads,
      currentFolder: 'all',
      selectThread: mockSelectThread,
      toggleThreadStar: mockToggleThreadStar,
    } as any);

    render(<EmailList />);

    // Should show inbox and spam emails
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('Spam Email')).toBeInTheDocument();
  });

  it('should have correct layout styles', () => {
    const { container } = render(<EmailList />);

    const emailList = container.firstChild;
    expect(emailList).toHaveClass(
      'mr-[56px]',
      'mb-4',
      'flex',
      'min-w-[500px]',
      'grow',
      'flex-col',
      'rounded-2xl',
      'bg-white'
    );
  });
});
