import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { toast } from "sonner-native"; 
import Slider from '@react-native-community/slider';
import { Brain, Heart, Moon, Activity } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme';

export default function MindsetScreen() {
  const [moodScore, setMoodScore] = useState(70);
  const [energyScore, setEnergyScore] = useState(65);
  const [stressScore, setStressScore] = useState(45);
  const insets = useSafeAreaInsets();

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
            <Text style={[styles.cardHeading, { color: theme.azuka.forest }]}>Today's Check-in</Text>
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
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.azukaExtended.tealDark }]} 
              onPress={() => toast.success("Check-in saved")}
            >
              <Text style={styles.saveButtonText}>Save Check-in</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.patternCard}>
            <Text style={[styles.cardHeading, { color: theme.azuka.forest }]}>Weekly Progress</Text>
            <View style={styles.chartRow}>
              {[65, 70, 68, 72, 70, 75, 70].map((h, i) => (
                <PatternBar key={i} height={h} index={i} label={['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]} />
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.sleepCard}>
             <View style={styles.sleepHeader}>
               <View style={styles.sleepTitleGroup}>
                 <Moon size={20} color={theme.azuka.teal} />
                 <Text style={[styles.cardHeading, { color: theme.azuka.sage }]}>Sleep Quality</Text>
               </View>
               <Text style={[styles.sleepPrimary, { color: theme.azuka.forest }]}>7.5h</Text>
             </View>
             <View style={styles.sleepList}>
                <SleepRow day="Mon" hours={7.2} quality={75} />
                <SleepRow day="Tue" hours={8.0} quality={85} />
             </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// --- Internal Helper Components ---

function CheckInSlider({ label, value, onValueChange, icon, color, labels }: any) {
  return (
    <View style={styles.sliderWrapper}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelGroup}>
          {icon}
          <Text style={[styles.sliderLabelText, { color: theme.azuka.forest }]}>{label}</Text>
        </View>
        <Text style={[styles.sliderValueText, { color }]}>{Math.round(value)}%</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
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
  }, []);

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