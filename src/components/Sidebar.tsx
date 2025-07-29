import { FolderInfo } from '../types';
import { useEmails } from '../hooks/useEmails';

// Icon component that renders actual BMail icons
const Icon = ({ type }: { type: string }) => {
  const iconPaths: Record<string, string> = {
    inbox: '/icons/icon-inbox.png',
    starred: '/icons/icon-star.png',
    all: '/icons/icon-all-mail.png',
    spam: '/icons/icon-spam.png',
    trash: '/icons/icon-trash.png',
  };

  return <img src={iconPaths[type] || iconPaths.inbox} alt={type} className="h-5 w-5" />;
};

export function Sidebar() {
  const { currentFolder, setCurrentFolder, getFolderCount, selectThread } = useEmails();

  const folders: FolderInfo[] = [
    {
      id: 'inbox',
      name: 'Inbox',
      icon: 'inbox',
      count: getFolderCount('inbox'),
    },
    { id: 'starred', name: 'Starred', icon: 'starred' },
    { id: 'all', name: 'All Mail', icon: 'all' },
    { id: 'spam', name: 'Spam', icon: 'spam', count: getFolderCount('spam') },
    { id: 'trash', name: 'Trash', icon: 'trash' },
  ];

  return (
    <div className="w-[256px] shrink-0 px-3 text-sm">
      {/* Compose button placeholder */}
      <div className="mb-4 h-[56px] w-[138px] rounded-2xl bg-[rgb(194,231,255)] opacity-50"></div>

      {/* Folder list */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => {
            setCurrentFolder(folder.id);
            selectThread(null);
          }}
          className={`
            flex cursor-pointer items-center gap-4 rounded-full py-1.5 pr-3 pl-4
            ${
              currentFolder === folder.id
                ? 'bg-[rgb(211,227,253)] font-semibold text-[rgb(32,33,36)]'
                : 'hover:bg-[oklch(0.928_0.006_264.531)]'
            }
          `}
        >
          <Icon type={folder.icon} />
          <span className="flex-1">{folder.name}</span>
          {folder.count !== undefined && folder.count > 0 && (
            <span className="text-xs font-normal">{folder.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
