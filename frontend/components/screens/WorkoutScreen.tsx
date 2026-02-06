import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform// FIX: Added missing import
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from 'react-native-safe-area-context'; 
// AND REMOVE SafeAreaView from the 'react-native' import line
import { toast } from "sonner-native"; // Standardizing for your UI library
import { 
  Check, 
  Edit, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Dumbbell 
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { PetalIcon } from '../icons/AzukaIcons';

const { width } = Dimensions.get('window');

export default function WorkoutScreen() {
  const [activeTab, setActiveTab] = useState<'today' | 'next7' | 'history'>('today');
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleTabChange = (tab: 'today' | 'next7' | 'history') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout</Text>
          <Text style={styles.subtitle}>Phase-adapted training</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Today"
            active={activeTab === 'today'}
            onPress={() => handleTabChange('today')}
          />
          <TabButton
            label="Next 7 Days"
            active={activeTab === 'next7'}
            onPress={() => handleTabChange('next7')}
          />
          <TabButton
            label="History"
            active={activeTab === 'history'}
            onPress={() => handleTabChange('history')}
          />
        </View>

        {/* Conditional Content */}
        {activeTab === 'today' && <TodayWorkout />}
        {activeTab === 'next7' && <Next7DaysWorkout />}
        {activeTab === 'history' && <WorkoutHistory />}
      </ScrollView>

      {/* Floating Scroll to Top */}
      {activeTab !== 'today' && (
        <TouchableOpacity 
          style={[styles.scrollToTopBtn, { bottom: insets.bottom + 20 }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={styles.scrollToTopText}>Back to Top</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// --- View: TODAY ---

function TodayWorkout() {
  const workout = {
    phase: 'Luteal',
    readiness: 68,
    exercises: [
      { name: 'Yoga Flow', duration: '20 min' },
      { name: 'Light Cardio Walk', duration: '30 min' },
    ],
    warnings: ['Avoid heavy lifting today due to low readiness.', 'Focus on mobility.'],
  };

  return (
    <View style={styles.viewGap}>
      <Animated.View entering={FadeInUp.delay(100)}>
        <GlassCard style={styles.cardPadding}>
          <View style={styles.rowAlignBetween}>
            <View>
              <Text style={styles.cardSubtitle}>Readiness Score</Text>
              <Text style={styles.readinessValue}>{workout.readiness}%</Text>
              <Text style={styles.readinessLabel}>Based on HRV & Sleep</Text>
            </View>
            <View style={[styles.intensityTag, { backgroundColor: '#C39588', flexDirection: 'row', gap: 6 }]}>
              <PetalIcon size={16} color="#fff" />
              <Text style={styles.tagText}>{workout.phase}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            {workout.warnings.map((w, i) => (
              <View key={i} style={styles.warningBox}>
                <AlertTriangle size={14} color="#BB8585" style={styles.warningIcon} />
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)}>
        <GlassCard style={styles.cardPadding}>
          <Text style={styles.sectionTitle}>Today's Exercises</Text>
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex, i) => (
              <TouchableOpacity key={i} style={styles.exerciseItem}>
                <View style={styles.rowAlign}>
                  <View style={styles.exerciseIconBox}>
                    <Dumbbell size={18} color="#C39588" />
                  </View>
                  <View>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseDuration}>{ex.duration}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#83965F" />
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      <View style={styles.actionGrid}>
        <ActionButton 
          primary 
          icon={<Check size={20} color="white" />} 
          label="Mark Done" 
          onPress={() => toast.success("Workout completed!")}
        />
        <ActionButton 
          icon={<Edit size={20} color="#1C3927" />} 
          label="Edit" 
          onPress={() => toast.info("Edit mode enabled")}
        />
        <ActionButton 
          icon={<RefreshCw size={20} color="#1C3927" />} 
          label="Regen" 
          onPress={() => toast.success("Workout refreshed")}
        />
      </View>
    </View>
  );
}

// --- View: NEXT 7 DAYS ---
function Next7DaysWorkout() {
  const weekPlan = [
    { day: 'Today', date: 'Feb 7', phase: 'Menstrual', intensity: 'Recovery', color: '#BB8585', duration: 25 },
    { day: 'Sun', date: 'Feb 8', phase: 'Follicular', intensity: 'Moderate', color: '#83965F', duration: 40 },
    { day: 'Mon', date: 'Feb 9', phase: 'Follicular', intensity: 'Moderate', color: '#83965F', duration: 50 },
  ];

  return (
    <View style={styles.viewGap}>
      {weekPlan.map((day, i) => (
        <GlassCard key={i} style={styles.cardPaddingSmall}>
          <View style={styles.rowAlignBetween}>
            <View style={styles.rowAlign}>
              <View style={styles.dateBox}>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <Text style={styles.dateLabel}>{day.date}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View>
                <Text style={styles.phaseLabel}>{day.phase}</Text>
                <Text style={styles.durationLabel}>{day.duration} min</Text>
              </View>
            </View>
            <View style={[styles.intensityTag, { backgroundColor: day.color }]}>
              <Text style={styles.tagText}>{day.intensity}</Text>
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

// --- View: HISTORY ---
function WorkoutHistory() {
  const history = [
    { date: 'Feb 6', type: 'Yoga Flow', duration: 45, phase: 'Menstrual' },
    { date: 'Feb 4', type: 'Pilates Sculpt', duration: 50, phase: 'Luteal' },
  ];

  return (
    <View style={styles.viewGap}>
      {history.map((item, i) => (
        <GlassCard key={i} style={styles.cardPaddingSmall}>
          <View style={styles.rowAlignBetween}>
            <View style={styles.rowAlign}>
              <View style={styles.checkCircle}>
                <Check size={18} color="#29555F" />
              </View>
              <View>
                <Text style={styles.historyType}>{item.type}</Text>
                <Text style={styles.historyMeta}>{item.date} • {item.duration} min</Text>
              </View>
            </View>
            <Text style={styles.historyPhase}>{item.phase}</Text>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

// --- UI Helpers ---
function TabButton({ label, active, onPress }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.tabBtn, active ? styles.tabBtnActive : styles.tabBtnInactive]}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ActionButton({ icon, label, primary, onPress }: any) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.actionBtn, primary ? styles.actionBtnPrimary : styles.actionBtnSecondary]}
    >
      {icon}
      <Text style={[styles.actionBtnText, primary ? { color: 'white' } : { color: '#1C3927' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scrollContent: { padding: 16 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '700', color: '#1C3927' },
  subtitle: { fontSize: 16, color: '#83965F' },
  tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  tabBtnActive: { 
    backgroundColor: 'white', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 
  },
  tabBtnInactive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#29555F' },
  tabLabelInactive: { color: '#83965F' },
  viewGap: { gap: 16 },
  cardPadding: { padding: 20 },
  cardPaddingSmall: { padding: 16 },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAlignBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSubtitle: { fontSize: 13, color: '#83965F', marginBottom: 4 },
  readinessValue: { fontSize: 28, fontWeight: '700', color: '#1C3927' },
  readinessLabel: { fontSize: 11, color: '#83965F' },
  intensityTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tagText: { color: 'white', fontSize: 11, fontWeight: '700' },
  warningBox: { flexDirection: 'row', backgroundColor: 'rgba(187,133,133,0.1)', borderWidth: 1, borderColor: 'rgba(187,133,133,0.2)', padding: 12, borderRadius: 12, marginBottom: 8 },
  warningIcon: { marginRight: 8 },
  warningText: { fontSize: 12, color: '#1C3927', flex: 1, lineHeight: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C3927', marginBottom: 16 },
  exerciseList: { gap: 10 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.5)', padding: 14, borderRadius: 16 },
  exerciseIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(195,149,136,0.15)', alignItems: 'center', justifyContent: 'center' },
  exerciseName: { fontSize: 15, fontWeight: '600', color: '#1C3927' },
  exerciseDuration: { fontSize: 13, color: '#83965F' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnPrimary: { backgroundColor: '#1C3927' },
  actionBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  actionBtnText: { fontSize: 11, fontWeight: '600' },
  dateBox: { alignItems: 'center', minWidth: 50 },
  dayLabel: { fontSize: 10, color: '#83965F', textTransform: 'uppercase' },
  dateLabel: { fontSize: 16, fontWeight: '700', color: '#1C3927' },
  verticalDivider: { width: 1, height: 30, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 4 },
  phaseLabel: { fontSize: 15, fontWeight: '600', color: '#1C3927' },
  durationLabel: { fontSize: 13, color: '#83965F' },
  checkCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(41,85,95,0.15)', alignItems: 'center', justifyContent: 'center' },
  historyType: { fontSize: 15, fontWeight: '600', color: '#1C3927' },
  historyMeta: { fontSize: 13, color: '#83965F' },
  historyPhase: { fontSize: 12, color: '#83965F', fontWeight: '500' },
  scrollToTopBtn: { position: 'absolute', alignSelf: 'center', backgroundColor: '#29555F', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 5 },
  scrollToTopText: { color: 'white', fontWeight: '600', fontSize: 12 }
});