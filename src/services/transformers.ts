import { Email, Thread } from '../types';
import { ApiEmail, ApiThread } from './types';

/**
 * Transforms API email response to domain Email type
 */
export function transformApiEmailToDomain(apiEmail: ApiEmail): Email {
  return {
    ...apiEmail,
    timestamp: new Date(apiEmail.timestamp),
    from: {
      ...apiEmail.from,
      initials: getInitials(apiEmail.from.name),
    },
  };
}

/**
 * Transforms domain Email to API format
 */
export function transformDomainEmailToApi(email: Email): ApiEmail {
  const { from, timestamp, ...rest } = email;
  return {
    ...rest,
    timestamp: timestamp.toISOString(),
    from: {
      name: from.name,
      email: from.email,
    },
  };
}

/**
 * Transforms API thread response to domain Thread type
 */
export function transformApiThreadToDomain(apiThread: ApiThread, emails: Email[]): Thread {
  return {
    ...apiThread,
    lastMessageTime: new Date(apiThread.lastMessageTime),
    emails,
  };
}

/**
 * Gets initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
