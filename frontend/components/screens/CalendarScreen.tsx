import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet as RNStyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ChevronLeft, Activity, Utensils, Leaf } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme'; 
import { MiniStarIcon, MiniPetalIcon, MiniCrescentIcon } from '../../components/icons/AzukaIcons';

const { width } = Dimensions.get('window');
const GRID_PADDING = 40;
const DAY_CELL_SIZE = (width - (GRID_PADDING * 2) - 26) / 7; 

export default function CalendarScreen({ onBack }: { onBack: () => void }) {
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const insets = useSafeAreaInsets();

  // 1. Generate Month Data with Padding for alignment
  const calendarData = useMemo(() => {
    const days = Array.from({ length: 28 }, (_, i) => {
      const d = i + 1;
      let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' = 'follicular';
      let icon = 'leaf';
      if (d <= 5) { phase = 'menstrual'; icon = 'crescent'; }
      else if (d <= 12) { phase = 'follicular'; icon = 'leaf'; }
      else if (d <= 16) { phase = 'ovulatory'; icon = 'star'; }
      else { phase = 'luteal'; icon = 'petal'; }

      return { date: d, phase, icon, calories: 1757 + (d % 5) * 10, hasWorkout: d % 3 === 0 };
    });

    // February 1, 2026 starts on a Sunday (Index 0). 
    // If it started on Monday, we would add 1 null item.
    const firstDayOfMonth = new Date(2026, 1, 1).getDay(); 
    const padding = Array(firstDayOfMonth).fill(null);
    
    return [...padding, ...days];
  }, []);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return theme.azuka.rose;
      case 'follicular': return theme.azuka.sage;
      case 'ovulatory': return theme.azuka.teal;
      case 'luteal': return theme.azukaExtended.roseLight;
      default: return theme.azuka.forest;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topGap} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft size={22} color={theme.azuka.forest} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.azuka.teal }]}>February 2026</Text>
            <Text style={[styles.headerSub, { color: theme.azuka.sage }]}>Day 22 • Luteal Phase</Text>
          </View>
        </View>

        {/* Toggle */}
        <GlassCard style={RNStyleSheet.flatten(styles.toggleGlass)}>
          <View style={styles.toggleRow}>
            {['month', 'week'].map((m) => (
              <TouchableOpacity key={m} onPress={() => setViewMode(m as any)} style={[styles.toggleBtn, viewMode === m && styles.toggleActive]}>
                <Text style={[styles.toggleText, { color: viewMode === m ? theme.azuka.forest : theme.azuka.sage }]}>{m.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {viewMode === 'week' ? (
          <Animated.View entering={FadeInRight}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
              {calendarData.filter(d => d !== null).slice(18, 25).map((day: any, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedDay(day)}>
                  <GlassCard style={RNStyleSheet.flatten([styles.weekCard, selectedDay?.date === day.date && { borderColor: getPhaseColor(day.phase), borderWidth: 1 }])}>
                    <Text style={styles.weekDateLabel}>FEB {day.date}</Text>
                    <IconMap name={day.icon} color={getPhaseColor(day.phase)} size={18} />
                    <Text style={[styles.weekCalText, { color: theme.azuka.teal }]}>{day.calories} <Text style={{fontSize: 8}}>kcal</Text></Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown}>
            <GlassCard style={RNStyleSheet.flatten(styles.gridGlass)}>
              <View style={styles.gridHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <Text key={i} style={[styles.gridHeaderText, { color: theme.azukaExtended.sageLight }]}>{d}</Text>
                ))}
              </View>
              <View style={styles.gridBody}>
                {calendarData.map((day, idx) => (
                  <View key={idx} style={styles.dayCellContainer}>
                    {day ? (
                      <TouchableOpacity 
                        onPress={() => setSelectedDay(day)}
                        style={[styles.dayCell, day.date === 22 && { backgroundColor: `${getPhaseColor(day.phase)}15`, borderRadius: 12, borderWidth: 1, borderColor: getPhaseColor(day.phase) }]}
                      >
                        <IconMap name={day.icon} color={getPhaseColor(day.phase)} size={12} />
                        <Text style={[styles.dayText, { color: theme.azuka.forest }]}>{day.date}</Text>
                      </TouchableOpacity>
                    ) : <View style={styles.dayCell} />}
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Bottom Details Card */}
        {selectedDay && (
          <Animated.View entering={FadeInDown} style={{ marginTop: 24 }}>
            <GlassCard style={RNStyleSheet.flatten(styles.detailGlass)}>
               <View style={styles.detailHeader}>
                 <View style={[styles.iconCircle, { backgroundColor: `${getPhaseColor(selectedDay.phase)}15` }]}>
                    <IconMap name={selectedDay.icon} color={getPhaseColor(selectedDay.phase)} size={20} />
                 </View>
                 <View>
                   <Text style={[styles.detailTitle, { color: theme.azuka.forest }]}>February {selectedDay.date}</Text>
                   <Text style={[styles.detailSub, { color: getPhaseColor(selectedDay.phase) }]}>{selectedDay.phase.toUpperCase()}</Text>
                 </View>
               </View>
               <View style={styles.detailRow}>
                 <DetailItem icon={<Activity size={16} color={theme.azuka.teal}/>} label="Status" value={selectedDay.hasWorkout ? "Active" : "Recovery"} />
                 <DetailItem icon={<Utensils size={16} color={theme.azuka.sage}/>} label="Intake" value={`${selectedDay.calories} kcal`} />
               </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value }: any) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconBg}>{icon}</View>
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const IconMap = ({ name, color, size }: any) => {
  if (name === 'star') return <MiniStarIcon color={color} />;
  if (name === 'petal') return <MiniPetalIcon color={color} />;
  if (name === 'crescent') return <MiniCrescentIcon color={color} />;
  return <Leaf size={size} color={color} strokeWidth={1.5} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  topGap: { height: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 14 },
  backBtn: { padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.4)' },
  headerTitle: { fontSize: 24, fontWeight: '600', fontFamily: 'FunnelDisplay-SemiBold' },
  headerSub: { fontSize: 14, fontWeight: '500' },
  toggleGlass: { padding: 4, borderRadius: 20, marginBottom: 24 },
  toggleRow: { flexDirection: 'row' },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  toggleActive: { backgroundColor: 'rgba(255,255,255,0.8)' },
  toggleText: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  gridGlass: { padding: 16, borderRadius: 32 },
  gridHeader: { flexDirection: 'row', marginBottom: 15 },
  gridHeaderText: { width: DAY_CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '600', opacity: 0.5 },
  gridBody: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellContainer: { width: DAY_CELL_SIZE, alignItems: 'center', marginBottom: 5 },
  dayCell: { width: DAY_CELL_SIZE - 4, height: 64, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 15, fontWeight: '500', marginTop: 4 },
  weekScroll: { gap: 12, paddingRight: 20 },
  weekCard: { width: 95, padding: 14, alignItems: 'center', borderRadius: 24, gap: 10, height: 120 },
  weekDateLabel: { fontSize: 9, fontWeight: '600', opacity: 0.5 },
  weekCalText: { fontSize: 13, fontWeight: '600' },
  detailGlass: { padding: 15, borderRadius: 32 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 20, fontWeight: '600' },
  detailSub: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  detailIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 9, fontWeight: '600', opacity: 0.4, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '500' }
});