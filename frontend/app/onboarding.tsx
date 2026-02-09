import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleComplete = () => {
    // replace ensures they can't swipe back to onboarding
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Personalize your experience</Text>
        <Text style={styles.description}>
          Azuka learns from your data to provide accurate cycle forecasts and wellness tips.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardText}>Sync with HealthKit</Text>
        </GlassCard>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1ECCE' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1C3927', marginBottom: 16 },
  description: { fontSize: 16, color: '#83965F', lineHeight: 24, marginBottom: 40 },
  card: { padding: 24, marginBottom: 40, alignItems: 'center' },
  cardText: { color: '#1C3927', fontWeight: '600' },
  button: { backgroundColor: '#1C3927', padding: 20, borderRadius: 32, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' }
});