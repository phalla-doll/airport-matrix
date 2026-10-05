import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, CityTimezone } from '../types';
import { DotMatrixText } from './DotMatrixText';
import { sound } from '../utils/soundEngine';
import { Play, Pause, RotateCcw, Plane, Bell, CheckCircle2 } from 'lucide-react';

interface FocusTimerProps {
  settings: AppSettings;
  homeCity: CityTimezone;
}

const PRESETS = [
  { label: 'QUICK HOP', minutes: 15, flight: 'HOP 15' },
  { label: 'STANDARD GATE', minutes: 25, flight: 'FOC 25' },
  { label: 'LONG HAUL', minutes: 45, flight: 'DEEP 45' },
  { label: 'TRANS-PACIFIC', minutes: 60, flight: 'PAC 60' },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({ settings, homeCity }) => {
  const [selectedPreset, setSelectedPreset] = useState(1); // 25 min default
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isLight = settings.theme === 'light';

  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            setIsCompleted(true);
            sound.playBoardingChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, remainingSeconds]);

  const selectPreset = (index: number) => {
    sound.playDroplet();
    setSelectedPreset(index);
    const secs = PRESETS[index].minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsActive(false);
    setIsCompleted(false);
  };

  const toggleStartPause = () => {
    sound.playDroplet();
    if (isCompleted) {
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    sound.playDroplet();
    setIsActive(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  // Flight status determination
  let statusText = 'GATE OPEN';
  let statusColor = 'text-neutral-400';
  if (isCompleted) {
    statusText = 'ARRIVED';
    statusColor = 'text-emerald-400';
  } else if (isActive) {
    if (remainingSeconds <= 300) {
      statusText = 'FINAL CALL';
      statusColor = 'text-amber-400';
    } else {
      statusText = 'IN FLIGHT';
      statusColor = 'text-cyan-400';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] px-4 py-8 w-full max-w-2xl mx-auto">
      {/* Airport Departure Board Frame */}
      <div
        className={`w-full max-w-lg p-6 sm:p-8 rounded-2xl border ${
          isLight
            ? 'bg-neutral-100 border-neutral-300 shadow-xl'
            : 'bg-neutral-950 border-neutral-800 shadow-2xl shadow-black/80'
        }`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-6">
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-neutral-400 -rotate-45" />
            <span className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              TERMINAL 1 // FOCUS GATE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              {homeCity.airportCode} DEPARTURE
            </span>
          </div>
        </div>

        {/* Flight Information Ribbon */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 mb-6 rounded-lg bg-neutral-900/60 border border-neutral-800/60 text-center font-mono">
          <div>
            <div className="text-[9px] text-neutral-500 uppercase">FLIGHT</div>
            <div className="text-xs font-bold text-neutral-300">{PRESETS[selectedPreset].flight}</div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-500 uppercase">STATUS</div>
            <div className={`text-xs font-bold ${statusColor}`}>{statusText}</div>
          </div>
          <div>
            <div className="text-[9px] text-neutral-500 uppercase">GATE</div>
            <div className="text-xs font-bold text-neutral-300">B-12</div>
          </div>
        </div>

        {/* Main Countdown Display */}
        <div className="flex flex-col items-center justify-center py-6 my-2">
          <div className="p-4 rounded-xl bg-black/40 border border-neutral-900/80 flex items-center justify-center w-full">
            <DotMatrixText
              text={timeString}
              dotColor={settings.dotColor}
              theme={settings.theme}
              displayStyle={settings.displayStyle}
              size="2xl"
            />
          </div>

          {/* Progress bar resembling runway strip */}
          <div className="relative w-full mt-6 bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800 flex items-center">
            <div
              className="h-full bg-gradient-to-r from-neutral-600 via-neutral-300 to-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            {/* Plane marker riding the runway */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-amber-400 transition-all duration-500 pointer-events-none"
              style={{ left: `${Math.max(4, Math.min(96, progress))}%` }}
            >
              <Plane size={14} className="rotate-45" />
            </div>
          </div>
          <div className="flex justify-between w-full mt-1.5 text-[9px] font-mono text-neutral-500">
            <span>TAKEOFF ({homeCity.airportCode})</span>
            <span>{Math.round(progress)}% EN ROUTE</span>
            <span>TOUCHDOWN</span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESETS.map((p, idx) => (
            <button
              key={p.label}
              onClick={() => selectPreset(idx)}
              className={`py-2 px-1 text-center rounded-lg border font-mono text-xs transition-colors cursor-pointer ${
                selectedPreset === idx
                  ? isLight
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-transparent text-neutral-500 border-neutral-800 hover:text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="text-[10px] text-neutral-400">{p.minutes}M</div>
              <div className="text-[9px] truncate">{p.label}</div>
            </button>
          ))}
        </div>

        {/* Fine-tune duration +5m / -5m buttons */}
        <div className="flex items-center justify-center gap-3 mb-6 text-xs font-mono text-neutral-400">
          <button
            onClick={() => {
              sound.playDroplet();
              const newSecs = Math.max(60, remainingSeconds - 300);
              setTotalSeconds(newSecs);
              setRemainingSeconds(newSecs);
            }}
            disabled={isActive}
            className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
          >
            -5 MIN
          </button>
          <span className="text-[10px] text-neutral-500">ADJUST GATE TIME</span>
          <button
            onClick={() => {
              sound.playDroplet();
              const newSecs = remainingSeconds + 300;
              setTotalSeconds(newSecs);
              setRemainingSeconds(newSecs);
            }}
            disabled={isActive}
            className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
          >
            +5 MIN
          </button>
        </div>

        {/* Actions Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={toggleStartPause}
            className={`flex items-center justify-center gap-2 w-36 py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer shadow-lg ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 text-black'
                : isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black'
                : 'bg-white hover:bg-neutral-200 text-black'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={16} />
                <span>NEW FLIGHT</span>
              </>
            ) : isActive ? (
              <>
                <Pause size={16} />
                <span>HOLD / PAUSE</span>
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" />
                <span>BOARDING</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center p-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900/60 transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => {
              sound.playBoardingChime();
            }}
            className="flex items-center justify-center p-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900/60 transition-colors cursor-pointer"
            title="Test airport departure chime"
          >
            <Bell size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
