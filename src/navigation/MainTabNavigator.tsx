import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, History, Home, Layers, User } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MyTripsScreen } from '../screens/MyTripsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface AnimatedTabIconProps {
  focused: boolean;
  color: string;
  icon: (iconColor: string, isFocused: boolean) => React.ReactNode;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({
  focused,
  icon,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(focused ? 1.05 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.05 : 1, {
      damping: 16,
      stiffness: 280,
    });
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeIconColor = theme.colors.limeText;
  const inactiveIconColor = theme.colors.secondaryText;

  return (
    <Animated.View
      style={[
        styles.iconPill,
        focused && {
          backgroundColor: theme.colors.accentLime,
          borderColor: 'transparent',
          ...theme.shadows.limeGlow,
        },
        animStyle,
      ]}
    >
      {icon(focused ? activeIconColor : inactiveIconColor, focused)}
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
        tabBarActiveTintColor: theme.isDark ? theme.colors.accentLime : theme.colors.secondaryBlue,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.isDark ? 'rgba(21, 14, 44, 0.96)' : theme.colors.card,
          borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
          borderTopWidth: 1,
          height: 64 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
          elevation: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={(ic, isF) => (
                <Home size={20} color={ic} strokeWidth={isF ? 2.6 : 2} />
              )}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={(ic, isF) => (
                <Compass size={20} color={ic} strokeWidth={isF ? 2.6 : 2} />
              )}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          tabBarLabel: 'Templates',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={(ic, isF) => (
                <Layers size={20} color={ic} strokeWidth={isF ? 2.6 : 2} />
              )}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={(ic, isF) => (
                <History size={20} color={ic} strokeWidth={isF ? 2.6 : 2} />
              )}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={(ic, isF) => (
                <User size={20} color={ic} strokeWidth={isF ? 2.6 : 2} />
              )}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused} color={color}>
              <User size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconPill: {
    width: 48,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
