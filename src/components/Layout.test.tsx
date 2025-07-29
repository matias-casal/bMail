import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { useEmails } from '../hooks/useEmails';

// Mock the components
vi.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./EmailList', () => ({
  EmailList: () => <div data-testid="email-list">Email List</div>,
}));

vi.mock('./ThreadView', () => ({
  ThreadView: () => <div data-testid="thread-view">Thread View</div>,
}));

// Mock the useEmails hook
vi.mock('../hooks/useEmails', () => ({
  useEmails: vi.fn(),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render EmailList when no thread is selected', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: null,
    } as any);

    render(<Layout />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('email-list')).toBeInTheDocument();
    expect(screen.queryByTestId('thread-view')).not.toBeInTheDocument();
  });

  it('should render ThreadView when a thread is selected', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: { id: 'thread-1', emails: [] },
    } as any);

    render(<Layout />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('thread-view')).toBeInTheDocument();
    expect(screen.queryByTestId('email-list')).not.toBeInTheDocument();
  });

  it('should render BMail logo', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: null,
    } as any);

    render(<Layout />);

    const logo = screen.getByAltText('Gmail');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/bmail-logo.png');
    expect(logo).toHaveAttribute('width', '109');
    expect(logo).toHaveAttribute('height', '40');
  });

  it('should have correct layout structure', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: null,
    } as any);

    const { container } = render(<Layout />);

    // Check main container
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('flex', 'min-h-screen');

    // Check left gray bar
    const leftBar = mainContainer?.firstChild;
    expect(leftBar).toHaveClass('w-[68px]', 'shrink-0', 'bg-[rgb(233,238,246)]');

    // Check content area
    const contentArea = mainContainer?.lastChild;
    expect(contentArea).toHaveClass('flex', 'grow', 'flex-col', 'bg-[rgb(248,250,253)]');
  });

  it('should render header with correct height', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: null,
    } as any);

    const { container } = render(<Layout />);

    const header = container.querySelector('.h-16.px-4.py-2');
    expect(header).toBeInTheDocument();
  });

  it('should apply correct logo styles', () => {
    vi.mocked(useEmails).mockReturnValue({
      currentThread: null,
    } as any);

    render(<Layout />);

    const logo = screen.getByAltText('Gmail');
    expect(logo).toHaveStyle({
      color: 'transparent',
      objectFit: 'cover',
      objectPosition: 'center',
      width: '109px',
      height: '40px',
    });
  });
});
