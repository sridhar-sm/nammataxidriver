import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.primary,
        },
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }} accessibilityLabel="Home">
              🏠
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }} accessibilityLabel="Vehicles">
              🚗
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }} accessibilityLabel="Trips">
              📋
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="estimate"
        options={{
          title: 'New Trip',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }} accessibilityLabel="New Trip">
              ➕
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }} accessibilityLabel="Settings">
              ⚙️
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
