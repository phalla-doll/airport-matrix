/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { AppMode, ViewTab, AppSettings, CityTimezone } from './types';
import { ALL_CITIES, DEFAULT_CITY_IDS } from './utils/cities';
import { sound } from './utils/soundEngine';
import { TopNav } from './components/TopNav';
import { BottomBar } from './components/BottomBar';
import { WorldClockList } from './components/WorldClockList';
import { AnalogWatch } from './components/AnalogWatch';
import { FocusTimer } from './components/FocusTimer';
import { WorldMap } from './components/WorldMap';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SearchModal } from './components/SearchModal';
import { CoffeeModal } from './components/CoffeeModal';

const STORAGE_KEYS = {
  SETTINGS: 'fids_settings_v1',
  CITIES: 'fids_city_ids_v1',
  HOME: 'fids_home_city_v1',
  MODE: 'fids_app_mode_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  displayStyle: 'fids',
  dotColor: 'white',
  soundMode: 'system',
  volume: 0.7,
  is24Hour: true,
  showSeconds: true,
  theme: 'dark',
  homeCityId: 'jfk',
};

export default function App() {
  // Load persistent state or fall back to defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [activeCityIds, setActiveCityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_CITY_IDS;
  });

  const [homeCityId, setHomeCityId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOME);
      if (saved) return saved;
    } catch {
      // Ignore
    }
    return 'jfk';
  });

  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODE);
      if (saved && (saved === 'watch' || saved === 'focus' || saved === 'world')) {
        return saved as AppMode;
      }
    } catch {
      // Ignore
    }
    return 'world';
  });

  const [viewTab, setViewTab] = useState<ViewTab>('clock');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    sound.setSoundMode(settings.soundMode);
    sound.setVolume(settings.volume);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(activeCityIds));
  }, [activeCityIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOME, homeCityId);
  }, [homeCityId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, currentMode);
  }, [currentMode]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '1') {
        sound.playMatrixFlip();
        setCurrentMode('watch');
      } else if (e.key === '2') {
        sound.playMatrixFlip();
        setCurrentMode('focus');
      } else if (e.key === '3') {
        sound.playMatrixFlip();
        setCurrentMode('world');
      } else if (e.key === 'm' || e.key === 'M') {
        sound.playDroplet();
        setViewTab((prev) => (prev === 'clock' ? 'map' : 'clock'));
      } else if (e.key === '/' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sound.playDroplet();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsSearchOpen(false);
        setIsCoffeeOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute active city objects in order
  const activeCities = useMemo(() => {
    return activeCityIds
      .map((id) => ALL_CITIES.find((c) => c.id === id))
      .filter((c): c is CityTimezone => Boolean(c));
  }, [activeCityIds]);

  const homeCity = useMemo(() => {
    return ALL_CITIES.find((c) => c.id === homeCityId) || activeCities[0] || ALL_CITIES[1];
  }, [homeCityId, activeCities]);

  const isLight = settings.theme === 'light';

  // City list handlers
  const handleSetHomeCity = (cityId: string) => {
    setHomeCityId(cityId);
  };

  const handleRemoveCity = (cityId: string) => {
    setActiveCityIds((prev) => prev.filter((id) => id !== cityId));
  };

  const handleReorderCities = (startIndex: number, endIndex: number) => {
    setActiveCityIds((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(startIndex, 1);
      copy.splice(endIndex, 0, moved);
      return copy;
    });
  };

  const handleAddCity = (city: CityTimezone) => {
    if (!activeCityIds.includes(city.id)) {
      setActiveCityIds((prev) => [...prev, city.id]);
    }
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between transition-colors duration-300 ${
        isLight ? 'bg-neutral-100 text-neutral-900' : 'bg-black text-white'
      }`}
    >
      {/* Background Matrix Pattern Grid Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20 fids-scanlines" />

      {/* Top Bar Navigation */}
      <TopNav
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onOpenSettings={() => {
          sound.playDroplet();
          setIsSettingsOpen(true);
        }}
        onOpenSearch={() => {
          sound.playDroplet();
          setIsSearchOpen(true);
        }}
        isLight={isLight}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center w-full overflow-x-hidden">
        {currentMode === 'watch' && (
          <AnalogWatch
            cities={activeCities}
            settings={settings}
            homeCity={homeCity}
            onUpdateSettings={setSettings}
          />
        )}

        {currentMode === 'focus' && (
          <FocusTimer settings={settings} homeCity={homeCity} />
        )}

        {currentMode === 'world' && (
          <>
            {viewTab === 'clock' ? (
              <WorldClockList
                cities={activeCities}
                homeCity={homeCity}
                settings={settings}
                onSetHomeCity={handleSetHomeCity}
                onRemoveCity={handleRemoveCity}
                onReorderCities={handleReorderCities}
                onOpenSearch={() => setIsSearchOpen(true)}
              />
            ) : (
              <WorldMap
                cities={activeCities}
                homeCity={homeCity}
                settings={settings}
                onSetHomeCity={handleSetHomeCity}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Information & Map/Clock Switcher Bar */}
      <BottomBar
        viewTab={viewTab}
        onSelectViewTab={(tab) => setViewTab(tab)}
        homeCity={homeCity}
        settings={settings}
        isLight={isLight}
      />

      {/* Settings Drawer (slides in from left) */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenCoffee={() => {
          setIsSettingsOpen(false);
          setIsCoffeeOpen(true);
        }}
      />

      {/* Search & Add City Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        activeCityIds={activeCityIds}
        onAddCity={handleAddCity}
        settings={settings}
      />

      {/* Buy Me a Coffee Boarding Pass Modal */}
      <CoffeeModal
        isOpen={isCoffeeOpen}
        onClose={() => setIsCoffeeOpen(false)}
        isLight={isLight}
      />
    </div>
  );
}
