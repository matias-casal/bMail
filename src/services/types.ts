// API Response types for future backend integration
import { Email, Thread, Config } from '../types';

// API types represent the data format from backend
export interface ApiEmail extends Omit<Email, 'timestamp' | 'from'> {
  timestamp: string; // ISO string from API
  from: {
    name: string;
    email: string;
    // initials are calculated client-side
  };
}

export interface ApiThread extends Omit<Thread, 'lastMessageTime' | 'emails'> {
  emailIds: string[]; // API returns IDs instead of full emails
  lastMessageTime: string; // ISO string from API
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  settings: Config;
}

// Request types
export interface MoveEmailRequest {
  emailId: string;
  folder: 'inbox' | 'spam' | 'trash';
}

export interface ToggleStarRequest {
  emailId: string;
  isStarred: boolean;
}

export interface MarkAsReadRequest {
  emailId: string;
  isRead: boolean;
}
