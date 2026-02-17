import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@/redux/slices/themeSlice';

const { width } = Dimensions.get('window');

/**
 * A premium, animated splash screen component.
 * Features a gradient background and a 3D-styled logo placeholder.
 */
export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoLiftAnim = useRef(new Animated.Value(0)).current;

  // Theme Logic
  const deviceColorScheme = useColorScheme();
  const themeMode = useSelector(selectThemeMode);
  const isDark = themeMode === 'system' ? (deviceColorScheme === 'dark') : themeMode === 'dark';

  const BG_GRADIENT = isDark ? ['#000000', '#111111', '#1a1a1a'] as const : ['#FFFFFF', '#F3F4F6', '#E5E7EB'] as const;
  const GRID_COLOR = isDark ? '#FACC15' : '#D97706'; // Darker gold for light mode visibility
  const LOGO_TEXT = isDark ? '#000' : '#FFF';
  const LOGO_BOX_BORDER = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  // Ensure the logo gradient stands out on both backgrounds
  const LOGO_GRADIENT = isDark
    ? [Colors.dark.primary, '#D4Af37'] as const
    : [Colors.light.primary, '#F59E0B'] as const;

  const TEXT_PRIMARY = isDark ? '#FFF' : '#111';
  const TEXT_SECONDARY = isDark ? '#888' : '#6B7280';
  const FOOTER_TEXT = isDark ? '#555' : '#9CA3AF';
  const LOADING_BAR_BG = isDark ? '#333' : '#E5E7EB';
  const BAR_GRADIENT = isDark ? [Colors.dark.primary, Colors.dark.accent] as const : [Colors.light.primary, Colors.light.accent] as const;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoLiftAnim, {
        toValue: -10,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={BG_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Abstract Background Grid Lines */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridLine, { backgroundColor: GRID_COLOR, top: '20%', transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.gridLine, { backgroundColor: GRID_COLOR, top: '40%', transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.gridLine, { backgroundColor: GRID_COLOR, top: '60%', transform: [{ rotate: '5deg' }] }]} />
      </View>

      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: logoLiftAnim }
          ]
        }
      ]}>
        {/* 3D-Styled Logo Placeholder */}
        <View style={styles.logoContainer}>
          {/* Shadow Layer for 3D effect */}
          <View style={[styles.logoShadow, { shadowColor: isDark ? "#000" : "#999", backgroundColor: isDark ? "#000" : "#CCC" }]} />

          {/* Main Logo Box */}
          <LinearGradient
            colors={LOGO_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logoBox, { borderColor: LOGO_BOX_BORDER, shadowColor: LOGO_GRADIENT[0] }]}
          >
            <Text style={[styles.logoText, { color: LOGO_TEXT, textShadowColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>SS</Text>
          </LinearGradient>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: TEXT_PRIMARY, textShadowColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(0,0,0,0)' }]}>SS-Infra</Text>
            <Text style={[styles.subtitle, { color: TEXT_SECONDARY }]}>INFRASTRUCTURE MANAGEMENT</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={[styles.footerText, { color: FOOTER_TEXT }]}>POWERED BY INFICOM SOLUTIONS</Text>
          <View style={[styles.loadingBarContainer, { backgroundColor: LOADING_BAR_BG }]}>
            <LinearGradient
              colors={BAR_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingBar}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    width: '150%',
    height: 1,
    left: '-25%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 24,
    top: 10,
    left: 0,
    opacity: 0.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingBarContainer: {
    width: 150,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '50%',
    height: '100%',
    borderRadius: 2,
  }
});
