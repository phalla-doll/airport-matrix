import React from 'react';
import { AppSettings, DotColorId, SoundMode, DisplayStyle } from '../types';
import { sound } from '../utils/soundEngine';
import {
  X,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Coffee,
  Palette,
  ExternalLink,
  Sliders,
  Moon,
  Sun,
  LayoutGrid,
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onOpenCoffee: () => void;
}

const COLOR_SWATCHES: { id: DotColorId; label: string; color: string }[] = [
  { id: 'white', label: 'Classic White', color: '#FFFFFF' },
  { id: 'amber', label: 'Airport Amber', color: '#F59E0B' },
  { id: 'green', label: 'Radar Green', color: '#22C55E' },
  { id: 'cyan', label: 'Cockpit Cyan', color: '#06B6D4' },
  { id: 'orange', label: 'Sunset Orange', color: '#F97316' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenCoffee,
}) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  const handleSoundModeChange = (mode: SoundMode) => {
    sound.playDroplet();
    sound.setSoundMode(mode);
    onUpdateSettings((prev) => ({ ...prev, soundMode: mode }));
    if (mode === 'watch') {
      sound.startWatchTick();
    } else {
      sound.stopWatchTick();
    }
  };

  const handleVolumeChange = (vol: number) => {
    sound.setVolume(vol);
    onUpdateSettings((prev) => ({ ...prev, volume: vol }));
  };

  const handleColorChange = (color: DotColorId) => {
    sound.playDroplet();
    onUpdateSettings((prev) => ({ ...prev, dotColor: color }));
  };

  const handleDisplayStyle = (style: DisplayStyle) => {
    sound.playMatrixFlip();
    onUpdateSettings((prev) => ({ ...prev, displayStyle: style }));
  };

  const handleThemeToggle = () => {
    sound.playDroplet();
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings((prev) => ({ ...prev, theme: nextTheme }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={() => {
          sound.playDroplet();
          onClose();
        }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Container (Slides from left as requested!) */}
      <div
        className={`relative z-10 w-full max-w-sm h-full flex flex-col shadow-2xl transition-transform duration-300 animate-in slide-in-from-left ${
          isLight
            ? 'bg-neutral-100 text-neutral-900 border-r border-neutral-300'
            : 'bg-neutral-950 text-neutral-100 border-r border-neutral-800'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800/80 bg-neutral-900/30">
          <div className="flex items-center gap-2.5">
            <Sliders size={18} className="text-neutral-400" />
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase">
              FLIGHT DECK SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playDroplet();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Settings Options */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Display Style: Digital vs FIDS Dot-Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                <LayoutGrid size={14} />
                DISPLAY STYLE
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {settings.displayStyle === 'fids' ? 'Matrix LEDs' : 'Modern Monospace'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <button
                onClick={() => handleDisplayStyle('fids')}
                className={`py-2 px-3 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  settings.displayStyle === 'fids'
                    ? isLight
                      ? 'bg-neutral-900 text-white shadow'
                      : 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                FIDS (MATRIX)
              </button>
              <button
                onClick={() => handleDisplayStyle('digital')}
                className={`py-2 px-3 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  settings.displayStyle === 'digital'
                    ? isLight
                      ? 'bg-neutral-900 text-white shadow'
                      : 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                DIGITAL
              </button>
            </div>
          </div>

          {/* Color Themes for the Dots */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                <Palette size={14} />
                DOT-MATRIX COLOR THEME
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_SWATCHES.map((swatch) => {
                const isSelected = settings.dotColor === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    onClick={() => handleColorChange(swatch.id)}
                    title={swatch.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white/80 bg-neutral-800 scale-105 shadow-md'
                        : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full mb-1 border border-black/40 shadow-sm"
                      style={{ backgroundColor: swatch.color }}
                    />
                    <span className="text-[9px] font-mono text-neutral-400 truncate w-full text-center">
                      {swatch.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Mode: Dark vs Light */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                {isLight ? <Sun size={14} /> : <Moon size={14} />}
                APPEARANCE
              </span>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'bg-neutral-200/80 border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                {isLight ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-cyan-400" />}
                <span>{isLight ? 'LIGHT MODE (SOFT GRAY)' : 'DARK MODE (JET BLACK)'}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-800/60">
                SWITCH
              </span>
            </button>
          </div>

          {/* Sound Options: Mute / System / Watch */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                <Volume2 size={14} />
                SOUND PRESETS
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {settings.soundMode}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <button
                onClick={() => handleSoundModeChange('mute')}
                className={`py-2 px-2 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.soundMode === 'mute'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <VolumeX size={13} />
                <span>MUTE</span>
              </button>
              <button
                onClick={() => handleSoundModeChange('system')}
                className={`py-2 px-2 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.soundMode === 'system'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Sparkles size={13} />
                <span>SYSTEM</span>
              </button>
              <button
                onClick={() => handleSoundModeChange('watch')}
                className={`py-2 px-2 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  settings.soundMode === 'watch'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Clock size={13} />
                <span>WATCH</span>
              </button>
            </div>

            {/* Volume Control Slider */}
            {settings.soundMode !== 'mute' && (
              <div className="mt-3.5 px-3 py-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                  <span>VOLUME</span>
                  <span>{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Time Format Toggles */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
                <Clock size={14} />
                TIME FORMAT
              </span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  sound.playDroplet();
                  onUpdateSettings((prev) => ({ ...prev, is24Hour: !prev.is24Hour }));
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs font-mono cursor-pointer hover:border-neutral-700"
              >
                <span className="text-neutral-300">24-Hour Departure Format</span>
                <span className="font-bold text-neutral-100">
                  {settings.is24Hour ? '24H (18:30)' : '12H (6:30 PM)'}
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playDroplet();
                  onUpdateSettings((prev) => ({ ...prev, showSeconds: !prev.showSeconds }));
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs font-mono cursor-pointer hover:border-neutral-700"
              >
                <span className="text-neutral-300">Live Seconds Ticker</span>
                <span className="font-bold text-neutral-100">
                  {settings.showSeconds ? 'VISIBLE' : 'HIDDEN'}
                </span>
              </button>
            </div>
          </div>

          {/* "Buy me a coffee" Support Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                sound.playDroplet();
                onOpenCoffee();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
            >
              <Coffee size={16} />
              <span>BUY ME A COFFEE // SUPPORT</span>
            </button>
          </div>

          {/* Promo Card for "Off-Time – Gallery Companion" */}
          <div className="pt-2">
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900/80 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  DISCOVER COMPANION APP
                </span>
                <ExternalLink size={12} className="text-neutral-500" />
              </div>
              <h4 className="font-mono text-xs font-bold text-neutral-200">
                Off-Time – Gallery Companion
              </h4>
              <p className="text-[11px] font-mono text-neutral-400 mt-1 leading-relaxed">
                Mindful museum companion & quiet artwork contemplation for slow looking.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  iOS / Web
                </span>
                <span className="text-[9px] font-mono text-neutral-500">
                  Featured in Art & Culture
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 px-6 border-t border-neutral-800/80 bg-neutral-900/40 text-[10px] font-mono text-neutral-500 flex justify-between">
          <span>AIRPORT MATRIX v2.4</span>
          <span>FLIGHT INFO SYSTEM</span>
        </div>
      </div>
    </div>
  );
};
