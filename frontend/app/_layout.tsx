import { Stack } from 'expo-router';
import { Toaster } from 'sonner-native';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> 
          <Stack.Screen name="onboarding" /> 
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
        <Toaster />
      </View>
    </SafeAreaProvider>
  );
}