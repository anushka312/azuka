import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { toast } from "sonner-native"; 
import Slider from '@react-native-community/slider';
import { Brain, Heart, Moon, Activity } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function MindsetScreen() {
  const [moodScore, setMoodScore] = useState(70);
  const [energyScore, setEnergyScore] = useState(65);
  const [stressScore, setStressScore] = useState(45);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(80);
  
  const [history, setHistory] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
      fetchHistory();
  }, []);

  const fetchHistory = async () => {
      try {
          const token = await AsyncStorage.getItem('userToken');
          const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          };
          const res = await fetch(`${API_URL}/mindset/history`, { headers });
          const json = await res.json();
          if (json.success) {
              setHistory(json.logs);
          }
      } catch (e) {
          console.error("Mindset history error", e);
      }
  };

  const handleSave = async () => {
      toast.info("Saving check-in...");
      try {
          const token = await AsyncStorage.getItem('userToken');
          const res = await fetch(`${API_URL}/mindset/checkin`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                  mood: moodScore,
                  energy: energyScore,
                  stress: stressScore,
                  sleep_hours: sleepHours,
                  sleep_quality: sleepQuality
              })
          });
          const json = await res.json();
          if (json.success) {
              toast.success("Check-in saved");
              fetchHistory();
          }
      } catch {
          toast.error("Failed to save");
      }
  };

  // Process history for charts
  const chartData = history.map(log => log.energy || 0).slice(-7); 
  // Pad with zeros if less than 7
  while (chartData.length < 7) chartData.push(0);

  const sleepData = history.slice(-3).reverse(); // Last 3 days

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.azuka.forest }]}>Mindset</Text>
            <Text style={[styles.subtitle, { color: theme.azuka.sage }]}>Mental health & emotional wellbeing</Text>
          </View>

          <GlassCard style={styles.checkInCard}>
            <Text style={[styles.cardHeading, { color: theme.azuka.forest }]}>Today&apos;s Check-in</Text>
            <View style={styles.sliderContainer}>
              <CheckInSlider 
                label="Mood" 
                value={moodScore} 
                onValueChange={setMoodScore} 
                icon={<Heart size={16} color={theme.azuka.rose} />} 
                color={theme.azuka.rose} 
                labels={['Low', 'Great']} 
              />
              <CheckInSlider 
                label="Energy" 
                value={energyScore} 
                onValueChange={setEnergyScore} 
                icon={<Activity size={16} color={theme.azuka.teal} />} 
                color={theme.azuka.teal} 
                labels={['Low', 'High']} 
              />
              <CheckInSlider 
                label="Stress" 
                value={stressScore} 
                onValueChange={setStressScore} 
                icon={<Brain size={16} color={theme.azukaExtended.sageLight} />} 
                color={theme.azukaExtended.sageLight} 
                labels={['Calm', 'High']} 
              />
              <CheckInSlider 
                label="Sleep Hours" 
                value={sleepHours} 
                onValueChange={setSleepHours} 
                icon={<Moon size={16} color={theme.azuka.teal} />} 
                color={theme.azuka.teal} 
                labels={['4h', '12h']} 
                min={4}
                max={12}
                step={0.5}
                formatValue={(v: number) => `${v}h`}
              />
              <CheckInSlider 
                label="Sleep Quality" 
                value={sleepQuality} 
                onValueChange={setSleepQuality} 
                icon={<Activity size={16} color={theme.azuka.teal} />} 
                color={theme.azuka.teal} 
                labels={['Poor', 'Great']} 
              />
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.azukaExtended.tealDark }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Check-in</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.patternCard}>
            <Text style={[styles.cardHeading, { color: theme.azuka.forest }]}>Weekly Energy</Text>
            <View style={styles.chartRow}>
              {chartData.map((h, i) => (
                <PatternBar key={i} height={h} index={i} label={['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]} />
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.sleepCard}>
             <View style={styles.sleepHeader}>
               <View style={styles.sleepTitleGroup}>
                 <Moon size={20} color={theme.azuka.teal} />
                 <Text style={[styles.cardHeading, { color: theme.azuka.sage }]}>Sleep History</Text>
               </View>
               <Text style={[styles.sleepPrimary, { color: theme.azuka.forest }]}>
                 {sleepData[0]?.sleep_hours || '-'}h
               </Text>
             </View>
             <View style={styles.sleepList}>
                {sleepData.map((log: any, i: number) => (
                    <SleepRow 
                        key={i}
                        day={new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })} 
                        hours={log.sleep_hours || 0} 
                        quality={log.sleep_quality || 0} 
                    />
                ))}
                {sleepData.length === 0 && <Text style={{color: theme.azuka.sage}}>No sleep data yet.</Text>}
             </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// --- Internal Helper Components ---

function CheckInSlider({ label, value, onValueChange, icon, color, labels, min = 0, max = 100, step = 1, formatValue }: any) {
  return (
    <View style={styles.sliderWrapper}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelGroup}>
          {icon}
          <Text style={[styles.sliderLabelText, { color: theme.azuka.forest }]}>{label}</Text>
        </View>
        <Text style={[styles.sliderValueText, { color }]}>
            {formatValue ? formatValue(value) : `${Math.round(value)}%`}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={theme.azuka.forest}
        thumbTintColor={color}
      />
      <View style={styles.sliderFooter}>
        <Text style={[styles.footerLabel, { color: theme.azuka.sage }]}>{labels[0]}</Text>
        <Text style={[styles.footerLabel, { color: theme.azuka.sage }]}>{labels[1]}</Text>
      </View>
    </View>
  );
}

function PatternBar({ height, index, label }: any) {
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withDelay(index * 50, withTiming(height, { duration: 800 }));
  }, [height, index, animatedHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${animatedHeight.value}%`,
  }));

  return (
    <View style={styles.chartCol}>
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <Animated.View style={[styles.barFill, { backgroundColor: theme.azuka.teal }, animatedStyle]} />
      </View>
      <Text style={[styles.barLabel, { color: theme.azuka.sage }]}>{label}</Text>
    </View>
  );
}

function SleepRow({ day, hours, quality }: any) {
  return (
    <View style={[styles.sleepRow, { backgroundColor: theme.inputBackground }]}>
      <Text style={[styles.sleepDayText, { color: theme.azuka.sage }]}>{day}</Text>
      <View style={styles.sleepBarContainer}>
        <View style={styles.sleepInfoRow}>
          <Text style={[styles.sleepHours, { color: theme.azuka.forest }]}>{hours}h</Text>
          <Text style={[styles.sleepQuality, { color: theme.azuka.sage }]}>{quality}%</Text>
        </View>
        <View style={[styles.sleepTrack, { backgroundColor: theme.border }]}>
          {/* Replaced div with View */}
          <View 
            style={{ 
              height: '100%', 
              backgroundColor: theme.azuka.teal, 
              width: `${quality}%`, 
              borderRadius: 3 
            }} 
          />
        </View>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold', marginTop: 8},
  subtitle: { fontSize: 16, fontFamily: 'FunnelDisplay-Regular' },
  checkInCard: { padding: 10, marginBottom: 16 },
  cardHeading: { fontSize: 18, fontWeight: '600', marginBottom: 16, fontFamily: 'FunnelDisplay-Bold' },
  sliderContainer: { gap: 24 },
  sliderWrapper: { gap: 2 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderLabelText: { fontSize: 14, fontWeight: '500', fontFamily: 'FunnelDisplay-Bold' },
  sliderValueText: { fontSize: 14, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  slider: { width: '100%', height: 40 },
  sliderFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular' },
  saveButton: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: 'white', fontWeight: '600', fontSize: 16, fontFamily: 'FunnelDisplay-Bold' },
  patternCard: { padding: 20, marginBottom: 16 },
  chartRow: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 8, marginBottom: 16, marginTop: 14 },
  chartCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, opacity: 0.7 },
  barLabel: { fontSize: 10, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  sleepCard: { padding: 14 },
  sleepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sleepTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sleepPrimary: { fontSize: 20, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  sleepList: { gap: 12 },
  sleepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12 },
  sleepDayText: { fontSize: 12, fontWeight: '600', width: 30, fontFamily: 'FunnelDisplay-Bold' },
  sleepBarContainer: { flex: 1, gap: 4 },
  sleepInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sleepHours: { fontSize: 11, fontFamily: 'FunnelDisplay-Regular' },
  sleepQuality: { fontSize: 11, fontFamily: 'FunnelDisplay-Regular' },
  sleepTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
});