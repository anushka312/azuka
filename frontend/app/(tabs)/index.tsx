import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Azuka</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1ECCE' },
  title: { fontSize: 40, fontWeight: 'bold', color: '#1C3927' },
  button: { marginTop: 20, backgroundColor: '#1C3927', padding: 20, borderRadius: 30 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});