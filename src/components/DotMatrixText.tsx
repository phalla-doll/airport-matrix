import React from 'react';
import { MATRIX_CHARS, DOT_COLOR_THEMES, MatrixChar } from '../utils/dotMatrixData';
import { DotColorId, DisplayStyle } from '../types';

interface DotMatrixTextProps {
  text: string;
  dotColor?: DotColorId;
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  displayStyle?: DisplayStyle;
  glow?: boolean;
  className?: string;
  letterSpacing?: number;
}

const SIZE_CONFIGS = {
  xs: { dotRadius: 0.9, dotPitch: 2.8, charSpacing: 3.2, height: 20 },
  sm: { dotRadius: 1.1, dotPitch: 3.4, charSpacing: 4.2, height: 26 },
  md: { dotRadius: 1.4, dotPitch: 4.2, charSpacing: 5.2, height: 32 },
  lg: { dotRadius: 1.8, dotPitch: 5.4, charSpacing: 6.8, height: 42 },
  xl: { dotRadius: 2.4, dotPitch: 7.2, charSpacing: 9.0, height: 56 },
  '2xl': { dotRadius: 3.2, dotPitch: 9.6, charSpacing: 12.0, height: 74 },
  hero: { dotRadius: 4.2, dotPitch: 12.6, charSpacing: 16.0, height: 98 },
};

export const DotMatrixText: React.FC<DotMatrixTextProps> = ({
  text,
  dotColor = 'white',
  theme = 'dark',
  size = 'md',
  displayStyle = 'fids',
  glow = true,
  className = '',
}) => {
  const colorTheme = DOT_COLOR_THEMES[dotColor] || DOT_COLOR_THEMES.white;
  const isLight = theme === 'light';

  // For light theme, dots are black/charcoal
  const activeColor = isLight ? (dotColor === 'white' ? '#111827' : colorTheme.hex) : colorTheme.hex;
  const dimColor = isLight ? colorTheme.dimHexLight : colorTheme.dimHexDark;
  const activeGlow = !isLight && glow ? colorTheme.glow : 'transparent';

  if (displayStyle === 'digital') {
    const sizeClasses = {
      xs: 'text-xs tracking-wider',
      sm: 'text-sm tracking-wider',
      md: 'text-base tracking-widest',
      lg: 'text-xl tracking-widest',
      xl: 'text-3xl tracking-widest',
      '2xl': 'text-5xl tracking-widest',
      hero: 'text-7xl tracking-widest',
    };

    return (
      <span
        className={`font-mono font-bold uppercase select-none ${sizeClasses[size]} ${className}`}
        style={{
          color: activeColor,
          textShadow: glow && !isLight ? `0 0 10px ${activeGlow}` : 'none',
          fontFamily: "'DotGothic16', 'Chakra Petch', monospace",
        }}
      >
        {text}
      </span>
    );
  }

  // FIDS Dot-Matrix mode: genuine 5x7 dot grid per character with inactive ghost dots
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const { dotRadius, dotPitch, charSpacing } = config;
  const charWidth = 4 * dotPitch + dotRadius * 2;
  const charHeight = 6 * dotPitch + dotRadius * 2;
  const upperText = text.toUpperCase();

  const totalWidth =
    upperText.length > 0
      ? upperText.length * charWidth + (upperText.length - 1) * charSpacing + 4
      : 10;
  const totalHeight = charHeight + 4;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className={`inline-block select-none overflow-visible ${className}`}
      aria-label={text}
      role="img"
    >
      <defs>
        {glow && !isLight && (
          <filter id={`fids-glow-${dotColor}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={dotRadius * 0.6} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {upperText.split('').map((char, charIdx) => {
        const matrix: MatrixChar = MATRIX_CHARS[char] || MATRIX_CHARS[' '];
        const charStartX = 2 + charIdx * (charWidth + charSpacing);
        const startY = 2;

        return (
          <g key={`${char}-${charIdx}`} transform={`translate(${charStartX}, ${startY})`}>
            {/* Render 7 rows x 5 columns */}
            {matrix.map((row, rowIdx) =>
              row.map((active, colIdx) => {
                const cx = dotRadius + colIdx * dotPitch;
                const cy = dotRadius + rowIdx * dotPitch;
                const isDotActive = active === 1;

                return (
                  <circle
                    key={`${rowIdx}-${colIdx}`}
                    cx={cx}
                    cy={cy}
                    r={dotRadius}
                    fill={isDotActive ? activeColor : dimColor}
                    filter={isDotActive && glow && !isLight ? `url(#fids-glow-${dotColor})` : undefined}
                    opacity={isDotActive ? 1 : 0.45}
                  />
                );
              })
            )}
          </g>
        );
      })}
    </svg>
  );
};
