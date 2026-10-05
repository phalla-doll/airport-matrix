import React, { useState, useEffect } from 'react';
import { CityTimezone, AppSettings } from '../types';
import { DotMatrixText } from './DotMatrixText';
import { getTimeInfo, getTimeDifference } from '../utils/cities';
import { sound } from '../utils/soundEngine';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface AnalogWatchProps {
  cities: CityTimezone[];
  settings: AppSettings;
  homeCity: CityTimezone;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
}

export const AnalogWatch: React.FC<AnalogWatchProps> = ({
  cities,
  settings,
  homeCity,
  onUpdateSettings,
}) => {
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const currentCity = cities[selectedCityIndex] || homeCity;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 100); // 10fps for smooth clock updates
    return () => clearInterval(timer);
  }, []);

  // Compute angles for the current city
  const cityDate = new Date(now.toLocaleString('en-US', { timeZone: currentCity.timezone }));
  const hours = cityDate.getHours();
  const minutes = cityDate.getMinutes();
  const seconds = cityDate.getSeconds();
  const millis = cityDate.getMilliseconds();

  const secondFraction = seconds + millis / 1000;
  const secondAngle = secondFraction * 6; // 360 / 60
  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  const timeInfo = getTimeInfo(currentCity.timezone, settings.is24Hour);
  const diffString = getTimeDifference(currentCity.timezone, homeCity.timezone);

  const isLight = settings.theme === 'light';

  const handlePrevCity = () => {
    sound.playDroplet();
    setSelectedCityIndex((prev) => (prev > 0 ? prev - 1 : cities.length - 1));
  };

  const handleNextCity = () => {
    sound.playDroplet();
    setSelectedCityIndex((prev) => (prev < cities.length - 1 ? prev + 1 : 0));
  };

  const toggleWatchTick = () => {
    sound.playDroplet();
    const nextMode = settings.soundMode === 'watch' ? 'system' : 'watch';
    onUpdateSettings((prev) => ({ ...prev, soundMode: nextMode }));
    if (nextMode === 'watch') {
      sound.startWatchTick();
    } else {
      sound.stopWatchTick();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] px-4 py-6 w-full max-w-2xl mx-auto">
      {/* City Switcher Header */}
      <div className="flex items-center justify-between w-full max-w-sm mb-6 px-3 py-1.5 rounded-full bg-neutral-900/50 dark:bg-neutral-900/80 border border-neutral-800/80">
        <button
          onClick={handlePrevCity}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Previous City"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-xs font-mono font-semibold tracking-wider text-neutral-300">
            {currentCity.city.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            {currentCity.airportCode}
          </span>
        </div>

        <button
          onClick={handleNextCity}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Next City"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Analog Watch Bezel */}
      <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-full p-2 bg-gradient-to-b from-neutral-800/40 via-neutral-900/80 to-black shadow-2xl border border-neutral-800">
        {/* Outer Dial Rim with 60 Minute Tick Marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          <circle
            cx="200"
            cy="200"
            r="192"
            fill="none"
            stroke={isLight ? '#E5E7EB' : '#262626'}
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="none"
            stroke={isLight ? '#F3F4F6' : '#171717'}
            strokeWidth="1"
          />

          {/* 60 Minute & 5-minute ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 * Math.PI) / 180;
            const isHour = i % 5 === 0;
            const rInner = isHour ? 168 : 176;
            const rOuter = 184;

            const x1 = 200 + rInner * Math.sin(angle);
            const y1 = 200 - rInner * Math.cos(angle);
            const x2 = 200 + rOuter * Math.sin(angle);
            const y2 = 200 - rOuter * Math.cos(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  isHour
                    ? isLight
                      ? '#4B5563'
                      : '#9CA3AF'
                    : isLight
                    ? '#D1D5DB'
                    : '#404040'
                }
                strokeWidth={isHour ? (i % 15 === 0 ? 2.5 : 1.8) : 1}
              />
            );
          })}
        </svg>

        {/* Watch Dial Face */}
        <div
          className={`relative flex items-center justify-center w-[340px] h-[340px] sm:w-[360px] sm:h-[360px] rounded-full ${
            isLight ? 'bg-neutral-100 text-neutral-900' : 'bg-black text-white'
          }`}
        >
          {/* Large semi-transparent gray numerals (12, 3, 6, 9) */}
          <div className="absolute top-5 text-4xl sm:text-5xl font-mono font-bold text-neutral-400/30 select-none tracking-tighter">
            12
          </div>
          <div className="absolute right-7 text-4xl sm:text-5xl font-mono font-bold text-neutral-400/30 select-none tracking-tighter">
            3
          </div>
          <div className="absolute bottom-5 text-4xl sm:text-5xl font-mono font-bold text-neutral-400/30 select-none tracking-tighter">
            6
          </div>
          <div className="absolute left-7 text-4xl sm:text-5xl font-mono font-bold text-neutral-400/30 select-none tracking-tighter">
            9
          </div>

          {/* Subdial 1: Top Digital Dot-Matrix Time Readout */}
          <div className="absolute top-20 flex flex-col items-center">
            <div className="flex items-center gap-1.5">
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
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                {currentCity.airportCode} · {diffString}
              </span>
            </div>
          </div>

          {/* Subdial 2: Bottom Date & Status */}
          <div className="absolute bottom-20 flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-wider font-semibold text-neutral-400 uppercase">
              {timeInfo.dateFormatted}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 mt-0.5">
              {currentCity.flightNumber} · GATE {currentCity.gate}
            </span>
          </div>

          {/* Hands Container */}
          <div className="relative w-full h-full pointer-events-none">
            {/* Hour Hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-2 origin-bottom -ml-1 rounded-full transition-transform duration-75"
              style={{
                height: '75px',
                transform: `rotate(${hourAngle}deg)`,
                backgroundColor: isLight ? '#1F2937' : '#FFFFFF',
                boxShadow: isLight
                  ? '0 2px 8px rgba(0,0,0,0.15)'
                  : '0 0 10px rgba(255,255,255,0.2)',
              }}
            >
              {/* Luminous line insert */}
              <div className="absolute top-2 left-0.5 right-0.5 bottom-6 bg-neutral-400/40 rounded-full" />
            </div>

            {/* Minute Hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-1.5 origin-bottom -ml-[3px] rounded-full transition-transform duration-75"
              style={{
                height: '110px',
                transform: `rotate(${minuteAngle}deg)`,
                backgroundColor: isLight ? '#111827' : '#E5E7EB',
                boxShadow: isLight
                  ? '0 2px 8px rgba(0,0,0,0.2)'
                  : '0 0 12px rgba(255,255,255,0.25)',
              }}
            >
              <div className="absolute top-2 left-[1px] right-[1px] bottom-8 bg-neutral-400/40 rounded-full" />
            </div>

            {/* Thin Red Second Hand with Counterweight */}
            <div
              className="absolute left-1/2 bottom-1/2 w-[1.5px] origin-bottom -ml-[0.75px] transition-transform duration-75"
              style={{
                height: '135px',
                transform: `rotate(${secondAngle}deg)`,
                backgroundColor: '#EF4444',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
              }}
            >
              {/* Counter-balance tail */}
              <div
                className="absolute top-[135px] left-[-1.5px] w-1 h-7 bg-red-500 rounded-full"
                style={{ transform: 'translateY(-100%)' }}
              />
            </div>

            {/* Center Pin / Cap */}
            <div className="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-red-500 border-2 border-neutral-900 shadow-md z-10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Watch Mode Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={toggleWatchTick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
            settings.soundMode === 'watch'
              ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
          title="Toggle mechanical watch ticking sound"
        >
          {settings.soundMode === 'watch' ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>TICKING: {settings.soundMode === 'watch' ? 'ON' : 'OFF'}</span>
        </button>

        <div className="flex items-center gap-1 text-xs font-mono text-neutral-500">
          <Compass size={14} />
          <span>TIMEZONE: GMT{timeInfo.offsetHours >= 0 ? `+${timeInfo.offsetHours}` : timeInfo.offsetHours}</span>
        </div>
      </div>
    </div>
  );
};
