import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck, Sparkles } from 'lucide-react-native';
import { APP_INFO } from '../constants';
import { useAppContext } from '../context/AppContext';
import { BrandMark, HologramOrb } from '../components/BrandMark';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isDbReady, hasCompletedOnboarding, hasUserProfile } = useAppContext();

  const logoScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(18);
  const textOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 150 });
    textOpacity.value = withDelay(
      240,
      withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      240,
      withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) })
    );
    footerOpacity.value = withDelay(520, withTiming(1, { duration: 450 }));
  }, [footerOpacity, logoOpacity, logoScale, textOpacity, textTranslateY]);

  useEffect(() => {
    if (!isDbReady) return;
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        navigation.replace('Onboarding');
      } else if (!hasUserProfile) {
        navigation.replace('ProfileSetup');
      } else {
        navigation.replace('MainTabs');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isDbReady, hasCompletedOnboarding, hasUserProfile, navigation]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0B061A', '#1C0F3D', '#2B1358', '#140A2E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Atmospheric Glowing Orbs */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.brandShadow, logoStyle]}>
          <BrandMark size={106} variant="light" />
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.brandTitle}>{APP_INFO.NAME}</Text>
          <Text style={styles.brandSubtitle}>{APP_INFO.SUBTITLE}</Text>

          {/* Frosted Capsule with Hologram Orb & Tagline */}
          <View style={styles.taglinePill}>
            <HologramOrb size={22} />
            <Text style={styles.taglineText}>Explore Higher. Pack Smarter.</Text>
            <View style={styles.limeDot} />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <View style={styles.securityPill}>
          <ShieldCheck size={14} color="#D4FF00" strokeWidth={2.4} />
          <Text style={styles.footerText}>100% Offline SQLite Travel Workspace</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbTopRight: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212, 255, 0, 0.08)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 420,
    width: '100%',
  },
  brandShadow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 12,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 26,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2.2,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C084FC',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 20, 58, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  limeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D4FF00',
    marginLeft: 8,
    shadowColor: '#D4FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F3FF',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 14, 40, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  footerText: {
    fontSize: 11,
    color: '#9E97B8',
    marginLeft: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
