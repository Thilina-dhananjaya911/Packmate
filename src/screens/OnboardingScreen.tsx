import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react-native';
import { APP_INFO, ONBOARDING_SLIDES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { BrandMark, HologramOrb } from '../components/BrandMark';
import { GeometricIllustration } from '../components/GeometricIllustration';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { completeOnboarding, hasUserProfile } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<(typeof ONBOARDING_SLIDES)[number]>>(null);

  const isReplay = route.params?.isReplay ?? false;
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const finishOnboarding = async () => {
    await completeOnboarding();
    if (isReplay && navigation.canGoBack()) {
      navigation.goBack();
    } else if (!hasUserProfile) {
      navigation.replace('ProfileSetup');
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleNext = async () => {
    if (isLastSlide) {
      await finishOnboarding();
    } else {
      const nextIdx = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setActiveIndex(nextIdx);
    }
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx >= 0 && idx < ONBOARDING_SLIDES.length) {
      setActiveIndex(idx);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandMini}>
          <BrandMark size={36} variant="navy" />
          <Text style={[styles.brandMiniText, { color: theme.colors.primaryText }]}>
            {APP_INFO.NAME}
          </Text>
        </View>

        <Pressable
          onPress={finishOnboarding}
          hitSlop={12}
          style={styles.skipBtn}
        >
          <Text style={[styles.skipText, { color: theme.colors.secondaryText }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View
              style={[
                styles.illustrationCard,
                {
                  backgroundColor: theme.isDark ? 'rgba(25, 17, 48, 0.72)' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                },
                theme.shadows.md,
              ]}
            >
              <GeometricIllustration variant={item.variant} size={210} />

              {/* Floating Hologram Smart Badge (Reference Image Feature) */}
              <View style={styles.holoBadge}>
                <HologramOrb size={20} />
                <Text style={styles.holoBadgeText}>Explore Higher. Travel AI</Text>
              </View>
            </View>

            <View
              style={[
                styles.stepBadge,
                {
                  backgroundColor: theme.colors.limeSoft,
                  borderColor: 'rgba(212, 255, 0, 0.25)',
                  borderWidth: 1,
                },
              ]}
            >
              <Sparkles size={12} color={theme.colors.accentLime} />
              <Text
                style={[styles.stepBadgeText, { color: theme.colors.accentLime }]}
              >
                {item.step} • {item.badge}
              </Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.primaryText }]}>
              {item.title}
            </Text>
            <Text
              style={[styles.description, { color: theme.colors.secondaryText }]}
            >
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Bottom Controls Row matching Reference Screen 1 */}
      <View style={styles.bottomControlRow}>
        <Pressable
          onPress={finishOnboarding}
          hitSlop={12}
          style={Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null}
        >
          <Text style={[styles.skipBottomText, { color: theme.colors.secondaryText }]}>
            Skip
          </Text>
        </Pressable>

        {/* Progress Pill Dots */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((s, idx) => {
            const active = idx === activeIndex;
            return (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  {
                    width: active ? 26 : 8,
                    backgroundColor: active
                      ? theme.colors.accentLime
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.22)'
                      : theme.colors.border,
                  },
                  active ? theme.shadows.limeGlow : null,
                ]}
              />
            );
          })}
        </View>

        {/* Neon Lime Action Circle (Reference Image Screen 1) */}
        <Pressable
          onPress={handleNext}
          style={[
            styles.circleNextBtn,
            { backgroundColor: theme.colors.accentLime },
            theme.shadows.limeGlow,
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
          ]}
        >
          {isLastSlide ? (
            <ArrowRight size={22} color={theme.colors.limeText} strokeWidth={2.6} />
          ) : (
            <ChevronRight size={24} color={theme.colors.limeText} strokeWidth={2.8} />
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 6,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brandMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMiniText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustrationCard: {
    width: 270,
    height: 270,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    position: 'relative',
  },
  holoBadge: {
    position: 'absolute',
    bottom: -14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 18, 54, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  holoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 330,
  },
  bottomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 12,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  skipBottomText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  circleNextBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
