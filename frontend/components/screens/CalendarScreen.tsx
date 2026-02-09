import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet as RNStyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ChevronLeft, Activity, Utensils, Leaf, Plus, X, Frown, Meh, Smile } from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { lightTheme as theme } from '@/constants/theme'; 
import { MiniStarIcon, MiniPetalIcon, MiniCrescentIcon } from '../../components/icons/AzukaIcons';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';


const { width } = Dimensions.get('window');
const GRID_PADDING = 40;
const DAY_CELL_SIZE = (width - (GRID_PADDING * 2) - 26) / 7; 

const SYMPTOMS_LIST = [
  "Cramps", "Headache", "Bloating", "Fatigue", "Acne", "Insomnia", "Nausea", "Back Pain", "Cravings (Sweet)", "Cravings (Salty)"
];

export default function CalendarScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<any[]>([]);

  // Log Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [logNote, setLogNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Insight Modal State
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [cravingInsight, setCravingInsight] = useState<any>(null);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    // Set to 1st of month to avoid skipping months (e.g. Jan 31 -> Feb 28/Mar 3)
    newDate.setDate(1);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const response = await fetch(`${API_URL}/calendar/month?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`, { headers });
      const json = await response.json();
      if (json.success) {
        setCalendarData(json.data);
        // If current month, select today
        const today = new Date();
        if (today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
            const todayItem = json.data.find((d: any) => d && d.date === today.getDate());
            if (todayItem) setSelectedDay(todayItem);
        } else {
            setSelectedDay(null);
        }
      }
    } catch (error) {
      console.error("Calendar Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSymptoms = async (symptoms: string[]) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        
        toast.info("Analyzing biological signals...");

        const response = await fetch(`${API_URL}/symptoms/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ symptoms })
        });
        
        const json = await response.json();
        
        if (json.success && json.analysis) {
            const recommendation = json.analysis.today_focus || json.analysis.recommendation || {};
            setCravingInsight({
                detected_pattern: "Biological Signal Detected",
                biological_trigger: `Fuel Risk: ${json.analysis.metabolic?.fuel_risk != null ? (json.analysis.metabolic.fuel_risk * 100).toFixed(0) : '--'}%`,
                azuka_swap: {
                    item: "Recommended Action",
                    timing: "Immediate",
                    reason: recommendation.nutrition_tip || "Hydrate and rest."
                },
                rationale: (json.analysis.metabolic?.rationale || "") + " " + (json.analysis.psychology?.rationale || "")
            });
            setShowInsightModal(true);
        } else {
            toast.info("Symptom logged. No specific alert needed.");
        }
    } catch (error) {
        console.error("Analysis Error", error);
        toast.error("Analysis skipped due to connection.");
    }
  };

  const handleOpenLog = () => {
    if (!selectedDay) return;
    // Reset form
    setSelectedSymptoms([]);
    setSelectedMood(null);
    setLogNote("");
    setShowLogModal(true);
  };

  const handleSaveLog = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
        const token = await AsyncStorage.getItem('userToken');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Log Symptoms
        if (selectedSymptoms.length > 0) {
            await fetch(`${API_URL}/calendar/log`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date: selectedDay.fullDate,
                    type: 'symptom',
                    data: { symptoms: selectedSymptoms }
                })
            });
        }

        // Log Mood
        if (selectedMood) {
            await fetch(`${API_URL}/calendar/log`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date: selectedDay.fullDate,
                    type: 'mood',
                    data: { mood: selectedMood, note: logNote }
                })
            });
        }

        toast.success("Logged successfully");
        setShowLogModal(false);
        fetchCalendarData(); // Refresh

        // Check for cravings and trigger analysis
        if (selectedSymptoms.length > 0) {
            analyzeSymptoms(selectedSymptoms);
        }
    } catch (error) {
        toast.error("Failed to log");
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return theme.azuka.rose;
      case 'follicular': return theme.azuka.sage;
      case 'ovulatory': return theme.azuka.teal;
      case 'luteal': return theme.azukaExtended.roseLight;
      default: return theme.azuka.forest;
    }
  };
  
  // Icon mapper helper
  const IconMap = ({ name, color, size }: any) => {
     if (name === 'crescent') return <MiniCrescentIcon size={size} color={color} />;
     if (name === 'star') return <MiniStarIcon size={size} color={color} />;
     if (name === 'petal') return <MiniPetalIcon size={size} color={color} />;
     if (name === 'dumbbell') return <Activity size={size} color={color} />;
     return <Leaf size={size} color={color} />;
  };

  const weekDays = React.useMemo(() => {
    if (!calendarData.length) return [];
    
    // Default to today/selected or first valid
    let targetIndex = -1;
    
    // 1. Try selected day
    if (selectedDay) {
        targetIndex = calendarData.findIndex(d => d && d.date === selectedDay.date);
    }
    
    // 2. Try today (if in current month)
    if (targetIndex === -1) {
        const today = new Date();
        if (today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
             targetIndex = calendarData.findIndex(d => d && d.date === today.getDate());
        }
    }

    // 3. Fallback to first valid day
    if (targetIndex === -1) {
        targetIndex = calendarData.findIndex(d => d !== null);
    }
    
    if (targetIndex === -1) return [];

    const weekRow = Math.floor(targetIndex / 7);
    const start = weekRow * 7;
    const end = start + 7;
    
    return calendarData.slice(start, end).filter(d => d !== null);
  }, [calendarData, selectedDay, currentDate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topGap} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft size={22} color={theme.azuka.forest} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <ChevronLeft size={20} color={theme.azuka.sage} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.azuka.teal }]}>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <ChevronLeft size={20} color={theme.azuka.sage} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
            </View>
            {selectedDay ? (
                 <Text style={[styles.headerSub, { color: theme.azuka.sage }]}>
                     Day {selectedDay.date} • {selectedDay.phase ? (selectedDay.phase.charAt(0).toUpperCase() + selectedDay.phase.slice(1)) : 'Cycle'} Phase
                 </Text>
            ) : (
                <Text style={[styles.headerSub, { color: theme.azuka.sage }]}>Select a date</Text>
            )}
          </View>
          {/* Add Log Button in Header if Day Selected */}
          {selectedDay && (
              <TouchableOpacity onPress={handleOpenLog} style={styles.headerLogBtn}>
                  <Plus size={20} color="#FFF" />
              </TouchableOpacity>
          )}
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

        {loading ? (
             <ActivityIndicator size="large" color={theme.azuka.sage} style={{ marginTop: 50 }} />
        ) : viewMode === 'week' ? (
          <Animated.View entering={FadeInRight}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
              {weekDays.map((day: any, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedDay(day)}>
                  <GlassCard style={RNStyleSheet.flatten([styles.weekCard, selectedDay?.date === day.date && { borderColor: getPhaseColor(day.phase), borderWidth: 1 }])}>
                    <Text style={styles.weekDateLabel}>DAY {day.date}</Text>
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
                        style={[styles.dayCell, selectedDay?.date === day.date && { backgroundColor: `${getPhaseColor(day.phase)}15`, borderRadius: 12, borderWidth: 1, borderColor: getPhaseColor(day.phase) }]}
                      >
                        <View style={{ marginBottom: 4 }}>
                            <IconMap name={day.icon} color={getPhaseColor(day.phase)} size={12} />
                        </View>
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
          <Animated.View entering={FadeInDown}>
            <View style={{ marginTop: 24 }}>
              <GlassCard style={RNStyleSheet.flatten(styles.detailGlass)}>
                <View style={styles.detailHeader}>
                 <View style={[styles.iconCircle, { backgroundColor: `${getPhaseColor(selectedDay.phase)}15` }]}>
                    <IconMap name={selectedDay.icon} color={getPhaseColor(selectedDay.phase)} size={20} />
                 </View>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.detailTitle, { color: theme.azuka.forest }]}>
                        {new Date().toLocaleString('default', { month: 'long' })} {selectedDay.date}
                   </Text>
                   <Text style={[styles.detailSub, { color: getPhaseColor(selectedDay.phase) }]}>{selectedDay.phase.toUpperCase()}</Text>
                 </View>
                 {/* Quick Log Button (Visual only for now) */}
                 <TouchableOpacity style={styles.addLogBtn} onPress={handleOpenLog}>
                     <Plus size={20} color="#FFF" />
                 </TouchableOpacity>
               </View>
               <View style={styles.detailRow}>
                 {selectedDay.workoutDetails && (selectedDay.workoutDetails.type || selectedDay.workoutDetails.duration) ? (
                    <DetailItem 
                        icon={<Activity size={16} color={theme.azuka.teal}/>} 
                        label="Workout" 
                        value={`${selectedDay.workoutDetails.type || 'Workout'} • ${selectedDay.workoutDetails.duration || 0}m`} 
                    />
                 ) : (
                    <DetailItem icon={<Activity size={16} color={theme.azuka.teal}/>} label="Status" value="Rest Day" />
                 )}
                 <DetailItem icon={<Utensils size={16} color={theme.azuka.sage}/>} label="Intake" value={`${selectedDay.calories} kcal`} />
               </View>
               
               {/* Mood Note */}
               {selectedDay.moodNote && (
                   <View style={{ marginTop: 15 }}>
                       <Text style={styles.sectionHeader}>JOURNAL</Text>
                       <View style={[styles.symptomTag, { width: '100%', backgroundColor: theme.azukaExtended.creamLight, alignItems: 'flex-start' }]}>
                            <Text style={[styles.symptomText, { fontStyle: 'italic' }]}>&quot;{selectedDay.moodNote}&quot;</Text>
                        </View>
                   </View>
               )}
               {selectedDay.symptoms && selectedDay.symptoms.length > 0 && (
                   <View style={{ marginTop: 15 }}>
                       <Text style={styles.sectionHeader}>LOGGED SYMPTOMS</Text>
                       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                           {selectedDay.symptoms.map((s: string, i: number) => (
                               <View key={i} style={styles.symptomTag}>
                                   <Text style={styles.symptomText}>{s}</Text>
                               </View>
                           ))}
                       </View>
                   </View>
               )}
            </GlassCard>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      {/* Log Modal */}
      <Modal
        visible={showLogModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Log Symptoms</Text>
                    <TouchableOpacity onPress={() => setShowLogModal(false)}>
                        <X size={24} color={theme.azuka.forest} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.sectionTitle}>Physical Symptoms</Text>
                    <View style={styles.tagContainer}>
                        {SYMPTOMS_LIST.map(s => (
                            <TouchableOpacity 
                                key={s}
                                onPress={() => {
                                    if (selectedSymptoms.includes(s)) {
                                        setSelectedSymptoms(selectedSymptoms.filter(i => i !== s));
                                    } else {
                                        setSelectedSymptoms([...selectedSymptoms, s]);
                                    }
                                }}
                                style={[
                                    styles.tagBtn, 
                                    selectedSymptoms.includes(s) && { backgroundColor: theme.azuka.teal, borderColor: theme.azuka.teal }
                                ]}
                            >
                                <Text style={[
                                    styles.tagBtnText,
                                    selectedSymptoms.includes(s) && { color: '#FFF' }
                                ]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Mood</Text>
                    <View style={styles.moodRow}>
                        {['Happy', 'Neutral', 'Sad'].map(m => (
                            <TouchableOpacity 
                                key={m}
                                onPress={() => setSelectedMood(m)}
                                style={[styles.moodBtn, selectedMood === m && { backgroundColor: theme.azukaExtended.roseLight }]}
                            >
                                {m === 'Happy' && <Smile size={24} color={theme.azuka.forest} />}
                                {m === 'Neutral' && <Meh size={24} color={theme.azuka.forest} />}
                                {m === 'Sad' && <Frown size={24} color={theme.azuka.forest} />}
                                <Text style={styles.moodText}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Note</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="Add a note..."
                        value={logNote}
                        onChangeText={setLogNote}
                        multiline
                    />

                    <TouchableOpacity 
                        style={styles.saveBtn}
                        onPress={handleSaveLog}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Entry</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
      </Modal>
      {/* Craving Insight Modal */}
      <Modal
        visible={showInsightModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInsightModal(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.azuka.forest }]}>Craving Insight</Text>
                    <TouchableOpacity onPress={() => setShowInsightModal(false)}>
                        <X size={24} color={theme.azuka.sage} />
                    </TouchableOpacity>
                </View>
                
                {cravingInsight && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[styles.insightCard, { backgroundColor: theme.azukaExtended.creamLight }]}>
                            <Text style={[styles.insightLabel, { color: theme.azuka.sage }]}>Detected Pattern</Text>
                            <Text style={[styles.insightValue, { color: theme.azuka.forest }]}>{cravingInsight.detected_pattern}</Text>
                        </View>

                        <View style={[styles.insightCard, { backgroundColor: theme.azukaExtended.roseLight }]}>
                            <Text style={[styles.insightLabel, { color: theme.azuka.sage }]}>Biological Trigger</Text>
                            <Text style={[styles.insightValue, { color: theme.azuka.forest }]}>{cravingInsight.biological_trigger}</Text>
                        </View>

                        <View style={[styles.swapCard, { borderColor: theme.azuka.teal }]}>
                            <View style={styles.swapHeader}>
                                <MiniStarIcon color={theme.azuka.teal} size={20} />
                                <Text style={[styles.swapTitle, { color: theme.azuka.teal }]}>The Azuka Swap</Text>
                            </View>
                            <Text style={[styles.swapItem, { color: theme.azuka.forest }]}>{cravingInsight.azuka_swap?.item}</Text>
                            <Text style={[styles.swapDetail, { color: theme.azuka.sage }]}>
                                {cravingInsight.azuka_swap?.timing} • {cravingInsight.azuka_swap?.reason}
                            </Text>
                        </View>

                        <Text style={[styles.rationaleText, { color: theme.azuka.sage }]}>
                            {cravingInsight.rationale}
                        </Text>
                    </ScrollView>
                )}

                <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: theme.azuka.forest, marginTop: 20 }]}
                    onPress={() => setShowInsightModal(false)}
                >
                    <Text style={styles.primaryButtonText}>Got it</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
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

// const IconMap = ({ name, color, size }: any) => {
//   if (name === 'star') return <MiniStarIcon color={color} />;
//   if (name === 'petal') return <MiniPetalIcon color={color} />;
//   if (name === 'crescent') return <MiniCrescentIcon color={color} />;
//   return <Leaf size={size} color={color} strokeWidth={1.5} />;
// };

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
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'FunnelDisplay-SemiBold', color: theme.azuka.forest },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.azuka.forest, marginTop: 20, marginBottom: 10 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  tagBtnText: { color: theme.azuka.forest, fontSize: 14 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  moodBtn: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  moodText: { marginTop: 8, color: theme.azuka.forest, fontWeight: '500' },
  input: { backgroundColor: theme.inputBackground, padding: 16, borderRadius: 16, height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: theme.azuka.forest, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerLogBtn: { backgroundColor: theme.azuka.teal, padding: 8, borderRadius: 12 },
  addLogBtn: { backgroundColor: theme.azuka.sage, padding: 8, borderRadius: 12 }, 
  symptomTag: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  symptomText: { fontSize: 12, color: '#555' },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 20, fontWeight: '600' },
  detailSub: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  detailIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 9, fontWeight: '600', opacity: 0.4, textTransform: 'uppercase' },
  detailValue: { fontSize: 14, fontWeight: '500' },
  rationaleText: { fontSize: 14, lineHeight: 20, marginTop: 15, fontStyle: 'italic' },
  primaryButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  insightCard: { padding: 15, borderRadius: 16, marginBottom: 10 },
  insightLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  insightValue: { fontSize: 16, fontWeight: '600' },
  swapCard: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  swapHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  swapTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  swapItem: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  swapDetail: { fontSize: 12 }
});