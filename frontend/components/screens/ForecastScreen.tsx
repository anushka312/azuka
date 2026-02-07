import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
// FIX 1: Added SafeAreaView to imports
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withDelay, 
  withTiming 
} from 'react-native-reanimated';
import { 
  ChevronLeft, 
  Activity, 
  Utensils, 
  AlertTriangle, 
  TrendingUp 
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; // Ensure path is correct
import { StarIcon, PetalIcon, CrescentIcon } from '../../components/icons/AzukaIcons';

const { width } = Dimensions.get('window');

interface ForecastScreenProps {
  onBack: () => void;
}

export default function ForecastScreen({ onBack }: ForecastScreenProps) {
  const insets = useSafeAreaInsets();
  const forecast = [
    { day: 'Today', date: 'Feb 4', phase: 'Luteal', icon: PetalIcon, color: '#BB8585', energy: 68, workout: 'Light Yoga', workoutDuration: 45, calories: 2000, carbs: 'High', risks: ['Ligament laxity'] },
    { day: 'Wed', date: 'Feb 5', phase: 'Luteal', icon: PetalIcon, color: '#BB8585', energy: 65, workout: 'Walking', workoutDuration: 30, calories: 1950, carbs: 'High', risks: [] },
    { day: 'Thu', date: 'Feb 6', phase: 'Menstrual', icon: CrescentIcon, color: '#BB8585', energy: 60, workout: 'Rest Day', workoutDuration: 0, calories: 1900, carbs: 'Medium', risks: ['High inflammation'] },
    { day: 'Fri', date: 'Feb 7', phase: 'Menstrual', icon: PetalIcon, color: '#BB8585', energy: 62, workout: 'Gentle Stretch', workoutDuration: 20, calories: 1950, carbs: 'Medium', risks: [] },
    { day: 'Sat', date: 'Feb 8', phase: 'Follicular', icon: CrescentIcon, color: '#83965F', energy: 70, workout: 'Moderate Cardio', workoutDuration: 40, calories: 2100, carbs: 'Medium', risks: [] },
    { day: 'Sun', date: 'Feb 9', phase: 'Follicular', icon: StarIcon, color: '#83965F', energy: 75, workout: 'Strength Training', workoutDuration: 50, calories: 2200, carbs: 'Medium', risks: [] },
    { day: 'Mon', date: 'Feb 10', phase: 'Follicular', icon: StarIcon, color: '#29555F', energy: 80, workout: 'HIIT', workoutDuration: 45, calories: 2300, carbs: 'Low', risks: [] },
  ];

  return (
    // FIX 2: Correctly applied SafeAreaView
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={28} color="#29555F" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>7-Day Forecast</Text>
            <Text style={styles.subtitle}>Your week ahead</Text>
          </View>
        </View>

        {/* Energy Trend Graph */}
        <GlassCard style={styles.graphCard}>
          <Text style={styles.cardHeading}>Energy Trend</Text>
          <View style={styles.graphContainer}>
            {forecast.map((day, i) => (
              <TrendBar key={i} day={day} index={i} />
            ))}
          </View>
          <View style={styles.legendRow}>
            <Text style={styles.legendText}>Low</Text>
            <Text style={styles.legendText}>High</Text>
          </View>
        </GlassCard>

        {/* Daily Breakdown */}
        <View style={styles.listContainer}>
          {forecast.map((day, i) => (
            <ForecastItem key={i} day={day} index={i} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// FIX 3: Replaced standard Animated with Reanimated 3 logic
function TrendBar({ day, index }: { day: any; index: number }) {
  const heightValue = useSharedValue(0);

  useEffect(() => {
    heightValue.value = withDelay(index * 100, withTiming(day.energy, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${heightValue.value}%`,
  }));

  return (
    <View style={styles.barColumn}>
      <View style={styles.barTrack}>
        <Animated.View 
          style={[
            styles.barFill, 
            animatedStyle,
            { 
              backgroundColor: day.color,
              opacity: 0.8
            }
          ]} 
        />
      </View>
      <Text style={styles.barLabel}>{day.day === 'Today' ? 'T' : day.day.charAt(0)}</Text>
    </View>
  );
}

function ForecastItem({ day, index }: { day: any; index: number }) {
  const Icon = day.icon;
  return (
    // FIX 4: Added animation to the Daily cards
    <Animated.View entering={FadeInUp.delay(index * 150)}>
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleGroup}>
            <View style={[styles.iconWrapper, { backgroundColor: `${day.color}20` }]}>
              <Icon size={20} color={day.color} />
            </View>
            <View>
              <Text style={styles.itemName}>
                {day.day} <Text style={styles.itemDate}>• {day.date}</Text>
              </Text>
              <Text style={styles.itemPhase}>{day.phase}</Text>
            </View>
          </View>
          <View style={styles.energyBadge}>
            <Text style={styles.energyVal}>{day.energy}%</Text>
            <Text style={styles.energyLabel}>Energy</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricBox icon={<Activity size={16} color={day.color} />} val={`${day.workoutDuration}m`} label="Workout" />
          <MetricBox icon={<Utensils size={16} color={day.color} />} val={day.calories} label="Calories" />
          <MetricBox icon={<TrendingUp size={16} color={day.color} />} val={day.carbs} label="Carbs" />
        </View>

        <View style={styles.recommendationRow}>
          <Text style={styles.recLabel}>Recommended: </Text>
          <Text style={styles.recValue}>{day.workout}</Text>
        </View>

        {day.risks.length > 0 && (
          <View style={styles.riskBanner}>
            <AlertTriangle size={14} color="#BB8585" />
            <Text style={styles.riskText}>{day.risks.join(', ')}</Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

function MetricBox({ icon, val, label }: any) {
  return (
    <View style={styles.metricBox}>
      {icon}
      <Text style={styles.metricVal}>{val}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scrollContent: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  backButton: { padding: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C3927', fontFamily: 'FunnelDisplay-Bold' },
  subtitle: { fontSize: 14, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  graphCard: { padding: 20, marginBottom: 20 },
  cardHeading: { fontSize: 16, fontWeight: '700', color: '#1C3927', marginBottom: 16, fontFamily: 'FunnelDisplay-Bold' },
  graphContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, gap: 8 },
  barColumn: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'flex-end', borderRadius: 8, overflow: 'hidden' },
  barFill: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  barLabel: { fontSize: 10, color: '#83965F', fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  legendText: { fontSize: 10, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  listContainer: { gap: 12 },
  itemCard: { padding: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  itemTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: { padding: 8, borderRadius: 20 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1C3927', fontFamily: 'FunnelDisplay-Bold' },
  itemDate: { fontWeight: '400', color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  itemPhase: { fontSize: 13, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  energyBadge: { alignItems: 'flex-end' },
  energyVal: { fontSize: 18, fontWeight: '700', color: '#1C3927', fontFamily: 'FunnelDisplay-Bold' },
  energyLabel: { fontSize: 10, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  metricsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  metricBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', padding: 10, borderRadius: 12, alignItems: 'center', gap: 2 },
  metricVal: { fontSize: 12, fontWeight: '600', color: '#1C3927', fontFamily: 'FunnelDisplay-Bold' },
  metricLabel: { fontSize: 10, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  recommendationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  recLabel: { fontSize: 12, color: '#83965F', fontFamily: 'FunnelDisplay-Regular' },
  recValue: { fontSize: 13, fontWeight: '600', color: '#1C3927', fontFamily: 'FunnelDisplay-Bold' },
  riskBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(187,133,133,0.1)', padding: 8, borderRadius: 8 },
  riskText: { fontSize: 12, color: '#1C3927', fontFamily: 'FunnelDisplay-Regular' },
});