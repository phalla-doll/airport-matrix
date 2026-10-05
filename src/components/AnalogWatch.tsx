import React, { useState, useEffect } from 'react';
import { CityTimezone, AppSettings } from '../types';
import { getTimeInfo } from '../utils/cities';
import { sound } from '../utils/soundEngine';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  Compass,
  X,
} from 'lucide-react';

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
  const [movementStyle, setMovementStyle] = useState<'sweep' | 'quartz'>('sweep');
  const [now, setNow] = useState(new Date());

  // Alarm state
  const [alarmTime, setAlarmTime] = useState<string>('07:30');
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);

  const currentCity = cities[selectedCityIndex] || homeCity;

  // Clock tick / sweep loop
  useEffect(() => {
    let animId: number;
    if (movementStyle === 'sweep') {
      const update = () => {
        setNow(new Date());
        animId = requestAnimationFrame(update);
      };
      animId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(animId);
    } else {
      const timer = setInterval(() => {
        setNow(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [movementStyle]);

  // Alarm check
  useEffect(() => {
    if (!isAlarmEnabled || isAlarmRinging) return;
    const cityDate = new Date(now.toLocaleString('en-US', { timeZone: currentCity.timezone }));
    const currentH = String(cityDate.getHours()).padStart(2, '0');
    const currentM = String(cityDate.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;

    if (currentTimeStr === alarmTime && cityDate.getSeconds() === 0) {
      setIsAlarmRinging(true);
      sound.playBoardingChime();
    }
  }, [now, alarmTime, isAlarmEnabled, isAlarmRinging, currentCity.timezone]);

  // Compute angles for the current city
  const cityDate = new Date(now.toLocaleString('en-US', { timeZone: currentCity.timezone }));
  const hours = cityDate.getHours();
  const minutes = cityDate.getMinutes();
  const seconds = cityDate.getSeconds();
  const millis = movementStyle === 'sweep' ? cityDate.getMilliseconds() : 0;

  const secondFraction = seconds + millis / 1000;
  const secondAngle = secondFraction * 6; // 360 / 60
  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  // Alarm hand angle
  const [alarmH, alarmM] = alarmTime.split(':').map((v) => parseInt(v, 10) || 0);
  const alarmAngle = ((alarmH % 12) + alarmM / 60) * 30;

  const timeInfo = getTimeInfo(currentCity.timezone, settings.is24Hour);
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

  const toggleAlarm = () => {
    sound.playDroplet();
    setIsAlarmEnabled(!isAlarmEnabled);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[74vh] px-4 py-6 w-full max-w-2xl mx-auto select-none">
      {/* City Switcher Header */}
      <div className="flex items-center justify-between w-full max-w-xs mb-5 px-3 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800/80">
        <button
          onClick={handlePrevCity}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Previous City"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-xs font-mono font-semibold tracking-wider text-neutral-200">
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

      {/* Main Bold Watch Dial (Faithful match to reference screenshot) */}
      <div
        className={`relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 md:w-[410px] md:h-[410px] rounded-full p-2 transition-colors ${
          isLight
            ? 'bg-neutral-100 shadow-xl border border-neutral-300'
            : 'bg-[#141518] shadow-2xl shadow-black/90 border border-neutral-800/80'
        }`}
      >
        {/* Watch Dial Face */}
        <div
          className={`relative flex items-center justify-center w-full h-full rounded-full overflow-hidden ${
            isLight ? 'bg-neutral-100' : 'bg-[#111215]'
          }`}
        >
          {/* HUGE BOLD ROUNDED NUMERALS: 12, 3, 6, 9 */}
          {/* Top 12 */}
          <div
            className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 font-bold select-none leading-none tracking-tighter"
            style={{
              fontFamily: "'Fredoka', 'Quicksand', system-ui, sans-serif",
              fontSize: 'clamp(84px, 24vw, 126px)',
              color: isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)',
            }}
          >
            12
          </div>

          {/* Right 3 */}
          <div
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 font-bold select-none leading-none tracking-tighter"
            style={{
              fontFamily: "'Fredoka', 'Quicksand', system-ui, sans-serif",
              fontSize: 'clamp(84px, 24vw, 126px)',
              color: isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)',
            }}
          >
            3
          </div>

          {/* Bottom 6 */}
          <div
            className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 font-bold select-none leading-none tracking-tighter"
            style={{
              fontFamily: "'Fredoka', 'Quicksand', system-ui, sans-serif",
              fontSize: 'clamp(84px, 24vw, 126px)',
              color: isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)',
            }}
          >
            6
          </div>

          {/* Left 9 */}
          <div
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 font-bold select-none leading-none tracking-tighter"
            style={{
              fontFamily: "'Fredoka', 'Quicksand', system-ui, sans-serif",
              fontSize: 'clamp(84px, 24vw, 126px)',
              color: isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)',
            }}
          >
            9
          </div>

          {/* Alarm Indicator Marker (if enabled) */}
          {isAlarmEnabled && (
            <div
              className="absolute left-1/2 top-1/2 origin-bottom w-1 h-36 -ml-0.5 pointer-events-none transition-transform"
              style={{
                transform: `rotate(${alarmAngle}deg)`,
              }}
            >
              <div className="w-2.5 h-2.5 -ml-0.75 -mt-1 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
            </div>
          )}

          {/* Clock Hands Container */}
          <div className="relative w-full h-full pointer-events-none z-10">
            {/* 1. Chunky Bold White Rounded Pill Hour Hand */}
            <div
              className="absolute left-1/2 top-1/2 -ml-2.5 sm:-ml-3 w-5 sm:w-6 rounded-full transition-transform duration-75 shadow-lg"
              style={{
                height: '88px',
                transformOrigin: 'center 80px',
                transform: `translate(0, -80px) rotate(${hourAngle}deg)`,
                backgroundColor: isLight ? '#1F2937' : '#FFFFFF',
              }}
            />

            {/* 2. Longer Bold White Rounded Pill Minute Hand */}
            <div
              className="absolute left-1/2 top-1/2 -ml-2 sm:-ml-2.5 w-4 sm:w-5 rounded-full transition-transform duration-75 shadow-xl"
              style={{
                height: '142px',
                transformOrigin: 'center 134px',
                transform: `translate(0, -134px) rotate(${minuteAngle}deg)`,
                backgroundColor: isLight ? '#111827' : '#FFFFFF',
              }}
            />

            {/* 3. Continuous Thin Red Second Hand Line (Passes straight through center) */}
            <div
              className="absolute left-1/2 top-1/2 -ml-[1px] w-[2px] transition-transform duration-75"
              style={{
                height: '280px',
                transformOrigin: 'center 165px',
                transform: `translate(0, -165px) rotate(${secondAngle}deg)`,
                backgroundColor: '#FF3333',
                boxShadow: '0 0 4px rgba(255, 51, 51, 0.4)',
              }}
            />

            {/* 4. Center Red Dot Pin */}
            <div className="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-800" />
            </div>
          </div>

          {/* Sapphire crystal glass glare sheen */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06] mix-blend-screen z-20" />
        </div>
      </div>

      {/* Alarm & Watch Controls Panel */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 w-full max-w-md">
        {/* Alarm Toggle Button */}
        <button
          onClick={() => setIsAlarmModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
            isAlarmEnabled
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Set airport wake / flight departure alarm"
        >
          {isAlarmEnabled ? <Bell size={13} className="text-amber-400 animate-bounce" /> : <BellOff size={13} />}
          <span>ALARM: {alarmTime}</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
              isAlarmEnabled ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-500'
            }`}
          >
            {isAlarmEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Ticking Toggle */}
        <button
          onClick={toggleWatchTick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
            settings.soundMode === 'watch'
              ? 'bg-neutral-800 text-neutral-100 border-neutral-700'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle mechanical escapement tick sound"
        >
          {settings.soundMode === 'watch' ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>TICK: {settings.soundMode === 'watch' ? 'ON' : 'OFF'}</span>
        </button>

        {/* Hand Movement (Sweep vs Quartz) */}
        <button
          onClick={() => {
            sound.playDroplet();
            setMovementStyle((prev) => (prev === 'sweep' ? 'quartz' : 'sweep'));
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          title="Switch between fluid sweep and discrete quartz step"
        >
          <span>HAND:</span>
          <span className="font-bold text-neutral-200 uppercase">{movementStyle}</span>
        </button>

        {/* Timezone GMT Tag */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono bg-neutral-900/40 border border-neutral-800 text-neutral-500">
          <Compass size={13} />
          <span>GMT{timeInfo.offsetHours >= 0 ? `+${timeInfo.offsetHours}` : timeInfo.offsetHours}</span>
        </div>
      </div>

      {/* Alarm Configuration Modal */}
      {isAlarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-neutral-950 border border-neutral-800 text-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-200">
                <Bell size={16} className="text-amber-400" />
                <span>FLIGHT ALARM DECK</span>
              </div>
              <button
                onClick={() => {
                  sound.playDroplet();
                  setIsAlarmModalOpen(false);
                }}
                className="p-1 text-neutral-500 hover:text-neutral-300 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Alarm Time Input */}
            <div className="flex flex-col items-center py-4">
              <label className="text-[10px] font-mono text-neutral-500 uppercase mb-2">
                SET ALARM TIME ({currentCity.airportCode})
              </label>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-white font-mono text-3xl px-4 py-2 rounded-xl text-center outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {['06:00', '07:30', '08:00'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    sound.playDroplet();
                    setAlarmTime(preset);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                    alarmTime === preset
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleAlarm();
                  setIsAlarmModalOpen(false);
                }}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                  isAlarmEnabled
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20'
                }`}
              >
                {isAlarmEnabled ? 'DISABLE ALARM' : 'ACTIVATE ALARM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alarm Ringing Alert Overlay */}
      {isAlarmRinging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-950 border border-amber-500/60 p-6 text-center shadow-2xl animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 animate-bounce">
              <Bell size={32} />
            </div>
            <h3 className="font-mono text-base font-bold text-white mb-1">
              AIRPORT ALARM // {currentCity.airportCode}
            </h3>
            <p className="font-mono text-xs text-neutral-400 mb-6">
              Flight boarding call time reached ({alarmTime}).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  sound.playDroplet();
                  setIsAlarmRinging(false);
                  setIsAlarmEnabled(false);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold tracking-wider cursor-pointer shadow-lg"
              >
                DISMISS ALARM
              </button>
              <button
                onClick={() => {
                  sound.playDroplet();
                  setIsAlarmRinging(false);
                  // Snooze 5 minutes
                  const [h, m] = alarmTime.split(':').map(Number);
                  const totalM = (h * 60 + m + 5) % 1440;
                  const newH = String(Math.floor(totalM / 60)).padStart(2, '0');
                  const newM = String(totalM % 60).padStart(2, '0');
                  setAlarmTime(`${newH}:${newM}`);
                }}
                className="py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs font-semibold cursor-pointer"
              >
                SNOOZE (+5M)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
