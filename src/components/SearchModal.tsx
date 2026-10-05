import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ALL_CITIES, getTimeInfo } from '../utils/cities';
import { CityTimezone, AppSettings } from '../types';
import { sound } from '../utils/soundEngine';
import { Search, X, Check, Plane, Globe2 } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCityIds: string[];
  onAddCity: (city: CityTimezone) => void;
  settings: AppSettings;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  activeCityIds,
  onAddCity,
  settings,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default to suggested popular cities not currently added or all
      return ALL_CITIES;
    }
    return ALL_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.airportCode.toLowerCase().includes(q) ||
        c.airportName.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  const isLight = settings.theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl ${
          isLight
            ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
            : 'bg-neutral-950 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800 bg-neutral-900/40">
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search city, country, or IATA code (e.g. San, JFK)..."
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-neutral-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-500 hover:text-neutral-300 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={() => {
              sound.playDroplet();
              onClose();
            }}
            className="p-1 text-neutral-400 hover:text-white cursor-pointer ml-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-800/60 bg-neutral-900/20 text-xs font-mono text-neutral-400 overflow-x-auto">
          <span className="text-[10px] text-neutral-500 uppercase shrink-0">Try:</span>
          {['San', 'Tokyo', 'London', 'Dubai', 'Sydney', 'Paris'].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playDroplet();
                setQuery(s);
              }}
              className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] shrink-0 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-800/60">
          {filteredCities.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs">
              <Globe2 size={24} className="mx-auto mb-2 opacity-50" />
              <span>No airports matching &ldquo;{query}&rdquo;</span>
            </div>
          ) : (
            filteredCities.map((city) => {
              const isAdded = activeCityIds.includes(city.id);
              const timeInfo = getTimeInfo(city.timezone, settings.is24Hour);

              return (
                <div
                  key={city.id}
                  className={`flex items-center justify-between p-3.5 px-4 transition-colors ${
                    isLight ? 'hover:bg-neutral-200/50' : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center font-mono font-bold text-xs text-neutral-300 border border-neutral-800">
                      {city.airportCode}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-semibold tracking-wide text-neutral-100 flex items-center gap-2">
                        <span>{city.city}</span>
                        <span className="text-xs font-normal text-neutral-400">
                          ({city.country})
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <Plane size={11} className="text-neutral-500" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{city.airportName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-xs font-semibold text-neutral-300">
                        {timeInfo.timeString}
                      </div>
                      <div className="text-[9px] text-neutral-500">
                        GMT{timeInfo.offsetHours >= 0 ? `+${timeInfo.offsetHours}` : timeInfo.offsetHours}
                      </div>
                    </div>

                    <button
                      disabled={isAdded}
                      onClick={() => {
                        sound.playMatrixFlip();
                        onAddCity(city);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-neutral-800/80 text-neutral-500 cursor-default flex items-center gap-1'
                          : 'bg-white hover:bg-neutral-200 text-black shadow'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={12} />
                          <span>ADDED</span>
                        </>
                      ) : (
                        <span>+ ADD</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-neutral-800/80 bg-neutral-900/40 text-[10px] font-mono text-neutral-500 flex justify-between">
          <span>{filteredCities.length} DESTINATIONS AVAILABLE</span>
          <span>PRESS ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
