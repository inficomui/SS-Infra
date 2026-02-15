/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

const GOLD = '#FACC15';
const GOLD_DARK = '#EAB308';
const GOLD_LIGHT = '#FDE047';

export const Colors = {
  light: {
    text: '#000000',
    background: '#F8F8F8',
    tint: GOLD_DARK,
    icon: '#4B5563',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: GOLD_DARK,
    primary: GOLD_DARK,
    secondary: '#000000',
    accent: GOLD,
    card: '#FFFFFF',
    cardLight: '#F3F4F6',
    border: '#E5E7EB',
    textMain: '#000000',
    textMuted: '#6B7280',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    surface: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: GOLD,
    icon: '#A1A1AA',
    tabIconDefault: '#71717A',
    tabIconSelected: GOLD,
    primary: GOLD,
    secondary: '#EAB308',
    accent: GOLD_LIGHT,
    card: '#111111',
    cardLight: '#1A1A1A',
    border: '#27272A',
    textMain: '#FFFFFF',
    textMuted: '#A1A1AA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    surface: '#09090B',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
