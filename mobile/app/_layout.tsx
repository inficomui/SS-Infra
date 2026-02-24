

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './../utils/i18n';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { store, persistor } from '../redux/store';
import { storage } from '../redux/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme as useDeviceColorScheme } from 'react-native';
import { selectThemeMode } from '@/redux/slices/themeSlice';
import { Colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';
import toastConfig from '../components/CustomToast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import SplashScreen from '../components/SplashScreen';
import { useGetMeQuery } from '@/redux/apis/authApi';

const { LightTheme, DarkTheme: NavDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});



function RootLayoutNav() {
  const deviceColorScheme = useDeviceColorScheme();
  const themeMode = useSelector(selectThemeMode);

  const activeMode = themeMode === 'system' ? (deviceColorScheme ?? 'dark') : themeMode;
  const isDark = activeMode === 'dark';

  const paperTheme = isDark
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: Colors.dark.primary } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: Colors.light.primary } };

  const segments = useSegments();
  const router = useRouter();
  const { role, isAuthenticated, user } = useSelector((state: any) => state.auth);
  const { isLoading: isValidatingSession } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Push Notifications
  usePushNotifications();

  useEffect(() => {
    if (!mounted || (isAuthenticated && isValidatingSession)) return;

    if (!isAuthenticated) {
      if (segments[0] !== 'login' && segments[0] !== 'language-selection') {
        router.replace('/login');
      }
    } else if (isAuthenticated && user) {
      if (!segments[0] || segments[0] === 'login' || segments[0] === '(tabs)') {
        if (role === 'Owner') {
          router.replace('/(owner)');
        } else if (role === 'Operator') {
          router.replace('/(operator)');
        }
      }
    }
  }, [isAuthenticated, role, segments, user, mounted, isValidatingSession]);

  if (!mounted || (isAuthenticated && isValidatingSession)) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{
        icon: props => <MaterialCommunityIcons {...props} />,
      }}
    >
      <ThemeProvider value={isDark ? NavDarkTheme : LightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="language-selection" options={{ headerShown: false }} />
          <Stack.Screen name="(operator)" options={{ headerShown: false }} />
          <Stack.Screen name="(owner)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </ReduxProvider>
  );
}
