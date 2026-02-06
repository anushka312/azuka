import React from 'react';
import { CalendarScreen } from '../components/screens/CalendarScreen';
import { useRouter } from 'expo-router';

export default function CalendarRoute() {
  const router = useRouter();
  return <CalendarScreen onClose={() => router.back()} />;
}
