import { Stack } from 'expo-router';
import { EstimateProvider } from '../../../src/contexts';

export default function EstimateLayout() {
  return (
    <EstimateProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="vehicle" />
        <Stack.Screen name="route" />
        <Stack.Screen name="review" />
      </Stack>
    </EstimateProvider>
  );
}
