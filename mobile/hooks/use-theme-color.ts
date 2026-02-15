import { useSelector } from 'react-redux';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { selectThemeMode } from '@/redux/slices/themeSlice';
import { Colors } from '@/constants/theme';

export function useAppTheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const themeMode = useSelector(selectThemeMode);

  const activeMode = themeMode === 'system' ? (deviceColorScheme ?? 'dark') : themeMode;
  const isDark = activeMode === 'dark';

  return {
    mode: activeMode,
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
  };
}

/**
 * Legacy support for existing components
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { mode, colors } = useAppTheme();
  const colorFromProps = props[mode as 'light' | 'dark'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[colorName as keyof typeof colors] as string;
  }
}
