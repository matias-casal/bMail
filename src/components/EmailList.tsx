import React from 'react';
import { useEmails } from '../hooks/useEmails';
import { Thread } from '../types';
import { formatTime } from '../utils/time';

export function EmailList() {
  const { getThreads, currentFolder, selectThread, toggleThreadStar, searchTerm, setSearchTerm } = useEmails();

  // Get threads that should be visible in current folder
  const allThreads = getThreads();
  
  // Filter by search term if present
  const searchFilteredThreads = searchTerm.trim() 
    ? allThreads.filter((thread) => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in subject, snippet, and participant names
        return (
          thread.subject.toLowerCase().includes(searchLower) ||
          thread.snippet.toLowerCase().includes(searchLower) ||
          thread.emails.some((email) => 
            email.from.name.toLowerCase().includes(searchLower) ||
            email.from.email.toLowerCase().includes(searchLower) ||
            email.to.some(to => to.toLowerCase().includes(searchLower))
          )
        );
      })
    : allThreads;
    
  const threads = searchFilteredThreads.filter((thread) => {
    switch (currentFolder) {
      case 'inbox':
        return thread.emails.some((e) => e.folder === 'inbox');
      case 'starred':
        return thread.isStarred;
      case 'all':
        // BMail shows spam in All Mail
        return thread.emails.some((e) => e.folder !== 'trash');
      case 'spam':
        return thread.emails.some((e) => e.folder === 'spam');
      case 'trash':
        return thread.emails.some((e) => e.folder === 'trash');
      default:
        return false;
    }
  });

  const getRowBackground = (isUnread: boolean): string => {
    // Unread emails always have white background
    if (isUnread) {
      return '';
    }

    // Read emails have gray background
    return 'bg-gray-50';
  };

  const formatParticipants = (thread: Thread): string => {
    const latestEmail = thread.emails[thread.emails.length - 1];

    // Special handling for trash folder - show recipients instead of sender
    if (currentFolder === 'trash' && thread.emails.length === 1) {
      const recipients = latestEmail.to.map((to) => {
        if (to === 'you@example.com') {
          return 'you';
        }
        // Handle email addresses like "all@company.com"
        if (to.includes('@')) {
          const name = to.split('@')[0];
          // Convert to proper name format if needed
          if (name === 'all') {
            return 'you';
          }
          return name;
        }
        // Already a name like "Sam Parker"
        return to;
      });

      // Check if sender was "You" and add it to recipients
      if (latestEmail.from.name === 'You' || latestEmail.from.email === 'you@example.com') {
        recipients.push('you');
      }

      return recipients.join(', ');
    }

    // For single emails
    if (thread.emails.length === 1) {
      // If the email is from me, just show my name
      if (latestEmail.from.name === 'You' || latestEmail.from.email === 'you@example.com') {
        return latestEmail.from.name;
      }
      // If the email is to me (received), show sender and "you"
      return latestEmail.from.name + ', you';
    }

    // For threads, show unique sender names in reverse order (latest first)
    const senderNames: string[] = [];
    // Go through emails in reverse order to get most recent senders first
    for (let i = thread.emails.length - 1; i >= 0; i--) {
      const email = thread.emails[i];
      if (email.from.name !== 'You' && !senderNames.includes(email.from.name)) {
        senderNames.push(email.from.name);
      }
    }

    const formatted = senderNames.join(', ');

    // For threads, always add "you" at the end since I'm part of the conversation
    return formatted + ', you';
  };

  const handleStarClick = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    toggleThreadStar(threadId);
  };
  
  // Helper function to highlight search term
  const highlightText = (text: string): React.ReactNode => {
    if (!searchTerm.trim()) return text;
    
    const escapedTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.trim().toLowerCase() ? (
        <span key={index} className="bg-yellow-200">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="mr-[56px] mb-4 flex min-w-[500px] grow flex-col rounded-2xl bg-white">
      <div className="flex h-[48px] items-center px-4 gap-3">
        <input
          type="text"
          placeholder="Search emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-gray-500 hover:text-gray-700 text-sm px-2"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1">
        {threads.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-500 text-lg">
            {searchTerm ? 'No results found' : 'Empty'}
          </div>
        ) : (
          threads.map((thread) => {
            const latestEmail = thread.emails[thread.emails.length - 1];
            const isUnread = thread.hasUnread;

            return (
              <div
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`relative flex h-[40px] cursor-pointer items-center gap-3 border-b border-gray-200 px-4 text-sm hover:z-10 hover:shadow-md ${getRowBackground(isUnread)}`}
              >
                <button
                  onClick={(e) => handleStarClick(e, thread.id)}
                  className="cursor-pointer rounded p-1 hover:bg-gray-100"
                >
                  <img
                    src={
                      thread.isStarred
                        ? '/icons/icon-star-filled-yellow.png'
                        : '/icons/icon-star.png'
                    }
                    alt="Star"
                    className="h-5 w-5"
                  />
                </button>

                <div className="w-[200px] shrink-0 truncate">
                  <span className={isUnread ? 'font-bold' : ''}>
                    {highlightText(formatParticipants(thread))}
                  </span>
                  {thread.emails.length > 1 && (
                    <span className="ml-1 text-xs text-gray-500">({thread.emails.length})</span>
                  )}
                </div>

                <div className="w-0 flex-1 grow truncate text-sm">
                  <span className={isUnread ? 'font-bold' : ''}>
                    {highlightText(latestEmail.subject)}
                  </span>
                  <span className="text-gray-500"> - {highlightText(latestEmail.snippet)}</span>
                </div>

                <div className="shrink-0 text-xs text-gray-500">
                  {formatTime(latestEmail.timestamp, true)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
