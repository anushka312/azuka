import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { lightTheme as theme } from '@/constants/theme'; // Updated import to use lightTheme directly
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.azuka.cream }]}>
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.azuka.forest }]}>Workout</Text>
          <Text style={[styles.subtitle, { color: theme.azuka.sage }]}>Phase-adapted training</Text>
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
              <Text style={[styles.cardSubtitle, { color: theme.azuka.sage }]}>Readiness Score</Text>
              <Text style={[styles.readinessValue, { color: theme.azuka.forest }]}>{workout.readiness}%</Text>
              <Text style={[styles.readinessLabel, { color: theme.azuka.sage }]}>Based on HRV & Sleep</Text>
            </View>
            <View style={[styles.intensityTag, { backgroundColor: theme.azuka.rose, flexDirection: 'row', gap: 6 }]}>
              <PetalIcon size={16} color="#fff" />
              <Text style={styles.tagText}>{workout.phase}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            {workout.warnings.map((w, i) => (
              <View key={i} style={[styles.warningBox, { backgroundColor: `${theme.azuka.rose}15`, borderColor: `${theme.azuka.rose}30` }]}>
                <AlertTriangle size={14} color={theme.azuka.rose} style={styles.warningIcon} />
                <Text style={[styles.warningText, { color: theme.azuka.forest }]}>{w}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)}>
        <GlassCard style={styles.cardPaddingSmall}>
          <Text style={[styles.sectionTitle, { color: theme.azuka.forest }]}>Today's Exercises</Text>
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex, i) => (
              <TouchableOpacity key={i} style={[styles.exerciseItem, { backgroundColor: theme.inputBackground }]}>
                <View style={styles.rowAlign}>
                  <View style={[styles.exerciseIconBox, { backgroundColor: `${theme.azuka.rose}20` }]}>
                    <Dumbbell size={18} color={theme.azuka.rose} />
                  </View>
                  <View>
                    <Text style={[styles.exerciseName, { color: theme.azuka.forest }]}>{ex.name}</Text>
                    <Text style={[styles.exerciseDuration, { color: theme.azuka.sage }]}>{ex.duration}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.azuka.sage} />
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
          icon={<Edit size={20} color={theme.azuka.forest} />} 
          label="Edit" 
          onPress={() => toast.info("Edit mode enabled")}
        />
        <ActionButton 
          icon={<RefreshCw size={20} color={theme.azuka.forest} />} 
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
    { day: 'Today', date: 'Feb 7', phase: 'Menstrual', intensity: 'Recovery', color: theme.azuka.rose, duration: 25 },
    { day: 'Sun', date: 'Feb 8', phase: 'Follicular', intensity: 'Moderate', color: theme.azuka.sage, duration: 40 },
    { day: 'Mon', date: 'Feb 9', phase: 'Follicular', intensity: 'Moderate', color: theme.azuka.sage, duration: 50 },
  ];

  return (
    <View style={styles.viewGap}>
      {weekPlan.map((day, i) => (
        <GlassCard key={i} style={styles.cardPaddingSmall}>
          <View style={styles.rowAlignBetween}>
            <View style={styles.rowAlign}>
              <View style={styles.dateBox}>
                <Text style={[styles.dayLabel, { color: theme.azuka.sage }]}>{day.day}</Text>
                <Text style={[styles.dateLabel, { color: theme.azuka.forest }]}>{day.date}</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
              <View>
                <Text style={[styles.phaseLabel, { color: theme.azuka.forest }]}>{day.phase}</Text>
                <Text style={[styles.durationLabel, { color: theme.azuka.sage }]}>{day.duration} min</Text>
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
              <View style={[styles.checkCircle, { backgroundColor: `${theme.azuka.teal}20` }]}>
                <Check size={18} color={theme.azuka.teal} />
              </View>
              <View>
                <Text style={[styles.historyType, { color: theme.azuka.forest }]}>{item.type}</Text>
                <Text style={[styles.historyMeta, { color: theme.azuka.sage }]}>{item.date} • {item.duration} min</Text>
              </View>
            </View>
            <Text style={[styles.historyPhase, { color: theme.azuka.sage }]}>{item.phase}</Text>
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
      style={[styles.tabBtn, active ? styles.tabBtnActive : { backgroundColor: 'rgba(255,255,255,0.4)' }]}
    >
      <Text style={[styles.tabLabel, { color: active ? theme.azuka.teal : theme.azuka.sage }]}>
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
      style={[
        styles.actionBtn, 
        primary ? { backgroundColor: theme.azuka.forest } : { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }
      ]}
    >
      {icon}
      <Text style={[styles.actionBtnText, { color: primary ? 'white' : theme.azuka.forest }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  subtitle: { fontSize: 16, fontFamily: 'FunnelDisplay-Regular' },
  tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  tabBtnActive: { 
    backgroundColor: 'white', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 
  },
  tabLabel: { fontSize: 13, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  viewGap: { gap: 16 },
  cardPadding: { padding: 20 },
  cardPaddingSmall: { padding: 16 },
  rowAlign: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAlignBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSubtitle: { fontSize: 13, marginBottom: 4, fontFamily: 'FunnelDisplay-Regular' },
  readinessValue: { fontSize: 28, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  readinessLabel: { fontSize: 11, fontFamily: 'FunnelDisplay-Regular' },
  intensityTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tagText: { color: 'white', fontSize: 11, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  warningBox: { flexDirection: 'row', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 8 },
  warningIcon: { marginRight: 8 },
  warningText: { fontSize: 12, flex: 1, lineHeight: 16, fontFamily: 'FunnelDisplay-Regular' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, fontFamily: 'FunnelDisplay-Bold' },
  exerciseList: { gap: 10 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16 },
  exerciseIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  exerciseName: { fontSize: 15, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  exerciseDuration: { fontSize: 13, fontFamily: 'FunnelDisplay-Regular' },
  actionGrid: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnText: { fontSize: 11, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  dateBox: { alignItems: 'center', minWidth: 50 },
  dayLabel: { fontSize: 10, textTransform: 'uppercase', fontFamily: 'FunnelDisplay-Regular' },
  dateLabel: { fontSize: 16, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  verticalDivider: { width: 1, height: 30, marginHorizontal: 4 },
  phaseLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  durationLabel: { fontSize: 13, fontFamily: 'FunnelDisplay-Regular' },
  checkCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  historyType: { fontSize: 15, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  historyMeta: { fontSize: 13, fontFamily: 'FunnelDisplay-Regular' },
  historyPhase: { fontSize: 12, fontWeight: '500', fontFamily: 'FunnelDisplay-Regular' },
  scrollToTopBtn: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 5 },
  scrollToTopText: { color: 'white', fontWeight: '600', fontSize: 12, fontFamily: 'FunnelDisplay-Bold' }
});