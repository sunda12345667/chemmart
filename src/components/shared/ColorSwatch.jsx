import React from 'react';

// Map color names to CSS colors
const COLOR_MAP = {
  white: '#FFFFFF',
  black: '#1a1a1a',
  red: '#e53e3e',
  blue: '#3182ce',
  green: '#38a169',
  yellow: '#d69e2e',
  orange: '#dd6b20',
  purple: '#805ad5',
  pink: '#d53f8c',
  grey: '#718096',
  gray: '#718096',
  brown: '#744210',
  transparent: 'transparent',
  natural: '#d4c5a9',
  clear: 'transparent',
  ivory: '#fffff0',
  beige: '#f5f5dc',
  cream: '#fffdd0',
  silver: '#c0c0c0',
  gold: '#ffd700',
  navy: '#001f5b',
  teal: '#008080',
  cyan: '#00bcd4',
  maroon: '#800000',
  lime: '#32cd32',
};

function getColor(name) {
  return COLOR_MAP[name.toLowerCase()] || '#cccccc';
}

export default function ColorSwatch({ color, size = 'md', selected, onClick }) {
  const bg = getColor(color);
  const isTransparent = bg === 'transparent';
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <button
      type="button"
      title={color}
      onClick={onClick}
      className={`
        ${sizeClass} rounded-full border flex-shrink-0 transition-all
        ${selected ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-2 hover:ring-muted-foreground hover:ring-offset-1'}
        ${isTransparent ? 'border-dashed border-muted-foreground' : 'border-border'}
        ${!onClick ? 'cursor-default' : 'cursor-pointer'}
      `}
      style={{
        background: isTransparent
          ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 8px 8px'
          : bg,
      }}
    />
  );
}