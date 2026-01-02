import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="place-search"
          options={{
            presentation: 'modal',
            headerTitle: 'Search Place',
          }}
        />
      </Stack>
    </>
  );
}
