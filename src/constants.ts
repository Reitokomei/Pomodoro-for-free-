import { CloudRain, CloudDrizzle, TreePine, Coffee, Waves, Wind, Flame, Moon, Keyboard, Bird, FlameKindling, Waves as WavesIcon } from 'lucide-react';

export const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', icon: CloudRain },
  { id: 'rain_roof', name: 'Rain on Roof', url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg', icon: CloudDrizzle },
  { id: 'forest', name: 'Forest', url: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg', icon: TreePine },
  { id: 'rainforest', name: 'Rainforest', url: 'https://assets.mixkit.co/sfx/preview/mixkit-tropical-rainforest-ambience-2503.mp3', icon: Bird },
  { id: 'cafe', name: 'Cafe', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg', icon: Coffee },
  { id: 'ocean', name: 'Ocean', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', icon: Waves },
  { id: 'ocean_waves', name: 'Ocean Waves', url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3', icon: WavesIcon },
  { id: 'wind', name: 'Wind', url: 'https://actions.google.com/sounds/v1/weather/wind_howling_and_blowing.ogg', icon: Wind },
  { id: 'fire', name: 'Fire', url: 'https://actions.google.com/sounds/v1/ambiences/fire_crackling_and_crickets.ogg', icon: Flame },
  { id: 'campfire', name: 'Campfire', url: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-and-pops-2478.mp3', icon: FlameKindling },
  { id: 'night', name: 'Night', url: 'https://actions.google.com/sounds/v1/ambiences/crickets_and_dogs_at_night.ogg', icon: Moon },
  { id: 'typing', name: 'Typing', url: 'https://assets.mixkit.co/sfx/preview/mixkit-keyboard-typing-1386.mp3', icon: Keyboard },
];

export const ALARMS: Record<string, string> = {
  beep: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  bell: 'https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg',
  digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
};

export const BACKGROUNDS: Record<string, string> = {
  default: '',
  nature: "url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1920&auto=format&fit=crop')",
  cafe: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1920&auto=format&fit=crop')",
  space: "url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1920&auto=format&fit=crop')",
  ocean: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop')",
  cozy: "url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1920&auto=format&fit=crop')",
  'gradient-sunset': 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
  'gradient-ocean': 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
  'gradient-purple': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
  'gradient-forest': 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
  'gradient-peach': 'linear-gradient(135deg, #FFD194 0%, #70E1F5 100%)',
};
