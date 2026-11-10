import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { APP_INFO, ONBOARDING_SLIDES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';
import { GeometricIllustration } from '../components/GeometricIllustration';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { completeOnboarding } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<(typeof ONBOARDING_SLIDES)[number]>>(null);

  const isReplay = route.params?.isReplay ?? false;
  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  const finishOnboarding = async () => {
    await completeOnboarding();
    if (isReplay && navigation.canGoBack()) {
      navigation.goBack();
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
          <BrandMark size={34} variant="navy" />
          <Text style={[styles.brandMiniText, { color: theme.colors.primaryText }]}>
            {APP_INFO.NAME}
          </Text>
        </View>

        <Pressable
          onPress={finishOnboarding}
          hitSlop={10}
          style={[
            styles.skipPill,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
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
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.md,
              ]}
            >
              <GeometricIllustration variant={item.variant} size={220} />
            </View>

            <View
              style={[
                styles.stepBadge,
                { backgroundColor: theme.colors.infoSoft },
              ]}
            >
              <Sparkles size={13} color={theme.colors.secondaryBlue} />
              <Text
                style={[styles.stepBadgeText, { color: theme.colors.secondaryBlue }]}
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

      {/* Bottom Controls */}
      <View style={styles.footer}>
        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {ONBOARDING_SLIDES.map((s, idx) => {
            const active = idx === activeIndex;
            return (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  {
                    width: active ? 28 : 8,
                    backgroundColor: active
                      ? theme.colors.secondaryBlue
                      : theme.colors.border,
                  },
                ]}
              />
            );
          })}
        </View>

        <PrimaryButton
          label={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant={isLastSlide ? 'mint' : 'primary'}
          rightIcon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />}
        />
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
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brandMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMiniText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustrationCard: {
    width: 268,
    height: 268,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 330,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 22,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
