// Frozen time: March 14th, 2030 @ 3:14 PM
export const FROZEN_TIME = new Date('2030-03-14T15:14:00');

export function getCurrentTime(): Date {
  return new Date(FROZEN_TIME);
}

export function formatTime(date: Date, extendHourDisplay: boolean = true): string {
  const now = getCurrentTime();
  // const diffMs = now.getTime() - date.getTime();
  // const diffHours = diffMs / (1000 * 60 * 60);

  // Check if same day
  const isSameDay =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  // If same day and extendHourDisplay is true, show time
  if (isSameDay && extendHourDisplay) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }

  // Otherwise show date
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
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function getRelativeTime(date: Date): string {
  const now = getCurrentTime();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else {
    return `${diffDays} days ago`;
  }
}
