import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Activity, Utensils, AlertCircle, X } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { MiniStarIcon, MiniPetalIcon, MiniCrescentIcon } from '../../components/icons/AzukaIcons';

const { width } = Dimensions.get('window');

interface DayData {
  date: number;
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  icon: 'star' | 'petal' | 'crescent';
  hasWorkout: boolean;
  hasFood: boolean;
  hasSymptoms: boolean;
  energy?: number;
}

export default function CalendarScreen() {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const insets = useSafeAreaInsets();

  // Mock data for the cycle
  const monthData: DayData[] = Array.from({ length: 28 }, (_, i) => {
    const d = i + 1;
    let phase: DayData['phase'] = 'follicular';
    let icon: DayData['icon'] = 'star';
    
    if (d <= 5) { phase = 'menstrual'; icon = 'crescent'; }
    else if (d <= 12) { phase = 'follicular'; icon = 'star'; }
    else if (d <= 16) { phase = 'ovulatory'; icon = 'star'; }
    else { phase = 'luteal'; icon = 'petal'; }

    return {
      date: d,
      phase,
      icon,
      hasWorkout: d % 3 === 0,
      hasFood: d % 2 === 0,
      hasSymptoms: d > 20,
      energy: Math.floor(Math.random() * 40) + 50
    };
  });

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return '#C39588';
      case 'ovulatory': return '#29555F';
      case 'follicular': return '#83965F';
      case 'luteal': return '#BB8585';
      default: return '#83965F';
    }
  };

  const IconMap = ({ name, color }: { name: string, color: string }) => {
    if (name === 'star') return <MiniStarIcon color={color} />;
    if (name === 'petal') return <MiniPetalIcon color={color} />;
    return <MiniCrescentIcon color={color} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>February 2026</Text>
            <Text style={styles.headerSub}>Cycle Day 22 • Luteal Phase</Text>
          </View>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.roundBtn}><ChevronLeft size={20} color="#29555F" /></TouchableOpacity>
            <TouchableOpacity style={styles.roundBtn}><ChevronRight size={20} color="#29555F" /></TouchableOpacity>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.toggleRow}>
          {['month', 'week'].map((m) => (
            <TouchableOpacity 
              key={m} 
              onPress={() => setViewMode(m as any)}
              style={[styles.toggleBtn, viewMode === m && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, viewMode === m && styles.toggleTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar Grid */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard style={styles.gridCard}>
            <View style={styles.gridHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={styles.gridHeaderText}>{d}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {monthData.map((day) => {
                const color = getPhaseColor(day.phase);
                const isToday = day.date === 22;
                return (
                  <TouchableOpacity
                    key={day.date}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.dayCell, 
                      { backgroundColor: isToday ? `${color}35` : `${color}15` },
                      isToday && { borderColor: color, borderWidth: 2 }
                    ]}
                  >
                    <View style={styles.dayIcon}><IconMap name={day.icon} color={color} /></View>
                    <Text style={styles.dayText}>{day.date}</Text>
                    <View style={styles.dotRow}>
                      {day.hasWorkout && <View style={[styles.dot, { backgroundColor: '#29555F' }]} />}
                      {day.hasFood && <View style={[styles.dot, { backgroundColor: '#83965F' }]} />}
                      {day.hasSymptoms && <View style={[styles.dot, { backgroundColor: '#C39588' }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Legend */}
        <GlassCard style={styles.legendCard}>
          <Text style={styles.legendTitle}>Phase Legend</Text>
          <View style={styles.legendGrid}>
             <LegendItem icon={<MiniStarIcon color="#29555F" />} label="Peak" />
             <LegendItem icon={<MiniPetalIcon color="#C39588" />} label="Recovery" />
             <LegendItem icon={<MiniCrescentIcon color="#83965F" />} label="Transition" />
             <LegendItem icon={<AlertCircle size={14} color="#BB8585" />} label="Risk" />
          </View>
        </GlassCard>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedDay} transparent animationType="slide" onRequestClose={() => setSelectedDay(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedDay(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Day {selectedDay?.date}</Text>
              <TouchableOpacity onPress={() => setSelectedDay(null)}><X color="#83965F" /></TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.label}>Phase</Text>
              <Text style={[styles.val, { color: getPhaseColor(selectedDay?.phase || '') }]}>
                {selectedDay?.phase.toUpperCase()}
              </Text>
              
              <Text style={styles.label}>Energy Level</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${selectedDay?.energy}%`, backgroundColor: getPhaseColor(selectedDay?.phase || '') }]} />
              </View>

              <View style={styles.activitySummary}>
                <Text style={styles.label}>Logged Activities</Text>
                <View style={styles.activityIcons}>
                   {selectedDay?.hasWorkout && <Activity size={18} color="#29555F" />}
                   {selectedDay?.hasFood && <Utensils size={18} color="#83965F" />}
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const LegendItem = ({ icon, label }: any) => (
  <View style={styles.lItem}>{icon}<Text style={styles.lText}>{label}</Text></View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F5' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1C3927' },
  headerSub: { color: '#83965F', fontSize: 14 },
  navRow: { flexDirection: 'row', gap: 10 },
  roundBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)' },
  toggleActive: { backgroundColor: '#fff', elevation: 1 },
  toggleText: { color: '#83965F', fontSize: 14 },
  toggleTextActive: { color: '#29555F', fontWeight: '600' },
  gridCard: { padding: 16 },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  gridHeaderText: { color: '#83965F', fontSize: 12, fontWeight: '600', width: (width - 70) / 7, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCell: { width: (width - 82) / 7, aspectRatio: 1, borderRadius: 12, padding: 4, alignItems: 'center', justifyContent: 'center' },
  dayIcon: { position: 'absolute', top: 4, left: 4 },
  dayText: { fontWeight: '700', color: '#1C3927', fontSize: 14 },
  dotRow: { flexDirection: 'row', gap: 2, position: 'absolute', bottom: 6 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legendCard: { marginTop: 20, padding: 16 },
  legendTitle: { fontWeight: '700', marginBottom: 12, color: '#1C3927' },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  lItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  lText: { fontSize: 12, color: '#1C3927' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1C3927' },
  modalBody: { paddingBottom: 20 },
  label: { color: '#83965F', fontSize: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1 },
  val: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  barBg: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  activitySummary: { marginTop: 10 },
  activityIcons: { flexDirection: 'row', gap: 15, marginTop: 10 }
});