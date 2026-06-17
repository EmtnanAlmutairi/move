import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { OnboardingGoalScreen } from '../screens/OnboardingGoalScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { RunningTrackerScreen } from '../screens/RunningTrackerScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { NutritionScreen } from '../screens/NutritionScreen';
import { RecoveryScreen } from '../screens/RecoveryScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { CommunitiesScreen } from '../screens/CommunitiesScreen';
import { CommunityDetailScreen } from '../screens/CommunityDetailScreen';
import { TeamSelectionScreen } from '../screens/TeamSelectionScreen';
import { ProfessionalProfileScreen } from '../screens/ProfessionalProfileScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: 'transparent'
  }
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingGoalScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Run" component={RunningTrackerScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="Recovery" component={RecoveryScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="Communities" component={CommunitiesScreen} />
        <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
        <Stack.Screen name="TeamSelection" component={TeamSelectionScreen} />
        <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
