import React from 'react';

interface AvatarBadgeProps {
  name: string;
  className?: string;
}

// Generate a consistent color based on a string using oklch color space
function stringToColor(str: string): string {
  // Calculate hash from string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate oklch values based on hash
  // L (lightness): 0.7-0.85 for good contrast with white text
  // C (chroma): 0.15-0.25 for vibrant colors
  // H (hue): 0-360 for full color spectrum
  const lightness = 0.7 + (Math.abs(hash >> 16) % 16) * 0.01;
  const chroma = 0.15 + (Math.abs(hash >> 8) % 11) * 0.01;
  const hue = Math.abs(hash) % 360;

  return `oklch(${lightness} ${chroma} ${hue})`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarBadge({ name, className = '' }: AvatarBadgeProps) {
  const backgroundColor = stringToColor(name);
  const initials = getInitials(name);

  // Style object to match the computed styles from the real system
  const avatarStyle: React.CSSProperties = {
    backgroundColor,
    color: 'rgb(255, 255, 255)',
    cursor: 'pointer',
    height: '40px',
    WebkitFontSmoothing: 'antialiased',
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  };

  return (
    <div
      className={`flex items-center justify-center font-medium ${className}`}
      style={{
        ...avatarStyle,
        borderRadius: '50%', // Ensure perfect circle
        aspectRatio: '1', // Force square aspect ratio
      }}
    >
      {initials}
    </div>
  );
}
