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
import { ShieldCheck } from 'lucide-react-native';
import { APP_INFO } from '../constants';
import { useAppContext } from '../context/AppContext';
import { BrandMark } from '../components/BrandMark';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isDbReady, hasCompletedOnboarding } = useAppContext();

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
      if (hasCompletedOnboarding) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isDbReady, hasCompletedOnboarding, navigation]);

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
      colors={['#132442', '#172B4D', '#23447A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Decorative Geometric Circles */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.brandShadow, logoStyle]}>
          <BrandMark size={104} variant="light" />
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.brandTitle}>{APP_INFO.NAME}</Text>
          <Text style={styles.brandSubtitle}>{APP_INFO.SUBTITLE}</Text>
          <View style={styles.taglinePill}>
            <View style={styles.mintDot} />
            <Text style={styles.taglineText}>{APP_INFO.TAGLINE}</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <ShieldCheck size={15} color="#36C9A5" strokeWidth={2.3} />
        <Text style={styles.footerText}>100% Offline SQLite Travel Workspace</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 54,
    overflow: 'hidden',
  },
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(76, 154, 255, 0.12)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(54, 201, 165, 0.10)',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
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
    letterSpacing: 2.4,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.76)',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  mintDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#36C9A5',
    marginRight: 8,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
