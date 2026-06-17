import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { PostCreateSheet } from '../components/PostCreateSheet';
import { CommunitiesScreen } from '../screens/CommunitiesScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',        label: 'اليوم'    },
  { name: 'Map',         label: 'الخريطة' },
  { name: 'Post',        label: ''         }, // center — handled by custom button
  { name: 'Communities', label: 'مجتمعات' },
  { name: 'Profile',     label: 'أنا'     },
] as const;

function RawIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const s = 22;
  switch (name) {
    case 'Home':        return <Ionicons name={focused ? 'home' : 'home-outline'} size={s} color={color} />;
    case 'Map':         return <Ionicons name={focused ? 'map' : 'map-outline'} size={s} color={color} />;
    case 'Communities': return <Ionicons name={focused ? 'people-circle' : 'people-circle-outline'} size={s} color={color} />;
    case 'Profile':     return <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={s + 2} color={color} />;
    default:            return <Ionicons name="ellipse-outline" size={s} color={color} />;
  }
}

function AnimatedTabIcon({ name, label, focused, color, primaryColor }: {
  name: string; label: string; focused: boolean; color: string; primaryColor: string;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.22, { damping: 6, stiffness: 280 }),
        withSpring(1.0,  { damping: 14, stiffness: 200 }),
      );
    }
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={st.item}>
      <Animated.View style={animStyle}>
        {focused && <View style={[st.activePill, { backgroundColor: primaryColor + '18' }]} />}
        <RawIcon name={name} focused={focused} color={color} />
      </Animated.View>
      <Text style={[st.label, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Center "بوست" Button ─────────────────────────────────────────────────────
function PostTabButton({ onPress }: { onPress: () => void }) {
  const { theme: t } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.90, { damping: 10 }); }}
      onPressOut={() => { scale.value = withSpring(1.0,  { damping: 10 }); }}
      onPress={onPress}
      style={st.createWrapper}
    >
      <Animated.View style={animStyle}>
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          style={st.createBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="camera" size={26} color="#fff" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
export function MainTabs() {
  const { theme } = useTheme();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 66,
            borderTopWidth: 1,
            borderTopColor: theme.navBorder,
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 12,
            borderRadius: 16,
            backgroundColor: theme.navBg,
            shadowColor: theme.navShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.mode === 'dark' ? 0.28 : 0.08,
            shadowRadius: 8,
            elevation: 3,
          },
          tabBarIcon: ({ focused }) => {
            const tab = TABS.find((t) => t.name === route.name);
            const iconColor = focused ? theme.primary : theme.navIconInactive;
            return (
              <AnimatedTabIcon
                name={route.name}
                label={tab?.label ?? ''}
                focused={focused}
                color={iconColor}
                primaryColor={theme.primary}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home"        component={DashboardScreen} />
        <Tab.Screen name="Map"         component={MapScreen} />
        <Tab.Screen
          name="Post"
          component={ActivityScreen}
          options={{
            tabBarButton: () => (
              <PostTabButton onPress={() => setShowCreate(true)} />
            ),
          }}
        />
        <Tab.Screen name="Communities" component={CommunitiesScreen} />
        <Tab.Screen name="Profile"     component={ProfileScreen} />
      </Tab.Navigator>

      <PostCreateSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}

const st = StyleSheet.create({
  item:       { alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  label:      { fontSize: 10, fontWeight: '600' },
  activePill: {
    position: 'absolute',
    width: 38, height: 38, borderRadius: 12,
    top: '50%', left: '50%',
    transform: [{ translateX: -21 }, { translateY: -21 }],
  },
  createWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  createBtn: {
    width: 64,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
