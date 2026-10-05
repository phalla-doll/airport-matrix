import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CityTimezone, AppSettings } from '../types';
import { DotMatrixText } from './DotMatrixText';
import { getTimeInfo, getTimeDifference } from '../utils/cities';
import { sound } from '../utils/soundEngine';
import { Sun, Moon, Star, Trash2, ArrowUp, ArrowDown, Plus, RefreshCw } from 'lucide-react';

interface WorldClockListProps {
  cities: CityTimezone[];
  homeCity: CityTimezone;
  settings: AppSettings;
  onSetHomeCity: (cityId: string) => void;
  onRemoveCity: (cityId: string) => void;
  onReorderCities: (startIndex: number, endIndex: number) => void;
  onOpenSearch: () => void;
}

export const WorldClockList: React.FC<WorldClockListProps> = ({
  cities,
  homeCity,
  settings,
  onSetHomeCity,
  onRemoveCity,
  onReorderCities,
  onOpenSearch,
}) => {
  const [, setTick] = useState(0);
  const [flipIteration, setFlipIteration] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cascading mechanical split-flap flutter sound on mount or manual refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      sound.playFlapFlutter(Math.min(8, cities.length));
    }, 80);
    return () => clearTimeout(timer);
  }, [flipIteration, cities.length]);

  const handleFlipBoard = () => {
    setIsFlipping(true);
    setFlipIteration((prev) => prev + 1);
    setTimeout(() => setIsFlipping(false), 600);
  };

  const isLight = settings.theme === 'light';

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Airport Departure Display Frame */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
          isLight
            ? 'bg-neutral-50 border-neutral-300 shadow-xl'
            : 'bg-neutral-950 border-neutral-800 shadow-2xl shadow-black/80'
        }`}
      >
        {/* Terminal FIDS Top Header Strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800/80 text-[10px] font-mono tracking-widest text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase">FLIGHT INFORMATION DISPLAY SYSTEM</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <button
              onClick={handleFlipBoard}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[10px]"
              title="Trigger mechanical split-flap cascading flip"
            >
              <RefreshCw size={11} className={isFlipping ? 'animate-spin' : ''} />
              <span>FLIP BOARD</span>
            </button>
            <span>·</span>
            <span>HOME: {homeCity.airportCode}</span>
            <span>·</span>
            <span>{cities.length} ACTIVE PORTS</span>
          </div>
        </div>

        {/* Airport Board Table Header */}
        <div className="flex items-center justify-between py-2.5 px-3 sm:px-6 border-b border-neutral-800 bg-neutral-900/30 text-[10px] sm:text-xs font-mono tracking-widest text-neutral-500 uppercase">
          <div className="flex-1 min-w-[120px] sm:min-w-[180px]">CITY / DESTINATION</div>
          <div className="w-20 hidden md:block text-center">AIRPORT</div>
          <div className="w-32 sm:w-44 text-right pr-2">LOCAL TIME</div>
          <div className="w-16 sm:w-20 text-center">DIFF</div>
          <div className="w-20 sm:w-24 text-right hidden sm:block">STATUS</div>
          <div className="w-14 sm:w-16 text-right">ACTIONS</div>
        </div>

        {/* City Rows with 3D mechanical split-flap perspective */}
        <div
          className="divide-y divide-neutral-800/80"
          style={{ perspective: 1200 }}
        >
          <AnimatePresence mode="popLayout">
            {cities.map((city, index) => {
              const timeInfo = getTimeInfo(city.timezone, settings.is24Hour);
              const diffString = getTimeDifference(city.timezone, homeCity.timezone);
              const isHome = city.id === homeCity.id;

              return (
                <motion.div
                  key={`${city.id}-${flipIteration}`}
                  initial={{ opacity: 0, rotateX: -65, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateX: 60, y: 8, scale: 0.98 }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(index * 0.055, 0.45),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    transformOrigin: '50% 0%',
                    transformStyle: 'preserve-3d',
                  }}
                  className={`group relative flex items-center justify-between py-3.5 px-3 sm:px-6 transition-colors duration-150 overflow-hidden ${
                    isHome
                      ? isLight
                        ? 'bg-neutral-200/50'
                        : 'bg-neutral-900/60'
                      : isLight
                      ? 'hover:bg-neutral-200/40'
                      : 'hover:bg-neutral-900/30'
                  }`}
                >
                  {/* Subtle mechanical horizontal flap slit line */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-neutral-800/50 pointer-events-none z-10 opacity-50" />

                  {/* City Destination Column */}
                  <div className="flex-1 min-w-[120px] sm:min-w-[180px] flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <DotMatrixText
                        text={city.city.toUpperCase()}
                        dotColor={settings.dotColor}
                        theme={settings.theme}
                        displayStyle={settings.displayStyle}
                        size="sm"
                      />
                      {isHome && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 font-semibold tracking-wider">
                          HOME
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-neutral-500">
                      <span>{city.country}</span>
                      <span className="hidden sm:inline">· {city.flightNumber}</span>
                      <span className="sm:hidden font-semibold text-neutral-400">({city.airportCode})</span>
                    </div>
                  </div>

                  {/* Airport Code Column */}
                  <div className="w-20 hidden md:flex flex-col items-center justify-center">
                    <span className="font-mono text-xs font-bold text-neutral-300 tracking-wider">
                      {city.airportCode}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500 truncate max-w-[80px]">
                      GATE {city.gate || 'T1'}
                    </span>
                  </div>

                  {/* Local Time Column */}
                  <div className="w-32 sm:w-44 flex items-center justify-end gap-1.5 pr-2">
                    <DotMatrixText
                      text={timeInfo.timeString}
                      dotColor={settings.dotColor}
                      theme={settings.theme}
                      displayStyle={settings.displayStyle}
                      size="md"
                    />
                    {settings.showSeconds && (
                      <DotMatrixText
                        text={timeInfo.secondsString}
                        dotColor={settings.dotColor}
                        theme={settings.theme}
                        displayStyle={settings.displayStyle}
                        size="xs"
                      />
                    )}
                    {!settings.is24Hour && timeInfo.dayPeriod && (
                      <span className="text-[10px] font-mono text-neutral-400 font-semibold ml-0.5">
                        {timeInfo.dayPeriod}
                      </span>
                    )}
                  </div>

                  {/* Time Difference Column */}
                  <div className="w-16 sm:w-20 flex flex-col items-center justify-center">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        diffString === 'HOME'
                          ? 'text-amber-400'
                          : diffString.startsWith('+')
                          ? 'text-emerald-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {diffString}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      {timeInfo.dateFormatted.split(',')[0]}
                    </span>
                  </div>

                  {/* Status & Sun/Moon Column */}
                  <div className="w-20 sm:w-24 hidden sm:flex items-center justify-end gap-2 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono font-medium text-neutral-300">
                        {timeInfo.isDay ? 'DAYLIGHT' : 'NIGHT'}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-500">ON TIME</span>
                    </div>
                    <div className="p-1 rounded bg-neutral-800/80 text-neutral-400">
                      {timeInfo.isDay ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-cyan-400" />}
                    </div>
                  </div>

                  {/* Row Actions */}
                  <div className="w-14 sm:w-16 flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {!isHome && (
                      <button
                        onClick={() => {
                          sound.playDroplet();
                          onSetHomeCity(city.id);
                        }}
                        title="Set as Home base"
                        className="p-1 text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star size={13} />
                      </button>
                    )}

                    {/* Reorder Buttons */}
                    <div className="hidden sm:flex flex-col">
                      {index > 0 && (
                        <button
                          onClick={() => {
                            sound.playDroplet();
                            onReorderCities(index, index - 1);
                          }}
                          className="text-neutral-600 hover:text-neutral-300 cursor-pointer p-0.5"
                          title="Move up"
                        >
                          <ArrowUp size={11} />
                        </button>
                      )}
                      {index < cities.length - 1 && (
                        <button
                          onClick={() => {
                            sound.playDroplet();
                            onReorderCities(index, index + 1);
                          }}
                          className="text-neutral-600 hover:text-neutral-300 cursor-pointer p-0.5"
                          title="Move down"
                        >
                          <ArrowDown size={11} />
                        </button>
                      )}
                    </div>

                    {cities.length > 1 && (
                      <button
                        onClick={() => {
                          sound.playMatrixFlip();
                          onRemoveCity(city.id);
                        }}
                        title="Remove from board"
                        className="p-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Add City Trigger Bottom Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            sound.playDroplet();
            onOpenSearch();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer border ${
            isLight
              ? 'bg-neutral-200 border-neutral-300 hover:bg-neutral-300 text-neutral-800'
              : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          <Plus size={15} />
          <span>ADD AIRPORT DESTINATION</span>
        </button>
      </div>
    </div>
  );
};
