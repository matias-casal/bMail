export interface Email {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
    initials: string;
  };
  to: string[];
  subject: string;
  snippet: string;
  body: string;
  timestamp: Date;
  isStarred: boolean;
  isRead: boolean;
  folder: 'inbox' | 'starred' | 'all' | 'spam' | 'trash';
  labels: string[];
}

export interface Thread {
  id: string;
  emails: Email[];
  participants: string[];
  subject: string;
  snippet: string;
  lastMessageTime: Date;
  isStarred: boolean;
  hasUnread: boolean;
  messageCount: number;
}

export interface Config {
  starFirstEmailInsteadOfLast: boolean;
  allowLastEmailCollapse: boolean;
  hideSpamButtonInTrash: boolean;
  showTotalCountInsteadOfUnread: boolean;
  showSpamInAllMail: boolean;
  removeStarOnTrash: boolean;
  extendHourDisplay: boolean;
  useYouInsteadOfMe: boolean;
  closeThreadWhenUnstarredInStarredView: boolean;
}

export type Folder = 'inbox' | 'starred' | 'all' | 'spam' | 'trash';

export interface FolderInfo {
  id: Folder;
  name: string;
  icon: string;
  count?: number;
}
