import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, History, Home, Layers } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyTripsScreen } from '../screens/MyTripsScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface AnimatedTabIconProps {
  focused: boolean;
  color: string;
  children: React.ReactNode;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  focused,
  children,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(focused ? 1.08 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, {
      damping: 15,
      stiffness: 260,
    });
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.iconPill,
        focused && {
          backgroundColor: theme.colors.infoSoft,
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.20)',
        },
        animStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export const MainTabNavigator: React.FC = () => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondaryBlue,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 62 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.07,
          shadowRadius: 16,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Home size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Compass size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          tabBarLabel: 'Templates',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <Layers size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <History size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconPill: {
    width: 46,
    height: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
