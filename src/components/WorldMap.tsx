import React, { useState, useEffect, useMemo } from 'react';
import { CityTimezone, AppSettings } from '../types';
import { DotMatrixText } from './DotMatrixText';
import { getTimeInfo, getTimeDifference } from '../utils/cities';
import { sound } from '../utils/soundEngine';
import { Sun, Moon, Plane, X } from 'lucide-react';

interface WorldMapProps {
  cities: CityTimezone[];
  homeCity: CityTimezone;
  settings: AppSettings;
  onSetHomeCity: (cityId: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  cities,
  homeCity,
  settings,
  onSetHomeCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityTimezone | null>(cities[0] || homeCity);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLight = settings.theme === 'light';

  // Map coordinates projection: Equirectangular (-180 to 180 lon -> 0 to 1000, 90 to -90 lat -> 0 to 500)
  const mapWidth = 1000;
  const mapHeight = 500;

  const project = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Calculate approximate Solar Terminator curve
  // Subsolar point calculation from current UTC
  const terminatorPath = useMemo(() => {
    const now = new Date();
    // Day of year
    const start = new Date(now.getUTCFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Approximate solar declination in degrees
    const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
    // Subsolar longitude from UTC time
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const subsolarLon = (12 - utcHours) * 15; // 15 degrees per hour

    // Generate night polygon path across longitude
    const points: { x: number; y: number }[] = [];
    const step = 5;

    for (let lon = -180; lon <= 180; lon += step) {
      const deltaLon = ((lon - subsolarLon) * Math.PI) / 180;
      const decRad = (declination * Math.PI) / 180;

      // Latitude where solar elevation is 0
      // tan(lat) = -cos(deltaLon) / tan(dec)
      let lat = 0;
      if (Math.abs(Math.tan(decRad)) > 0.001) {
        lat = (Math.atan(-Math.cos(deltaLon) / Math.tan(decRad)) * 180) / Math.PI;
      }
      points.push(project(lat, lon));
    }

    if (declination >= 0) {
      // North pole has daylight, south pole has night
      return `M 0,${mapHeight} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${mapWidth},${mapHeight} Z`;
    } else {
      // South pole has daylight, north pole has night
      return `M 0,0 L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${mapWidth},0 Z`;
    }
  }, [project, mapWidth, mapHeight]);

  const homePoint = project(homeCity.lat, homeCity.lon);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Map Card Container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border ${
          isLight
            ? 'bg-neutral-100 border-neutral-300 shadow-xl'
            : 'bg-neutral-950 border-neutral-800 shadow-2xl shadow-black/80'
        }`}
      >
        {/* Terminal Map Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              RADAR TRACKER // GLOBAL NETWORK
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
            <span>HOME: {homeCity.airportCode}</span>
            <span>·</span>
            <span>{cities.length} ACTIVE AIRPORTS</span>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="relative w-full aspect-[2/1] overflow-hidden bg-black select-none">
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}
                  strokeWidth="0.8"
                />
              </pattern>

              {/* Glowing radar line gradient */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

            {/* Continent simplified landmass vector paths */}
            <g
              fill={isLight ? '#E5E7EB' : '#141416'}
              stroke={isLight ? '#D1D5DB' : '#262626'}
              strokeWidth="0.8"
            >
              {/* North America */}
              <path d="M 120,70 L 220,60 L 280,100 L 290,140 L 240,160 L 250,210 L 220,240 L 190,200 L 140,190 L 100,140 Z" />
              {/* Greenland */}
              <path d="M 330,40 L 380,45 L 360,90 L 310,75 Z" />
              {/* South America */}
              <path d="M 270,260 L 340,280 L 370,350 L 330,440 L 290,440 L 270,360 L 255,290 Z" />
              {/* Europe */}
              <path d="M 460,100 L 540,90 L 560,140 L 510,180 L 460,170 L 440,140 Z" />
              {/* Africa */}
              <path d="M 450,190 L 550,190 L 590,260 L 560,370 L 510,400 L 470,350 L 440,260 Z" />
              {/* Asia */}
              <path d="M 560,80 L 800,70 L 870,120 L 840,200 L 760,260 L 680,240 L 620,180 L 560,160 Z" />
              {/* Australia */}
              <path d="M 780,330 L 870,330 L 890,390 L 850,430 L 780,410 L 760,360 Z" />
              {/* Japan archipelago */}
              <path d="M 850,160 L 870,180 L 860,210 L 845,190 Z" />
              {/* UK & Ireland */}
              <path d="M 450,115 L 465,110 L 460,135 L 445,130 Z" />
              {/* New Zealand */}
              <path d="M 910,400 L 930,420 L 920,445 L 905,420 Z" />
            </g>

            {/* Night-time Solar Terminator Shade */}
            <path
              d={terminatorPath}
              fill="rgba(0, 0, 0, 0.45)"
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {/* Equator & Prime Meridian dashed lines */}
            <line
              x1="0"
              y1="250"
              x2={mapWidth}
              y2="250"
              stroke={isLight ? '#D1D5DB' : '#222222'}
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
            <line
              x1="500"
              y1="0"
              x2="500"
              y2={mapHeight}
              stroke={isLight ? '#D1D5DB' : '#222222'}
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />

            {/* Flight Arcs linking Home City to Other Cities */}
            {cities.map((city) => {
              if (city.id === homeCity.id) return null;
              const p = project(city.lat, city.lon);
              // Calculate curved midpoint for arching flight route
              const midX = (homePoint.x + p.x) / 2;
              const midY = Math.min(homePoint.y, p.y) - Math.abs(homePoint.x - p.x) * 0.12 - 25;
              const pathD = `M ${homePoint.x},${homePoint.y} Q ${midX},${midY} ${p.x},${p.y}`;

              const isCitySelected = selectedCity?.id === city.id;

              return (
                <g key={`route-${city.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCitySelected ? '#F59E0B' : 'rgba(255, 255, 255, 0.18)'}
                    strokeWidth={isCitySelected ? 2 : 1}
                    strokeDasharray={isCitySelected ? 'none' : '3 3'}
                  />
                  {/* Subtle animated blip along path */}
                  {isCitySelected && (
                    <circle r="3" fill="#F59E0B">
                      <animateMotion path={pathD} dur="4s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Airport Markers */}
            {cities.map((city) => {
              const { x, y } = project(city.lat, city.lon);
              const isHome = city.id === homeCity.id;
              const isCurrentSelected = selectedCity?.id === city.id;

              return (
                <g
                  key={city.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    sound.playDroplet();
                    setSelectedCity(city);
                  }}
                >
                  {/* Radar pulse beacon */}
                  <circle
                    r={isCurrentSelected ? 12 : isHome ? 10 : 8}
                    fill="none"
                    stroke={isHome ? '#F59E0B' : '#22C55E'}
                    strokeWidth="1"
                    opacity="0.6"
                    className="animate-ping"
                  />

                  {/* Marker Dot */}
                  <circle
                    r={isCurrentSelected ? 5 : isHome ? 4.5 : 3.5}
                    fill={isHome ? '#F59E0B' : isCurrentSelected ? '#FFFFFF' : '#22C55E'}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />

                  {/* IATA Airport Tag */}
                  <text
                    x="8"
                    y="3"
                    fill={isCurrentSelected ? '#FFFFFF' : isHome ? '#F59E0B' : '#9CA3AF'}
                    fontSize="9"
                    fontFamily="'Chakra Petch', monospace"
                    fontWeight="bold"
                    letterSpacing="0.5"
                  >
                    {city.airportCode}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected City Popover Card */}
          {selectedCity && (
            <div
              className={`absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 p-4 rounded-xl border backdrop-blur-md transition-all ${
                isLight
                  ? 'bg-white/90 border-neutral-300 text-neutral-900 shadow-xl'
                  : 'bg-neutral-900/90 border-neutral-700/80 text-white shadow-2xl'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono tracking-wide">
                      {selectedCity.city.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 font-semibold">
                      {selectedCity.airportCode}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    {selectedCity.country} · {selectedCity.flightNumber}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCity(null)}
                  className="p-1 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Live Dot-Matrix Local Time */}
              <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">LOCAL TIME</div>
                  <div className="flex items-center gap-1 mt-1">
                    <DotMatrixText
                      text={getTimeInfo(selectedCity.timezone, settings.is24Hour).timeString}
                      dotColor={settings.dotColor}
                      theme={settings.theme}
                      displayStyle={settings.displayStyle}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">DIFF</div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                    {getTimeDifference(selectedCity.timezone, homeCity.timezone)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800/80">
                  {getTimeInfo(selectedCity.timezone, settings.is24Hour).isDay ? (
                    <Sun size={13} className="text-amber-400" />
                  ) : (
                    <Moon size={13} className="text-cyan-400" />
                  )}
                  <span className="text-[10px] font-mono text-neutral-300">
                    {getTimeInfo(selectedCity.timezone, settings.is24Hour).isDay ? 'DAY' : 'NIGHT'}
                  </span>
                </div>
              </div>

              {/* Set as Home button */}
              {selectedCity.id !== homeCity.id && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => {
                      sound.playMatrixFlip();
                      onSetHomeCity(selectedCity.id);
                    }}
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-mono font-semibold tracking-wider transition-colors cursor-pointer"
                  >
                    SET AS PRIMARY HOME BASE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info legend */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-neutral-900/60 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              HOME BASE ({homeCity.airportCode})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              DESTINATIONS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-neutral-600 border-t border-dashed" />
              DAY/NIGHT TERMINATOR
            </span>
          </div>
          <div>FLIGHTS IN LIVE RADAR SYNC</div>
        </div>
      </div>
    </div>
  );
};
