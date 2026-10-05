import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppMode } from '../types';
import { sound } from '../utils/soundEngine';
import { SlidersHorizontal, Plus, Maximize2, Minimize2 } from 'lucide-react';

interface TopNavProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  isLight: boolean;
}

const MODES: { id: AppMode; label: string }[] = [
  { id: 'watch', label: 'Watch' },
  { id: 'focus', label: 'Focus' },
  { id: 'world', label: 'World Time' },
];

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onSelectMode,
  onOpenSettings,
  onOpenSearch,
  isLight,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    sound.playDroplet();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleModeChange = (mode: AppMode) => {
    sound.playMatrixFlip();
    onSelectMode(mode);
  };

  return (
    <header
      className={`w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between transition-colors ${
        isLight ? 'text-neutral-900' : 'text-neutral-100'
      }`}
    >
      {/* Left: Settings Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playDroplet();
            onOpenSettings();
          }}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            isLight
              ? 'bg-neutral-200 border-neutral-300 hover:bg-neutral-300 text-neutral-800'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
          }`}
          title="Flight deck settings & themes"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Center: "Watch | Focus | World Time" segmented pills with moving indicator */}
      <div
        className={`relative flex items-center p-1 rounded-full border ${
          isLight
            ? 'bg-neutral-200/90 border-neutral-300'
            : 'bg-neutral-900/90 border-neutral-800/90 shadow-inner'
        }`}
      >
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`relative z-10 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider transition-colors cursor-pointer ${
                isActive
                  ? isLight
                    ? 'text-neutral-900'
                    : 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {mode.label}
              {isActive && (
                <motion.span
                  layoutId="active-nav-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className={`absolute inset-0 rounded-full -z-10 shadow-sm ${
                    isLight ? 'bg-white' : 'bg-neutral-700/80 border border-neutral-600/50'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Add City & Expand/Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sound.playDroplet();
            onOpenSearch();
          }}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            isLight
              ? 'bg-neutral-200 border-neutral-300 hover:bg-neutral-300 text-neutral-800'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
          }`}
          title="Add airport / search cities"
        >
          <Plus size={16} />
        </button>

        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-xl transition-all cursor-pointer border hidden sm:flex ${
            isLight
              ? 'bg-neutral-200 border-neutral-300 hover:bg-neutral-300 text-neutral-800'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
          }`}
          title="Toggle expand / fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};

