import { useContext } from 'react';
import { EmailContext } from '../store/EmailContext';

export function useEmails() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmails must be used within EmailProvider');
  }
  return context;
}
