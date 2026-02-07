import { Stack } from 'expo-router';
import { Toaster } from 'sonner-native';
import { View, Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Mapping the Variable Font to specific weight aliases
    'FunnelDisplay': require('../assets/fonts/FunnelDisplay-Regular.ttf'),
    'FunnelDisplay-Light': require('../assets/fonts/FunnelDisplay-Light.ttf'),
    'FunnelDisplay-Regular': require('../assets/fonts/FunnelDisplay-Regular.ttf'),
    'FunnelDisplay-Medium': require('../assets/fonts/FunnelDisplay-Medium.ttf'),
    'FunnelDisplay-SemiBold': require('../assets/fonts/FunnelDisplay-SemiBold.ttf'),
    'FunnelDisplay-Bold': require('../assets/fonts/FunnelDisplay-Bold.ttf'),
    'FunnelDisplay-ExtraBold': require('../assets/fonts/FunnelDisplay-ExtraBold.ttf')
  });

  useEffect(() => {
    if (loaded) {
      // --- Global Text Override ---
      // This forces all <Text> components to use FunnelDisplay-Regular by default
      const defaultTextRender = (RNText as any).render;
      (RNText as any).render = function (...args: any) {
        const origin = defaultTextRender.call(this, ...args);
        return React.cloneElement(origin, {
          style: [{ fontFamily: 'FunnelDisplay-Regular' }, origin.props.style],
        });
      };

      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}