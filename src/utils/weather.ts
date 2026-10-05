import { useState, useEffect } from 'react';
import { CityTimezone } from '../types';

interface WeatherCacheEntry {
  temp: number;
  timestamp: number;
}

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

// Solar-thermodynamic estimation based on latitude, season, and local hour
export function getEstimatedTemperature(lat: number, _lon: number, timezone: string): number {
  try {
    const now = new Date();
    // Local hour
    const localHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const localHour = parseInt(localHourStr, 10) || 12;

    // Day of year for seasonal angle
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Latitude base temperature: ~28°C at equator, down to ~0°C near poles
    const latAbs = Math.abs(lat);
    let baseTemp = 28 - latAbs * 0.38;

    // Seasonal shift: peak in July (day 196) for North, Jan (day 15) for South
    const isNorth = lat >= 0;
    const peakDay = isNorth ? 196 : 15;
    const seasonAngle = ((dayOfYear - peakDay) / 365) * 2 * Math.PI;
    const seasonalAmplitude = Math.min(14, latAbs * 0.25);
    baseTemp += Math.cos(seasonAngle) * seasonalAmplitude;

    // Diurnal variation: lowest around 05:00, warmest around 14:30
    const diurnalAngle = ((localHour - 14.5) / 24) * 2 * Math.PI;
    const diurnalVariation = Math.cos(diurnalAngle) * 4.5;

    return Math.round(baseTemp + diurnalVariation);
  } catch {
    return 21;
  }
}

// Fetch live temperature from Open-Meteo with caching and graceful estimation fallback
export async function fetchCityTemperature(city: CityTimezone): Promise<number> {
  const cacheKey = `fids_temp_${city.id}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: WeatherCacheEntry = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.temp;
      }
    }
  } catch {
    // Ignore cache error
  }

  // Fetch from Open-Meteo
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat.toFixed(4)}&longitude=${city.lon.toFixed(4)}&current=temperature_2m&timezone=${encodeURIComponent(city.timezone)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.current?.temperature_2m !== undefined) {
        const liveTemp = Math.round(data.current.temperature_2m);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ temp: liveTemp, timestamp: Date.now() })
          );
        } catch {
          // Ignore storage error
        }
        return liveTemp;
      }
    }
  } catch {
    // Network fail or timeout - fallback to thermodynamic calculation
  }

  return getEstimatedTemperature(city.lat, city.lon, city.timezone);
}

// React hook to manage temperatures for active cities
export function useCityTemperatures(cities: CityTimezone[]): Record<string, number> {
  const [temps, setTemps] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const city of cities) {
      initial[city.id] = getEstimatedTemperature(city.lat, city.lon, city.timezone);
    }
    return initial;
  });

  useEffect(() => {
    let isMounted = true;

    // Set immediate baselines for any new cities
    setTemps((prev) => {
      const updated = { ...prev };
      let changed = false;
      for (const city of cities) {
        if (updated[city.id] === undefined) {
          updated[city.id] = getEstimatedTemperature(city.lat, city.lon, city.timezone);
          changed = true;
        }
      }
      return changed ? updated : prev;
    });

    // Fetch live weather in background for each city
    cities.forEach(async (city) => {
      const liveTemp = await fetchCityTemperature(city);
      if (isMounted) {
        setTemps((prev) => {
          if (prev[city.id] === liveTemp) return prev;
          return { ...prev, [city.id]: liveTemp };
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cities]);

  return temps;
}
