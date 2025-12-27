import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

export default function TripsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Trips',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/trips/calendar')}
              style={{ marginRight: 8 }}
            >
              <Text style={{ fontSize: 22 }}>&#x1F4C5;</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Trip Calendar',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
        }}
      />
    </Stack>
  );
}
