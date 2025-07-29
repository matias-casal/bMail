import { Sidebar } from './Sidebar';
import { EmailList } from './EmailList';
import { ThreadView } from './ThreadView';
import { useEmails } from '../hooks/useEmails';

// BMail logo
const BMailLogo = () => (
  <div className="relative h-[32px] w-[138px] overflow-hidden rounded">
    <img
      alt="Gmail"
      width="109"
      height="40"
      src="/bmail-logo.png"
      style={{
        color: 'transparent',
        objectFit: 'cover',
        objectPosition: 'center',
        width: '109px',
        height: '40px',
      }}
    />
  </div>
);

export function Layout() {
  const { currentThread } = useEmails();

  return (
    <div className="flex min-h-screen">
      {/* Left gray bar */}
      <div className="w-[68px] shrink-0 bg-[rgb(233,238,246)]"></div>

      {/* Main content */}
      <div className="flex grow flex-col bg-[rgb(248,250,253)]">
        {/* Header */}
        <div className="h-16 px-4 py-2">
          <BMailLogo />
        </div>

        {/* Body */}
        <div className="flex grow">
          {/* Sidebar */}
          <Sidebar />

          {/* Email content area */}
          {currentThread ? <ThreadView /> : <EmailList />}
        </div>
      </div>
    </div>
  );
}
