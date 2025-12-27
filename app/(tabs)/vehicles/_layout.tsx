import { Stack } from 'expo-router';

export default function VehiclesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Vehicles',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Vehicle',
        }}
      />
    </Stack>
  );
}
