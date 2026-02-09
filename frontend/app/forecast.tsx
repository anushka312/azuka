import React from 'react';
import ForecastScreen from '../components/screens/ForecastScreen';
import { useRouter } from 'expo-router';

export default function ForecastRoute() {
  const router = useRouter();
  return <ForecastScreen onBack={() => router.back()} />;
}
