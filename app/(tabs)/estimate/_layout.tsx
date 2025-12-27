import { Stack } from 'expo-router';

export default function EstimateLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Estimate Fare',
        }}
      />
      <Stack.Screen
        name="route"
        options={{
          title: 'Plan Route',
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Fare Estimate',
        }}
      />
    </Stack>
  );
}
