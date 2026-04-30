/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

const PRIMARY = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const PRIMARY_LIGHT = '#60A5FA';

export const Colors = {
  light: {
    text: '#0C4A6E',
    background: '#F0F9FF',
    tint: '#0284C7',
    icon: '#64748B',
    tabIconDefault: '#94A6B8',
    tabIconSelected: '#0284C7',
    primary: '#0284C7',
    secondary: '#0C4A6E',
    accent: '#38BDF8',
    card: '#FFFFFF',
    cardLight: '#E0F2FE',
    border: '#BAE6FD',
    textMain: '#0C4A6E',
    textMuted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    surface: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: PRIMARY,
    icon: '#94A6B8',
    tabIconDefault: '#475569',
    tabIconSelected: PRIMARY,
    primary: PRIMARY,
    secondary: '#1E293B',
    accent: PRIMARY_LIGHT,
    card: '#1E293B',
    cardLight: '#334155',
    border: '#334155',
    textMain: '#F8FAFC',
    textMuted: '#94A6B8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    surface: '#0F172A',
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
