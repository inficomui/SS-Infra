

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './../utils/i18n';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { store, persistor } from '../redux/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect, useMemo } from 'react';
import { selectCurrentUser, selectIsAuthenticated } from '@/redux/slices/authSlice';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
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

/**
 * Role → route map.
 * Must match the folder names in the app directory.
 */
const ROLE_ROUTES: Record<string, string> = {
  owner: '/(owner)',
  operator: '/(operator)',
  driver: '/(driver)',
};

function RootLayoutNav() {
  const deviceColorScheme = useDeviceColorScheme();
  const themeMode = useSelector(selectThemeMode);
  const router = useRouter();
  const segments = useSegments();

  const activeMode = themeMode === 'system' ? (deviceColorScheme ?? 'dark') : themeMode;
  const isDark = activeMode === 'dark';

  const paperTheme = useMemo(() => (isDark
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: Colors.dark.primary } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: Colors.light.primary } }
  ), [isDark]);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Silently validate/refresh the user profile in the background.
  // If the token is expired the 401 handler in baseQuery auto-dispatches logout() → redirects to /login.
  useGetMeQuery(undefined, { skip: !isAuthenticated });

  // Register push notification token once authenticated
  usePushNotifications();

  /**
   * Auth-guard navigation:
   *
   * • If the user IS authenticated → always navigate to their role's root screen.
   *   This handles both cold starts (app was closed) and returning from background.
   *
   * • If NOT authenticated and NOT already on an auth page → push to /login.
   *
   * `segments` tells us what group the current route is in so we can avoid
   * unnecessary navigations (e.g. don't redirect owner to /(owner) if they're
   * already inside /(owner)/machines).
   */
  useEffect(() => {
    if (!isAuthenticated) {
      // Not logged in — go to login only if not already there
      const onAuthPage = segments[0] === 'login' || segments[0] === 'language-selection';
      if (!onAuthPage) {
        router.replace('/login');
      }
      return;
    }

    if (!user) return; // still loading user object, wait

    const role = user.role?.toLowerCase();
    const targetRoute = ROLE_ROUTES[role ?? ''];

    if (!targetRoute) {
      // Unknown role — fall back to login
      router.replace('/login');
      return;
    }

    // Determine which group the user is currently in.
    // segments[0] is e.g. "(owner)", "(operator)", "(driver)", "(common)", "login", "index", etc.
    const currentGroup = segments[0];
    const expectedGroup = `(${role})`;

    // ── Shared routes ──────────────────────────────────────────────────────────
    // These screens are accessible by ALL authenticated roles. Do NOT redirect away from them.
    const SHARED_GROUPS = ['(common)', 'language-selection', 'modal'];
    if (SHARED_GROUPS.includes(currentGroup)) return;
    // ──────────────────────────────────────────────────────────────────────────

    if (currentGroup !== expectedGroup) {
      // Not inside the correct role group → send them to their home screen.
      router.replace(targetRoute as any);
    }
    // Already inside the correct group → stay put.
  }, [isAuthenticated, user, segments]);

  return (
    <PaperProvider
      theme={paperTheme}
      settings={{
        icon: props => <MaterialCommunityIcons {...props} />,
      }}
    >
      <ThemeProvider value={isDark ? NavDarkTheme : LightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="language-selection" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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
      {/*
        PersistGate blocks rendering until redux-persist has fully rehydrated
        the persisted store from AsyncStorage.

        Once the gate lifts, RootLayoutNav reads isAuthenticated + user from
        the already-hydrated store and immediately navigates to the correct
        role screen — with NO flash to the login page.
      */}
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </ReduxProvider>
  );
}
