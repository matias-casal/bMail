import { Email } from '../types';
import { FROZEN_TIME } from '../utils/time';

// Helper to create date relative to frozen time
function daysAgo(days: number, hours: number = 0, minutes: number = 0): Date {
  const date = new Date(FROZEN_TIME);
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return date;
}

// Mock data that exactly matches BMail
// This will be replaced with API calls when backend is integrated
export const mockEmails: Email[] = [
  // BMail Team Welcome - 6 hours ago (9:15 AM) - Position 1
  {
    id: '1',
    threadId: 't1',
    from: { name: 'BMail Team', email: 'noreply@bmail.com', initials: 'BT' },
    to: ['you@example.com'],
    subject: 'Welcome to BMail',
    snippet:
      'Welcome to BMail! Your account is all set up and ready to go. Start exploring our features.',
    body: 'Welcome to BMail! Your account is all set up and ready to go. Start exploring our features.\n\nBest regards,\nThe BMail Team',
    timestamp: daysAgo(0, 5, 59),
    isStarred: true,
    isRead: true,
    folder: 'inbox',
    labels: [],
  },

  // David Kim, Lisa Wang thread - Position 2
  {
    id: '2',
    threadId: 't2',
    from: { name: 'Lisa Wang', email: 'lisa.wang@company.com', initials: 'LW' },
    to: ['you@example.com', 'david.kim@company.com'],
    subject: 'Re: Project deadline reminder',
    snippet:
      'Hi team, just a reminder that our project deadline is this Friday. Please submit your final reports.',
    body: 'Hi team, just a reminder that our project deadline is this Friday. Please submit your final reports.',
    timestamp: daysAgo(1, -0, -30), // Mar 13, 2:30 PM
    isStarred: false,
    isRead: false, // Unread - shows in bold
    folder: 'inbox',
    labels: [],
  },
  {
    id: '3',
    threadId: 't2',
    from: { name: 'David Kim', email: 'david.kim@company.com', initials: 'DK' },
    to: ['lisa.wang@company.com', 'you@example.com'],
    subject: 'Re: Project deadline reminder',
    snippet: "Thanks Lisa! I'll have my section ready by Thursday afternoon.",
    body: "Thanks Lisa! I'll have my section ready by Thursday afternoon.",
    timestamp: daysAgo(0, 23, 10), // Mar 13, 4:20 PM (22 hours ago)
    isStarred: false,
    isRead: false, // Unread - shows in bold
    folder: 'inbox',
    labels: [],
  },

  // Local Library - Position 3
  {
    id: '4',
    threadId: 't3',
    from: {
      name: 'Local Library',
      email: 'newsletter@library.org',
      initials: 'LL',
    },
    to: ['you@example.com'],
    subject: 'Monthly newsletter',
    snippet: 'Check out our new arrivals and upcoming events this month at your local library.',
    body: "Check out our new arrivals and upcoming events this month at your local library.\n\nNew Books:\n- Fiction bestsellers\n- Science & Technology\n- Children's section\n\nUpcoming Events:\n- Book club meeting\n- Author signing\n- Story time for kids",
    timestamp: daysAgo(1),
    isStarred: false,
    isRead: true, // Read
    folder: 'inbox',
    labels: [],
  },

  // StreamingService - Position 4
  {
    id: '5',
    threadId: 't4',
    from: {
      name: 'StreamingService',
      email: 'noreply@streaming.com',
      initials: 'SS',
    },
    to: ['you@example.com'],
    subject: 'Your subscription is expiring',
    snippet:
      'Your monthly subscription will expire in 3 days. Renew now to continue enjoying our content.',
    body: 'Your monthly subscription will expire in 3 days. Renew now to continue enjoying our content.\n\nCurrent plan: Premium\nExpires: March 17, 2030\n\nRenew now to keep watching!',
    timestamp: daysAgo(1, 20, 14), // Tue, Mar 12, 7:00 PM (44 hours ago)
    isStarred: false,
    isRead: true, // Read
    folder: 'inbox',
    labels: [],
  },

  // Outdoor Club - Position 5
  {
    id: '6',
    threadId: 't5',
    from: {
      name: 'Outdoor Club',
      email: 'info@outdoorclub.org',
      initials: 'OC',
    },
    to: ['you@example.com'],
    subject: 'Weekend hiking trip',
    snippet:
      'Join us this Saturday for a scenic hike at Blue Mountain Trail. All skill levels welcome!',
    body: 'Join us this Saturday for a scenic hike at Blue Mountain Trail. All skill levels welcome!',
    timestamp: daysAgo(1, 22, 44), // Mar 12, 4:30 PM (46 hours ago)
    isStarred: true,
    isRead: false, // Unread - shows in bold
    folder: 'inbox',
    labels: [],
  },

  // Emma Thompson thread - Position 6
  {
    id: '7',
    threadId: 't6',
    from: {
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      initials: 'ET',
    },
    to: ['you@example.com'],
    subject: 'Re: Coffee catch-up?',
    snippet: "Hey! It's been ages since we last caught up. Want to grab coffee sometime this week?",
    body: "Hey! It's been ages since we last caught up. Want to grab coffee sometime this week?",
    timestamp: daysAgo(2, 4),
    isStarred: false,
    isRead: true, // Read
    folder: 'inbox',
    labels: [],
  },
  {
    id: '8',
    threadId: 't6',
    from: { name: 'You', email: 'you@example.com', initials: 'YO' },
    to: ['emma.thompson@email.com'],
    subject: 'Re: Coffee catch-up?',
    snippet:
      "Absolutely! I'd love to catch up. How about Thursday afternoon around 3 PM? There's a nice new cafe on 5th Street called Brew & Beans.",
    body: "Absolutely! I'd love to catch up. How about Thursday afternoon around 3 PM? There's a nice new cafe on 5th Street called Brew & Beans.",
    timestamp: daysAgo(2, 2),
    isStarred: false,
    isRead: true, // Read
    folder: 'inbox',
    labels: [],
  },

  // IT Department - Position 7
  {
    id: '9',
    threadId: 't7',
    from: { name: 'IT Department', email: 'it@company.com', initials: 'IT' },
    to: ['all@company.com'],
    subject: 'Important: Security update',
    snippet:
      'Please update your password before the end of the week as part of our security policy.',
    body: 'Please update your password before the end of the week as part of our security policy.',
    timestamp: daysAgo(2, 4),
    isStarred: false,
    isRead: true, // Unread - shows in bold
    folder: 'inbox',
    labels: [],
  },

  // Deals4U - Spam email (exact content from BMail)
  {
    id: '10',
    threadId: 't8',
    from: { name: 'Deals4U', email: 'no-reply@deals4u.biz', initials: 'D' },
    to: ['you@example.com'],
    subject: 'Free iPhone 15 - Act Now!',
    snippet:
      "You've been selected to receive a FREE iPhone 15! Just pay shipping. Limited time offer!!!",
    body: "You've been selected to receive a FREE iPhone 15! Just pay shipping. Limited time offer!!!",
    timestamp: new Date('2030-03-12T22:15:00'), // Mar 12, 10:15 PM (40 hours ago)
    isStarred: false,
    isRead: false,
    folder: 'spam',
    labels: [],
  },

  // John Qian - Trash email
  {
    id: '11',
    threadId: 't9',
    from: { name: 'John Qian', email: 'john@gmail.com', initials: 'JQ' },
    to: ['Sam Parker'],
    subject: 'Re: Lunch tomorrow?',
    snippet: 'Sure! How about that new sushi place on Main Street?',
    body: 'Sure! How about that new sushi place on Main Street?',
    timestamp: new Date('2030-03-12T15:14:00'), // Mar 12, 3:14 PM (2 days ago)
    isStarred: false,
    isRead: true,
    folder: 'trash',
    labels: [],
  },
];

// Get initial emails for the application
export function getInitialEmails(): Email[] {
  // Return a fresh copy of the emails array
  return mockEmails.map((email) => ({ ...email }));
}
