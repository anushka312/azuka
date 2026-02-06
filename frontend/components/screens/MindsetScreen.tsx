import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { toast } from "sonner-native"; 
import Slider from '@react-native-community/slider';
import { Brain, Heart, Moon, Activity } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 

export default function MindsetScreen() {
  const [moodScore, setMoodScore] = useState(70);
  const [energyScore, setEnergyScore] = useState(65);
  const [stressScore, setStressScore] = useState(45);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Mindset</Text>
            <Text style={styles.subtitle}>Mental health & emotional wellbeing</Text>
          </View>

          <GlassCard style={styles.checkInCard}>
            <Text style={styles.cardHeading}>Today's Check-in</Text>
            <View style={styles.sliderContainer}>
              <CheckInSlider label="Mood" value={moodScore} onValueChange={setMoodScore} icon={<Heart size={16} color="#C39588" />} color="#C39588" labels={['Low', 'Great']} />
              <CheckInSlider label="Energy" value={energyScore} onValueChange={setEnergyScore} icon={<Activity size={16} color="#29555F" />} color="#29555F" labels={['Low', 'High']} />
              <CheckInSlider label="Stress" value={stressScore} onValueChange={setStressScore} icon={<Brain size={16} color="#BB8585" />} color="#BB8585" labels={['Calm', 'High']} />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => toast.success("Check-in saved")}>
              <Text style={styles.saveButtonText}>Save Check-in</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.patternCard}>
            <Text style={styles.cardHeading}>Weekly Progress</Text>
            <View style={styles.chartRow}>
              {[65, 70, 68, 72, 70, 75, 70].map((h, i) => (
                <PatternBar key={i} height={h} index={i} label={['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]} />
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.sleepCard}>
             <View style={styles.sleepHeader}>
               <View style={styles.sleepTitleGroup}>
                 <Moon size={20} color="#29555F" />
                 <Text style={styles.cardHeading}>Sleep Quality</Text>
               </View>
               <Text style={styles.sleepPrimary}>7.5h</Text>
             </View>
             <SleepRow day="Mon" hours={7.2} quality={75} />
             <SleepRow day="Tue" hours={8.0} quality={85} />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ... helper components (CheckInSlider, PatternBar, SleepRow) remain the same ...

// --- Internal Helper Components ---

function CheckInSlider({ label, value, onValueChange, icon, color, labels }: any) {
  return (
    <View style={styles.sliderWrapper}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelGroup}>
          {icon}
          <Text style={styles.sliderLabelText}>{label}</Text>
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
        maximumTrackTintColor="rgba(0,0,0,0.1)"
        thumbTintColor={color}
      />
      <View style={styles.sliderFooter}>
        <Text style={styles.footerLabel}>{labels[0]}</Text>
        <Text style={styles.footerLabel}>{labels[1]}</Text>
      </View>
    </View>
  );
}

// FIX 2: Re-written with Reanimated 3 logic
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
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

function SymptomTag({ label, active: initialActive }: any) {
  const [active, setActive] = useState(initialActive);
  return (
    <Pressable 
      onPress={() => setActive(!active)}
      style={[styles.tag, active ? styles.tagActive : styles.tagInactive]}
    >
      <Text style={[styles.tagText, active ? styles.tagTextActive : styles.tagTextInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SleepRow({ day, hours, quality }: any) {
  return (
    <View style={styles.sleepRow}>
      <Text style={styles.sleepDayText}>{day}</Text>
      <View style={styles.sleepBarContainer}>
        <View style={styles.sleepInfoRow}>
          <Text style={styles.sleepHours}>{hours}h</Text>
          <Text style={styles.sleepQuality}>{quality}%</Text>
        </View>
        <View style={styles.sleepTrack}>
          <View style={[styles.sleepFill, { width: `${quality}%` }]} />
        </View>
      </View>
    </View>
  );
}

// --- Styles (Maintained for UI consistency) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scrollContent: { padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1C3927' },
  subtitle: { fontSize: 16, color: '#83965F' },
  checkInCard: { padding: 20, marginBottom: 16 },
  cardHeading: { fontSize: 16, fontWeight: '700', color: '#1C3927', marginBottom: 16 },
  sliderContainer: { gap: 24 },
  sliderWrapper: { gap: 8 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderLabelText: { fontSize: 14, fontWeight: '500', color: '#1C3927' },
  sliderValueText: { fontSize: 14, fontWeight: '700' },
  slider: { width: '100%', height: 40 },
  sliderFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12, color: '#83965F' },
  saveButton: { backgroundColor: '#1C3927', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  patternCard: { padding: 20, marginBottom: 16 },
  chartRow: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 8, marginBottom: 16 },
  chartCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: '#29555F', borderTopLeftRadius: 8, borderTopRightRadius: 8, opacity: 0.7 },
  barLabel: { fontSize: 10, color: '#83965F', fontWeight: '600' },
  insightBox: { backgroundColor: 'rgba(131,150,95,0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(131,150,95,0.2)' },
  insightText: { fontSize: 12, color: '#1C3927', lineHeight: 18 },
  symptomCard: { padding: 20, marginBottom: 16 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2 },
  tagActive: { backgroundColor: 'rgba(195,149,136,0.15)', borderColor: '#C39588' },
  tagInactive: { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'transparent' },
  tagText: { fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: '#C39588' },
  tagTextInactive: { color: '#83965F' },
  sleepCard: { padding: 20 },
  sleepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sleepTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sleepPrimary: { fontSize: 20, fontWeight: '700', color: '#1C3927' },
  sleepSecondary: { fontSize: 12, color: '#83965F' },
  sleepList: { gap: 12 },
  sleepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.4)', padding: 10, borderRadius: 12 },
  sleepDayText: { fontSize: 12, color: '#83965F', fontWeight: '600', width: 30 },
  sleepBarContainer: { flex: 1, gap: 4 },
  sleepInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sleepHours: { fontSize: 11, color: '#1C3927' },
  sleepQuality: { fontSize: 11, color: '#83965F' },
  sleepTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
  sleepFill: { height: '100%', backgroundColor: '#29555F', borderRadius: 3 },
});