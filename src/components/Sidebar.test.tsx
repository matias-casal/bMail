import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { useEmails } from '../hooks/useEmails';

// Mock the useEmails hook
vi.mock('../hooks/useEmails', () => ({
  useEmails: vi.fn(),
}));

describe('Sidebar', () => {
  const mockSetCurrentFolder = vi.fn();
  const mockSelectThread = vi.fn();
  const mockGetFolderCount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useEmails).mockReturnValue({
      currentFolder: 'inbox',
      setCurrentFolder: mockSetCurrentFolder,
      getFolderCount: mockGetFolderCount,
      selectThread: mockSelectThread,
    } as any);

    // Mock folder counts
    mockGetFolderCount.mockImplementation((folder: string) => {
      if (folder === 'inbox') return 7;
      if (folder === 'spam') return 2;
      return 0;
    });
  });

  it('should render all folders', () => {
    render(<Sidebar />);

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Starred')).toBeInTheDocument();
    expect(screen.getByText('All Mail')).toBeInTheDocument();
    expect(screen.getByText('Spam')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();
  });

  it('should display folder counts for inbox and spam', () => {
    render(<Sidebar />);

    // Inbox should show count of 7
    const inboxFolder = screen.getByText('Inbox').closest('div');
    expect(inboxFolder).toHaveTextContent('7');

    // Spam should show count of 2
    const spamFolder = screen.getByText('Spam').closest('div');
    expect(spamFolder).toHaveTextContent('2');

    // Other folders should not show counts
    const starredFolder = screen.getByText('Starred').closest('div');
    expect(starredFolder).not.toHaveTextContent(/\d+/);
  });

  it('should highlight the current folder', () => {
    render(<Sidebar />);

    const inboxFolder = screen.getByText('Inbox').closest('div');
    expect(inboxFolder).toHaveClass('bg-[rgb(211,227,253)]', 'font-semibold');

    const spamFolder = screen.getByText('Spam').closest('div');
    expect(spamFolder).not.toHaveClass('bg-[rgb(211,227,253)]');
  });

  it('should change folder when clicked', () => {
    render(<Sidebar />);

    const spamFolder = screen.getByText('Spam').closest('div');
    fireEvent.click(spamFolder!);

    expect(mockSetCurrentFolder).toHaveBeenCalledWith('spam');
    expect(mockSelectThread).toHaveBeenCalledWith(null);
  });

  it('should clear selected thread when changing folders', () => {
    render(<Sidebar />);

    const starredFolder = screen.getByText('Starred').closest('div');
    fireEvent.click(starredFolder!);

    expect(mockSetCurrentFolder).toHaveBeenCalledWith('starred');
    expect(mockSelectThread).toHaveBeenCalledWith(null);
  });

  it('should render compose button placeholder', () => {
    const { container } = render(<Sidebar />);

    const composeButton = container.querySelector('.bg-\\[rgb\\(194\\,231\\,255\\)\\]');

    expect(composeButton).toBeInTheDocument();
    expect(composeButton).toHaveClass('opacity-50');
  });

  it('should render folder icons', () => {
    render(<Sidebar />);

    // Check that images are rendered with correct src
    const icons = screen.getAllByRole('img');
    expect(icons).toHaveLength(5); // 5 folders

    const iconSources = icons.map((icon) => icon.getAttribute('src'));
    expect(iconSources).toContain('/icons/icon-inbox.png');
    expect(iconSources).toContain('/icons/icon-star.png');
    expect(iconSources).toContain('/icons/icon-all-mail.png');
    expect(iconSources).toContain('/icons/icon-spam.png');
    expect(iconSources).toContain('/icons/icon-trash.png');
  });

  it('should apply hover styles to non-selected folders', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentFolder: 'inbox',
      setCurrentFolder: mockSetCurrentFolder,
      getFolderCount: mockGetFolderCount,
      selectThread: mockSelectThread,
    } as any);

    render(<Sidebar />);

    const spamFolder = screen.getByText('Spam').closest('div');
    expect(spamFolder).toHaveClass('hover:bg-[oklch(0.928_0.006_264.531)]');
  });

  it('should have correct layout styles', () => {
    const { container } = render(<Sidebar />);

    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass('w-[256px]', 'shrink-0', 'px-3', 'text-sm');
  });

  it('should handle different current folder selections', () => {
    // Test with starred as current folder
    vi.mocked(useEmails).mockReturnValue({
      currentFolder: 'starred',
      setCurrentFolder: mockSetCurrentFolder,
      getFolderCount: mockGetFolderCount,
      selectThread: mockSelectThread,
    } as any);

    const { rerender } = render(<Sidebar />);

    let starredFolder = screen.getByText('Starred').closest('div');
    expect(starredFolder).toHaveClass('bg-[rgb(211,227,253)]');

    // Change to trash as current folder
    vi.mocked(useEmails).mockReturnValue({
      currentFolder: 'trash',
      setCurrentFolder: mockSetCurrentFolder,
      getFolderCount: mockGetFolderCount,
      selectThread: mockSelectThread,
    } as any);

    rerender(<Sidebar />);

    const trashFolder = screen.getByText('Trash').closest('div');
    expect(trashFolder).toHaveClass('bg-[rgb(211,227,253)]');

    starredFolder = screen.getByText('Starred').closest('div');
    expect(starredFolder).not.toHaveClass('bg-[rgb(211,227,253)]');
  });

  it('should not show count when count is 0', () => {
    mockGetFolderCount.mockImplementation(() => 0);

    render(<Sidebar />);

    const folders = ['Inbox', 'Starred', 'All Mail', 'Spam', 'Trash'];
    folders.forEach((folderName) => {
      const folder = screen.getByText(folderName).closest('div');
      expect(folder?.textContent).toBe(folderName);
    });
  });
});
