import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { WeeklyPlanScreen } from '../screens/WeeklyPlanScreen';
import { StoreScreen } from '../screens/StoreScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9A928A',
        tabBarStyle: {
          height: 74,
          borderTopWidth: 0,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          borderRadius: 24,
          backgroundColor: '#FFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = size + 2;
          switch (route.name) {
            case 'Home':
              return <Ionicons name="home-outline" size={iconSize} color={color} />;
            case 'Plan':
              return <Ionicons name="calendar-outline" size={iconSize} color={color} />;
            case 'Store':
              return <Ionicons name="bag-handle-outline" size={iconSize} color={color} />;
            case 'Community':
              return <Ionicons name="chatbubble-ellipses-outline" size={iconSize} color={color} />;
            case 'Profile':
              return <MaterialCommunityIcons name="account-circle-outline" size={iconSize + 2} color={color} />;
            default:
              return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
          }
        }
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Plan" component={WeeklyPlanScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
