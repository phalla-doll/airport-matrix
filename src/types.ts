export interface CityTimezone {
  id: string;
  city: string;
  country: string;
  airportCode: string;
  airportName: string;
  timezone: string;
  lat: number;
  lon: number;
  flightNumber?: string;
  gate?: string;
}

export type AppMode = 'watch' | 'focus' | 'world';
export type ViewTab = 'clock' | 'map';
export type DisplayStyle = 'fids' | 'digital';
export type DotColorId = 'white' | 'amber' | 'green' | 'cyan' | 'orange';
export type SoundMode = 'mute' | 'system' | 'watch';

export interface DotColorConfig {
  id: DotColorId;
  name: string;
  hex: string;
  glow: string;
  dimHexDark: string;
  dimHexLight: string;
}

export interface AppSettings {
  displayStyle: DisplayStyle;
  dotColor: DotColorId;
  soundMode: SoundMode;
  volume: number; // 0 to 1
  is24Hour: boolean;
  showSeconds: boolean;
  theme: 'dark' | 'light';
  homeCityId: string;
}
