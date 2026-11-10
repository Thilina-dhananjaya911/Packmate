import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertTriangle } from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { CreateTripScreen } from '../screens/CreateTripScreen';
import { ItemDetailsScreen } from '../screens/ItemDetailsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PackingChecklistScreen } from '../screens/PackingChecklistScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TemplateDetailsScreen } from '../screens/TemplateDetailsScreen';
import { TripDetailsScreen } from '../screens/TripDetailsScreen';
import { RootStackParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useAppTheme();
  const { dbError } = useAppContext();

  if (dbError) {
    return (
      <View
        style={[
          styles.errorFallback,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <AlertTriangle size={40} color={theme.colors.danger} />
        <Text style={[styles.errorTitle, { color: theme.colors.primaryText }]}>
          Local Database Error
        </Text>
        <Text style={[styles.errorBody, { color: theme.colors.secondaryText }]}>
          {dbError}
        </Text>
      </View>
    );
  }

  const navTheme = theme.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.primaryText,
          border: theme.colors.border,
          primary: theme.colors.secondaryBlue,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.primaryText,
          border: theme.colors.border,
          primary: theme.colors.secondaryBlue,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
        <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
        <Stack.Screen
          name="PackingChecklist"
          component={PackingChecklistScreen}
        />
        <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
        <Stack.Screen
          name="TemplateDetails"
          component={TemplateDetailsScreen}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  errorFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
  },
  errorBody: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
