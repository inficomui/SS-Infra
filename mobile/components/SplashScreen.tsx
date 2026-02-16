import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

/**
 * A premium, animated splash screen component.
 * Features a gradient background and a 3D-styled logo placeholder.
 */
export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoLiftAnim = useRef(new Animated.Value(0)).current;

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
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#111111', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Abstract Background Grid Lines */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridLine, { top: '20%', transform: [{ rotate: '15deg' }] }]} />
        <View style={[styles.gridLine, { top: '40%', transform: [{ rotate: '-10deg' }] }]} />
        <View style={[styles.gridLine, { top: '60%', transform: [{ rotate: '5deg' }] }]} />
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
            <View style={styles.logoShadow} />
            
            {/* Main Logo Box */}
            <LinearGradient
              colors={[Colors.dark.primary, '#D4Af37']} // Gold Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
                <Text style={styles.logoText}>SS</Text>
            </LinearGradient>
            
            <View style={styles.textContainer}>
                <Text style={styles.title}>SS-Infra</Text>
                <Text style={styles.subtitle}>INFRASTRUCTURE MANAGEMENT</Text>
            </View>
        </View>
      </Animated.View>
      
      <View style={styles.footer}>
         <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.footerText}>POWERED BY INFICOM</Text>
            <View style={styles.loadingBarContainer}>
                <LinearGradient
                    colors={[Colors.dark.primary, Colors.dark.accent]}
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
    backgroundColor: '#000',
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
    backgroundColor: '#FACC15',
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
    backgroundColor: '#000',
    borderRadius: 24,
    top: 10,
    left: 0,
    opacity: 0.5,
    shadowColor: "#000",
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
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: 8,
    textShadowColor: 'rgba(250, 204, 21, 0.3)', // Gold glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
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
    color: '#555',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingBarContainer: {
    width: 150,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '50%', // Indeterminate-ish state
    height: '100%',
    borderRadius: 2,
  }
});
