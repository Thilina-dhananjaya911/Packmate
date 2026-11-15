import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ItemDetailsScreen } from '../screens/ItemDetailsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PackingChecklistScreen } from '../screens/PackingChecklistScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { TemplateDetailsScreen } from '../screens/TemplateDetailsScreen';
import { TripDetailsScreen } from '../screens/TripDetailsScreen';
import { DontForgetDashboardScreen } from '../screens/DontForgetDashboardScreen';
import { EssentialChecklistScreen } from '../screens/EssentialChecklistScreen';
import { FinalDepartureCheckScreen } from '../screens/FinalDepartureCheckScreen';
import { RootStackParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useAppTheme();
  const { dbError, retryDbInit } = useAppContext();

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
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.secondaryBlue }]}
          onPress={() => retryDbInit()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
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
          name="ProfileSetup"
          component={ProfileSetupScreen}
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
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="DontForgetDashboard"
          component={DontForgetDashboardScreen}
        />
        <Stack.Screen
          name="EssentialChecklist"
          component={EssentialChecklistScreen}
        />
        <Stack.Screen
          name="FinalDepartureCheck"
          component={FinalDepartureCheckScreen}
        />
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
    maxWidth: 380,
  },
  retryButton: {
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
