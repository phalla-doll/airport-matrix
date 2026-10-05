import React from 'react';
import { ViewTab, CityTimezone, AppSettings } from '../types';
import { getTimeInfo } from '../utils/cities';
import { sound } from '../utils/soundEngine';
import { Clock, Map, Radio } from 'lucide-react';

interface BottomBarProps {
  viewTab: ViewTab;
  onSelectViewTab: (tab: ViewTab) => void;
  homeCity: CityTimezone;
  settings: AppSettings;
  isLight: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  viewTab,
  onSelectViewTab,
  homeCity,
  settings,
  isLight,
}) => {
  const timeInfo = getTimeInfo(homeCity.timezone, settings.is24Hour);
  const offsetStr = `GMT${timeInfo.offsetHours >= 0 ? `+${timeInfo.offsetHours}` : timeInfo.offsetHours}`;

  const handleTabChange = (tab: ViewTab) => {
    sound.playDroplet();
    onSelectViewTab(tab);
  };

  return (
    <footer
      className={`w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-t transition-colors ${
        isLight
          ? 'border-neutral-300 text-neutral-800 bg-neutral-100/90'
          : 'border-neutral-900/90 text-neutral-400 bg-black/80'
      } backdrop-blur-md`}
    >
      {/* Clock / Map Toggle Pill */}
      <div
        className={`flex items-center p-1 rounded-full border ${
          isLight
            ? 'bg-neutral-200 border-neutral-300'
            : 'bg-neutral-900/80 border-neutral-800'
        }`}
      >
        <button
          onClick={() => handleTabChange('clock')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider transition-colors cursor-pointer ${
            viewTab === 'clock'
              ? isLight
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-neutral-700/80 text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Clock size={13} />
          <span>CLOCK</span>
        </button>

        <button
          onClick={() => handleTabChange('map')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider transition-colors cursor-pointer ${
            viewTab === 'map'
              ? isLight
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-neutral-700/80 text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Map size={13} />
          <span>MAP</span>
        </button>
      </div>

      {/* Middle: Current Timezone Indicator (e.g. "New York · GMT-4") */}
      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
        <Radio size={13} className="text-emerald-500 animate-pulse" />
        <span className="font-semibold text-neutral-200">
          {homeCity.city}
        </span>
        <span className="text-neutral-600">·</span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
          {offsetStr}
        </span>
      </div>

      {/* Right: Date (e.g., Sun, 04 Oct) */}
      <div className="text-xs font-mono text-neutral-400 font-semibold tracking-wider">
        <span>{timeInfo.dateFormatted}</span>
      </div>
    </footer>
  );
};
