import { Stack } from 'expo-router';

export default function CalculateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Calculate Fare',
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Final Fare',
        }}
      />
    </Stack>
  );
}
