import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { lightTheme as theme } from '@/constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { 
  Check, 
  Edit, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Dumbbell,
  Flame,
  Layers,
  Zap,
  Target,
  Utensils
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard'; 
import { PetalIcon, DropIcon, SparkleIcon, MoonIcon } from '../icons/AzukaIcons';
import { API_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = 'http://localhost:5000/api';

export default function WorkoutScreen() {
  const [activeTab, setActiveTab] = useState<'today' | 'next7' | 'history'>('today');
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  
  const [plan, setPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkoutData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Fetch Plan
      const planRes = await fetch(`${API_URL}/workout/plan`, { headers });
      const planJson = await planRes.json();
      if (planJson.success) {
        setPlan(planJson.plan);
      }

      // Fetch History
      const histRes = await fetch(`${API_URL}/workout/history`, { headers });
      const histJson = await histRes.json();
      if (histJson.success) {
        setHistory(histJson.history);
      }
    } catch (error) {
      console.error("Fetch Workouts Error", error);
      toast.error("Failed to load workout history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutData();
  }, []);

  const handleTabChange = (tab: 'today' | 'next7' | 'history') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onRegen = async () => {
    try {
        toast.info("Regenerating plan for current phase...");
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${API_URL}/workout/regenerate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({}) // triggers generation
        });
        const json = await res.json();
        if (json.success) {
            toast.success("Plan updated!");
            fetchWorkoutData();
        } else {
            toast.error("Failed to generate plan");
        }
    } catch {
        toast.error("Error regenerating plan");
    }
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
        {loading ? (
            <ActivityIndicator size="large" color={theme.azuka.teal} style={{ marginTop: 40 }} />
        ) : (
            <>
                {activeTab === 'today' && <TodayWorkout plan={plan} onRefresh={fetchWorkoutData} onRegen={onRegen} />}
                {activeTab === 'next7' && <Next7DaysWorkout plan={plan} />}
                {activeTab === 'history' && <WorkoutHistory history={history} />}
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- View: TODAY ---

function TodayWorkout({ plan, onRefresh, onRegen }: { plan: any, onRefresh: () => void, onRegen: () => void }) {
  // Find today's workout from plan
  const todayDateStr = new Date().toDateString();
  const todayPlan = plan?.days?.find((d: any) => new Date(d.date).toDateString() === todayDateStr);
  
  const [showInput, setShowInput] = useState(false);
  const [calories, setCalories] = useState('');

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editIntensity, setEditIntensity] = useState('');

  useEffect(() => {
    if (todayPlan) {
        const w = todayPlan.workout || {};
        setEditTitle(w.title || '');
        setEditType(w.type || '');
        setEditDuration(w.duration_min !== undefined && w.duration_min !== null ? String(w.duration_min) : '');
        setEditIntensity(w.intensity || '');
    }
  }, [todayPlan]);

  const handleSaveEdit = async () => {
      try {
          const token = await AsyncStorage.getItem('userToken');
          const workoutDate = todayPlan?.date || new Date().toISOString();
          
          const updates = {
              title: editTitle,
              type: editType,
              duration_min: parseInt(editDuration) || 0,
              intensity: editIntensity
          };

          const res = await fetch(`${API_URL}/workout/edit`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ date: workoutDate, updates })
          });
          
          const json = await res.json();
          if (json.success) {
              toast.success("Plan updated!");
              setShowEditModal(false);
              onRefresh();
          } else {
              toast.error("Failed to update plan");
          }
      } catch {
          toast.error("Error updating plan");
      }
  };

  const handleMarkDone = async () => {
    if (!todayPlan) return;
    
    if (!showInput) {
        setShowInput(true);
        return;
    }

    if (calories.trim() && isNaN(parseInt(calories))) {
        toast.error("Please enter a valid number for calories");
        return;
    }

    try {
        const token = await AsyncStorage.getItem('userToken');
        // Use plan date if available to match backend logic, otherwise use today
        const workoutDate = todayPlan?.date || new Date().toISOString();
        
        const body: any = { date: workoutDate };
        if (calories.trim()) {
            body.caloriesBurned = parseInt(calories);
        }

        const res = await fetch(`${API_URL}/workout/complete`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        if (json.success) {
            toast.success("Workout completed!");
            setShowInput(false);
            setCalories('');
            onRefresh();
        } else {
            toast.error("Failed to mark complete");
        }
    } catch {
        toast.error("Error marking complete");
    }
  };

  if (!todayPlan) {
      return (
          <View style={styles.viewGap}>
              <GlassCard style={styles.cardPadding}>
                  <Text style={[styles.sectionTitle, { color: theme.azuka.forest }]}>No workout planned for today.</Text>
                  <Text style={[styles.subtitle, { color: theme.azuka.sage }]}>Enjoy your rest day or generate a new plan.</Text>
                  <View style={{ marginTop: 20 }}>
                    <ActionButton 
                        icon={<RefreshCw size={20} color={theme.azuka.forest} />} 
                        label="Generate Plan" 
                        onPress={onRegen}
                    />
                  </View>
              </GlassCard>
          </View>
      );
  }

  const isCompleted = todayPlan.status === 'completed';
  const phaseConfig = getPhaseConfig(todayPlan.phase);
  const workoutDetails = todayPlan.workout || {};

  return (
    <View style={styles.viewGap}>
      <Animated.View entering={FadeInUp.delay(100)}>
        <GlassCard style={styles.cardPadding}>
          <View style={styles.rowAlignBetween}>
            <View>
              <Text style={[styles.cardSubtitle, { color: theme.azuka.sage }]}>Readiness Score</Text>
              <Text style={[styles.readinessValue, { color: theme.azuka.forest }]}>
                {todayPlan.readiness === 'Push' ? 'High' : todayPlan.readiness === 'Recover' ? 'Low' : 'Med'}
              </Text>
              <Text style={[styles.readinessLabel, { color: theme.azuka.sage }]}>{todayPlan.readiness} Intensity</Text>
            </View>
            <View style={[styles.intensityTag, { backgroundColor: phaseConfig.color, flexDirection: 'row', gap: 6 }]}>
              <phaseConfig.icon size={16} color="#fff" />
              <Text style={styles.tagText}>{phaseConfig.label}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            {todayPlan.notes && (
               <View style={[styles.warningBox, { backgroundColor: `${theme.azuka.rose}15`, borderColor: `${theme.azuka.rose}30` }]}>
                <AlertTriangle size={14} color={theme.azuka.rose} style={styles.warningIcon} />
                <Text style={[styles.warningText, { color: theme.azuka.forest }]}>{todayPlan.notes}</Text>
              </View>
            )}
            
            {/* AI Analysis Section */}
            <View style={[styles.analysisContainer, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
              <View style={styles.analysisHeader}>
                <Zap size={14} color={theme.azuka.teal} />
                <Text style={[styles.analysisTitle, { color: theme.azuka.teal }]}>AI WORKOUT ANALYSIS</Text>
              </View>
              
              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                   <Target size={16} color={theme.azuka.forest} style={{ marginBottom: 4 }} />
                   <Text style={[styles.statLabel, { color: theme.azuka.sage }]}>Muscles</Text>
                   <Text style={[styles.statValue, { color: theme.azuka.forest }]}>
                     {workoutDetails.muscles?.join(", ") || "Full Body"}
                   </Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.statItem}>
                   <Flame size={16} color={theme.azuka.rose} style={{ marginBottom: 4 }} />
                   <Text style={[styles.statLabel, { color: theme.azuka.sage }]}>Burn</Text>
                   <Text style={[styles.statValue, { color: theme.azuka.forest }]}>
                     ~{workoutDetails.calories_burn_est || 300} kcal
                   </Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.statItem}>
                   <Layers size={16} color={theme.azuka.forest} style={{ marginBottom: 4 }} />
                   <Text style={[styles.statLabel, { color: theme.azuka.sage }]}>Volume</Text>
                   <Text style={[styles.statValue, { color: theme.azuka.forest }]}>
                     {workoutDetails.volume || "Standard"}
                   </Text>
                </View>
              </View>
              
              <Text style={[styles.analysisText, { color: theme.azuka.forest }]}>
                &quot;{todayPlan.analysis || `This session is optimized for your ${todayPlan.phase} phase. Lower intensity but high engagement to support hormone stability.`}&quot;
              </Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Fueling Section */}
      <Animated.View entering={FadeInUp.delay(150)}>
        <GlassCard style={styles.cardPaddingSmall}>
            <View style={styles.rowAlign}>
                <View style={[styles.checkCircle, { backgroundColor: `${theme.azuka.sun}20`, width: 32, height: 32 }]}>
                    <Utensils size={16} color={theme.azuka.sun} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.azuka.forest, marginBottom: 0, fontSize: 14 }]}>Fueling Target</Text>
            </View>
            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={[styles.statValue, { fontSize: 20, color: theme.azuka.forest }]}>
                        {todayPlan.calorie_target?.min || 2000}-{todayPlan.calorie_target?.max || 2200}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.azuka.sage }]}>Daily Calories</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.statValue, { fontSize: 14, color: theme.azuka.forest }]}>{todayPlan.macro_targets?.protein || 120}g</Text>
                        <Text style={[styles.statLabel, { fontSize: 10, color: theme.azuka.sage }]}>Protein</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.statValue, { fontSize: 14, color: theme.azuka.forest }]}>{todayPlan.macro_targets?.carbs || 200}g</Text>
                        <Text style={[styles.statLabel, { fontSize: 10, color: theme.azuka.sage }]}>Carbs</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.statValue, { fontSize: 14, color: theme.azuka.forest }]}>{todayPlan.macro_targets?.fats || 65}g</Text>
                        <Text style={[styles.statLabel, { fontSize: 10, color: theme.azuka.sage }]}>Fats</Text>
                    </View>
                </View>
            </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)}>
        <GlassCard style={styles.cardPaddingSmall}>
          <View style={styles.rowAlignBetween}>
             <Text style={[styles.sectionTitle, { color: theme.azuka.forest, marginBottom: 0 }]}>Today&apos;s Session</Text>
             {isCompleted && (
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                     <Check size={16} color={theme.azuka.teal} />
                     <Text style={{ color: theme.azuka.teal, fontWeight: '600', fontSize: 12 }}>COMPLETED</Text>
                 </View>
             )}
          </View>
          
          <View style={[styles.exerciseList, { marginTop: 16 }]}>
              <TouchableOpacity style={[styles.exerciseItem, { backgroundColor: theme.inputBackground }]}>
                <View style={styles.rowAlign}>
                  <View style={[styles.exerciseIconBox, { backgroundColor: `${theme.azuka.rose}20` }]}>
                    <Dumbbell size={18} color={theme.azuka.rose} />
                  </View>
                  <View>
                    <Text style={[styles.exerciseName, { color: theme.azuka.forest }]}>{todayPlan.workout.title}</Text>
                    <Text style={[styles.exerciseDuration, { color: theme.azuka.sage }]}>
                        {todayPlan.workout.type} • {todayPlan.workout.duration_min} min
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={theme.azuka.sage} />
              </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onRegen} style={{ alignSelf: 'center', marginTop: 10 }}>
            <Text style={{ color: theme.azuka.sage, fontSize: 12, textDecorationLine: 'underline' }}>
              Need to adjust? Regenerate Plan
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>

      {showInput ? (
          <View style={[styles.actionGrid, { alignItems: 'center' }]}>
             <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, height: 70, justifyContent: 'center', paddingHorizontal: 20 }}>
                 <TextInput 
                     placeholder="Calories burned?"
                     placeholderTextColor={theme.azuka.sage}
                     value={calories}
                     onChangeText={setCalories}
                     keyboardType="numeric"
                     autoFocus
                     style={{ fontSize: 16, fontFamily: 'FunnelDisplay-Bold', color: theme.azuka.forest }}
                 />
             </View>
             <TouchableOpacity onPress={handleMarkDone} style={[styles.actionBtn, { backgroundColor: theme.azuka.forest, flex: 0, width: 70 }]}>
                 <Check size={24} color="white" />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => setShowInput(false)} style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 0, flex: 0, width: 60 }]}>
                 <Text style={{ color: theme.azuka.rose, fontFamily: 'FunnelDisplay-Bold' }}>Cancel</Text>
             </TouchableOpacity>
          </View>
      ) : (
          <View style={styles.actionGrid}>
            {!isCompleted && (
                <ActionButton 
                primary 
                icon={<Check size={20} color="white" />} 
                label="Mark Done" 
                onPress={handleMarkDone}
                />
            )}
            <ActionButton 
            icon={<Edit size={20} color={theme.azuka.forest} />} 
            label="Edit" 
            onPress={() => setShowEditModal(true)}
            />
            <ActionButton 
            icon={<RefreshCw size={20} color={theme.azuka.forest} />} 
            label="Regen" 
            onPress={onRegen}
            />
          </View>
      )}
      
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Workout</Text>
                  
                  <Text style={styles.label}>Title</Text>
                  <TextInput 
                      style={styles.input} 
                      value={editTitle} 
                      onChangeText={setEditTitle} 
                      placeholder="Workout Title"
                      placeholderTextColor={theme.azuka.sage}
                  />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Type</Text>
                          <TextInput 
                              style={styles.input} 
                              value={editType} 
                              onChangeText={setEditType} 
                              placeholder="e.g. Strength"
                              placeholderTextColor={theme.azuka.sage}
                          />
                      </View>
                      <View style={{ flex: 1 }}>
                          <Text style={styles.label}>Duration (min)</Text>
                          <TextInput 
                              style={styles.input} 
                              value={editDuration} 
                              onChangeText={setEditDuration} 
                              keyboardType="numeric"
                              placeholder="30"
                              placeholderTextColor={theme.azuka.sage}
                          />
                      </View>
                  </View>

                  <Text style={styles.label}>Intensity</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                      {['Low', 'Moderate', 'High'].map(level => (
                          <TouchableOpacity 
                              key={level} 
                              onPress={() => setEditIntensity(level)}
                              style={[
                                  styles.chip, 
                                  editIntensity === level ? { backgroundColor: theme.azuka.teal } : { backgroundColor: theme.inputBackground }
                              ]}
                          >
                              <Text style={[styles.chipText, editIntensity === level && { color: 'white' }]}>{level}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => setShowEditModal(false)} style={[styles.modalBtn, { backgroundColor: theme.inputBackground }]}>
                          <Text style={{ color: theme.azuka.forest, fontFamily: 'FunnelDisplay-Bold' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveEdit} style={[styles.modalBtn, { backgroundColor: theme.azuka.forest }]}>
                          <Text style={{ color: 'white', fontFamily: 'FunnelDisplay-Bold' }}>Save Changes</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    </View>
  );
}

// --- View: NEXT 7 DAYS ---
function Next7DaysWorkout({ plan }: { plan: any }) {
  if (!plan || !plan.days) return <Text style={{ padding: 20, textAlign: 'center', color: theme.azuka.sage }}>No upcoming plan.</Text>;

  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Filter for future days
  const futureDays = plan.days.filter((d: any) => new Date(d.date) > today).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={styles.viewGap}>
      {futureDays.map((day: any, i: number) => {
        const dateObj = new Date(day.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return (
            <GlassCard key={i} style={styles.cardPaddingSmall}>
            <View style={styles.rowAlignBetween}>
                <View style={styles.rowAlign}>
                <View style={styles.dateBox}>
                    <Text style={[styles.dayLabel, { color: theme.azuka.sage }]}>{dayName}</Text>
                    <Text style={[styles.dateLabel, { color: theme.azuka.forest }]}>{dateStr}</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
                <View>
                    <Text style={[styles.phaseLabel, { color: theme.azuka.forest }]}>{day.phase}</Text>
                    <Text style={[styles.durationLabel, { color: theme.azuka.sage }]}>{day.workout.duration_min} min • {day.workout.type}</Text>
                </View>
                </View>
                <View style={[styles.intensityTag, { backgroundColor: day.readiness === 'Push' ? theme.azuka.rose : theme.azuka.sage }]}>
                <Text style={styles.tagText}>{day.workout.intensity}</Text>
                </View>
            </View>
            </GlassCard>
        );
      })}
    </View>
  );
}

// --- View: HISTORY ---
function WorkoutHistory({ history }: { history: any[] }) {
  if (!history || history.length === 0) return <Text style={{ padding: 20, textAlign: 'center', color: theme.azuka.sage }}>No workout history yet.</Text>;

  return (
    <View style={styles.viewGap}>
      {history.map((item, i) => {
          const dateObj = new Date(item.date);
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <GlassCard key={i} style={styles.cardPaddingSmall}>
            <View style={styles.rowAlignBetween}>
                <View style={styles.rowAlign}>
                <View style={[styles.checkCircle, { backgroundColor: `${theme.azuka.teal}20` }]}>
                    <Check size={18} color={theme.azuka.teal} />
                </View>
                <View>
                    <Text style={[styles.historyType, { color: theme.azuka.forest }]}>{item.planned?.type || 'Workout'}</Text>
                    <Text style={[styles.historyMeta, { color: theme.azuka.sage }]}>{dateStr} • {item.planned?.duration_min} min</Text>
                </View>
                </View>
                <Text style={[styles.historyPhase, { color: theme.azuka.sage }]}>Completed</Text>
            </View>
            </GlassCard>
          );
      })}
    </View>
  );
}

// --- UI Helpers ---

const getPhaseConfig = (phase: string) => {
  const p = phase?.toLowerCase() || '';
  if (p.includes('menstru')) return { color: theme.azuka.rose, icon: DropIcon, label: 'Menstrual' };
  if (p.includes('follicular')) return { color: theme.azuka.teal, icon: SparkleIcon, label: 'Follicular' };
  if (p.includes('ovulat')) return { color: theme.azuka.sun, icon: PetalIcon, label: 'Ovulatory' };
  if (p.includes('luteal')) return { color: theme.azuka.lavender, icon: MoonIcon, label: 'Luteal' };
  return { color: theme.azuka.teal, icon: SparkleIcon, label: 'Follicular' };
};

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
  historyMeta: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular' },
  historyPhase: { fontSize: 12, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold' },
  analysisContainer: { marginTop: 12, padding: 12, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  analysisTitle: { fontSize: 10, fontFamily: 'FunnelDisplay-Bold', letterSpacing: 1 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  verticalLine: { width: 1, height: '80%', backgroundColor: 'rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 10, fontFamily: 'FunnelDisplay-Regular', marginBottom: 2 },
  statValue: { fontSize: 13, fontFamily: 'FunnelDisplay-Bold' },
  analysisText: { fontSize: 12, fontFamily: 'FunnelDisplay-Regular', fontStyle: 'italic', lineHeight: 16, opacity: 0.8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'FunnelDisplay-Bold', color: theme.azuka.forest, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: theme.azuka.sage, marginBottom: 6, fontFamily: 'FunnelDisplay-Regular' },
  input: { backgroundColor: theme.inputBackground, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: 'FunnelDisplay-Regular', color: theme.azuka.forest, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  chipText: { fontSize: 13, fontFamily: 'FunnelDisplay-Bold', color: theme.azuka.forest },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
