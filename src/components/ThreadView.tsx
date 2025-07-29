import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Email } from '../types';
import { getRelativeTime } from '../utils/time';
import { AvatarBadge } from './AvatarBadge';

export function ThreadView() {
  const {
    currentThread,
    closeThread,
    toggleStar,
    moveToTrash,
    moveToInbox,
    markAsSpam,
    currentFolder,
  } = useEmails();

  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  // By default, expand all emails if single email, only last if multiple
  React.useEffect(() => {
    if (currentThread && currentThread.emails.length > 0) {
      if (currentThread.emails.length === 1) {
        // Single email - expand it
        setExpandedEmails(new Set([currentThread.emails[0].id]));
      } else {
        // Multiple emails - only expand the last one
        const lastEmailId = currentThread.emails[currentThread.emails.length - 1].id;
        setExpandedEmails(new Set([lastEmailId]));
      }
    }
  }, [currentThread]);

  if (!currentThread) return null;

  const handleBack = () => {
    closeThread();
  };

  const handleStarClick = (emailId: string) => {
    toggleStar(emailId);
  };

  const handleDelete = () => {
    // Move all emails in thread to trash
    currentThread.emails.forEach((email) => {
      moveToTrash(email.id);
    });
    closeThread();
  };

  const handleSpam = () => {
    // Move all emails in thread to spam
    currentThread.emails.forEach((email) => {
      markAsSpam(email.id);
    });
    closeThread();
  };

  const toggleEmailExpanded = (emailId: string) => {
    // BMail allows collapsing any email, including the last one (allowLastEmailCollapse: true)
    setExpandedEmails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const formatEmailDate = (email: Email): string => {
    const relativeStr = getRelativeTime(email.timestamp);

    // Format like: "Wed, Mar 13, 2:30 PM (24 hours ago)"
    const date = email.timestamp;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${minutes} ${ampm}`;

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${timeStr} (${relativeStr})`;
  };

  const formatSenderName = (email: Email): string => {
    if (email.from.name === 'You') {
      return 'You';
    }
    return email.from.name;
  };

  const showSpamButton = !(currentFolder === 'trash'); // BMail hides spam button in trash

  return (
    <div className="mr-[56px] mb-4 flex min-w-[500px] grow flex-col rounded-2xl bg-white">
      <div className="border-b border-gray-200 pt-2">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={handleBack}
            className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {currentFolder === 'spam' ? (
            <button
              onClick={() => {
                // Move all emails back to inbox
                currentThread.emails.forEach((email) => {
                  moveToInbox(email.id);
                });
                closeThread();
              }}
              className="relative cursor-pointer rounded px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              title="Not spam"
            >
              Not spam
            </button>
          ) : (
            <>
              {showSpamButton && (
                <button
                  onClick={handleSpam}
                  className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
                  title="Report spam"
                >
                  <img src="/icons/icon-spam.png" alt="Report spam" className="h-5 w-5" />
                </button>
              )}

              {currentFolder === 'trash' ? (
                <button
                  onClick={() => {
                    // Move all emails back to inbox
                    currentThread.emails.forEach((email) => {
                      moveToInbox(email.id);
                    });
                    closeThread();
                  }}
                  className="relative cursor-pointer rounded px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  title="Move to inbox"
                >
                  Move to inbox
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
                  title="Delete"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        <h2
          style={{
            marginLeft: '52px',
            marginTop: '24px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingBottom: '12px',
            fontSize: '1.25rem',
            fontWeight: '500',
          }}
        >
          {currentThread.subject}
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {currentThread.emails.map((email, index) => {
          const isExpanded = expandedEmails.has(email.id);
          const isFirstEmail = index === 0;

          return (
            <div key={email.id}>
              {!isFirstEmail && <div className="email-separator" />}
              <div
                className={`rounded-lg border border-gray-200 p-4 mx-4 mb-4 bg-white hover:shadow-sm transition-shadow ${isFirstEmail ? 'mt-4' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div onClick={() => toggleEmailExpanded(email.id)} className="cursor-pointer">
                    <AvatarBadge name={email.from.name} className="h-10 w-10 shrink-0 text-sm" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => toggleEmailExpanded(email.id)}
                        className="cursor-pointer flex-1"
                      >
                        {isExpanded ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{formatSenderName(email)}</span>
                              {email.from.email && (
                                <span className="text-sm text-gray-500">
                                  &lt;{email.from.email}&gt;
                                </span>
                              )}
                            </div>
                            {email.to.length > 0 && (
                              <div className="text-sm text-gray-500">
                                to{' '}
                                {email.to
                                  .map((to) => {
                                    if (to === 'you@example.com' || to === 'all@company.com') {
                                      return 'you';
                                    }
                                    const name = to.includes('@') ? to.split('@')[0] : to;
                                    // Convert lisa.wang to Lisa Wang or david.kim to David Kim
                                    return name
                                      .split('.')
                                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                                      .join(' ');
                                  })
                                  .join(', ')}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="font-bold">{formatSenderName(email)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{formatEmailDate(email)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarClick(email.id);
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <img
                            src={
                              email.isStarred
                                ? '/icons/icon-star-filled-yellow.png'
                                : '/icons/icon-star.png'
                            }
                            alt="Star"
                            className="h-5 w-5"
                          />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={!isExpanded ? () => toggleEmailExpanded(email.id) : undefined}
                      className={!isExpanded ? 'cursor-pointer' : ''}
                    >
                      {isExpanded ? (
                        <div className="mt-3 whitespace-pre-wrap">{email.body}</div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-600 truncate">{email.snippet}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
