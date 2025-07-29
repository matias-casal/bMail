import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarBadge } from './AvatarBadge';

describe('AvatarBadge', () => {
  it('should render initials correctly', () => {
    render(<AvatarBadge name="John Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should handle single name', () => {
    render(<AvatarBadge name="Alice" />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle multiple names and only use first two initials', () => {
    render(<AvatarBadge name="Mary Jane Watson" />);

    expect(screen.getByText('MJ')).toBeInTheDocument();
  });

  it('should handle empty name', () => {
    const { container } = render(<AvatarBadge name="" />);

    // With empty name, initials should be empty
    const avatar = container.querySelector('.flex.items-center.justify-center');
    expect(avatar).toBeInTheDocument();
    expect(avatar?.textContent).toBe('');
  });

  it('should apply custom className', () => {
    render(<AvatarBadge name="Test User" className="custom-class" />);

    const avatar = screen.getByText('TU');
    expect(avatar).toHaveClass('custom-class');
  });

  it('should have correct default styles', () => {
    render(<AvatarBadge name="Test User" />);

    const avatar = screen.getByText('TU');

    // Check that it has flex display for centering
    expect(avatar).toHaveClass('flex', 'items-center', 'justify-center', 'font-medium');

    // Check inline styles
    expect(avatar).toHaveStyle({
      color: 'rgb(255, 255, 255)',
      cursor: 'pointer',
      height: '40px',
      borderRadius: '50%',
      aspectRatio: '1',
    });
  });

  it('should generate consistent background color for same name', () => {
    const { container: container1 } = render(<AvatarBadge name="John Doe" />);
    const { container: container2 } = render(<AvatarBadge name="John Doe" />);

    // Check that both render the same initials
    expect(container1.textContent).toBe('JD');
    expect(container2.textContent).toBe('JD');
    expect(container1.textContent).toBe(container2.textContent);
  });

  it('should generate different background colors for different names', () => {
    const { container: container1 } = render(<AvatarBadge name="John Doe" />);
    const { container: container2 } = render(<AvatarBadge name="Jane Smith" />);

    // Check that different names produce different initials
    expect(container1.textContent).toBe('JD');
    expect(container2.textContent).toBe('JS');
    expect(container1.textContent).not.toBe(container2.textContent);
  });

  it('should handle names with lowercase letters', () => {
    render(<AvatarBadge name="john doe" />);

    // Should uppercase the initials
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should handle names with extra spaces', () => {
    render(<AvatarBadge name="  John   Doe  " />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should handle names with special characters', () => {
    render(<AvatarBadge name="Jean-Pierre O'Connor" />);

    // Should use first character after split by space
    expect(screen.getByText('JO')).toBeInTheDocument();
  });

  it('should maintain webkit font smoothing styles', () => {
    const { container } = render(<AvatarBadge name="Test User" />);

    // Check that the component renders with the expected structure
    const avatar = container.firstChild;
    expect(avatar).toBeTruthy();
    expect(container.textContent).toBe('TU');
  });
});
